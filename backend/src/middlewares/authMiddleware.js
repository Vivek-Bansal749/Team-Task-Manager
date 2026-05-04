import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // check token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // extract token
    const token = authHeader.split(" ")[1];

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user data to request
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;