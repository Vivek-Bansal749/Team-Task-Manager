# Team Task Manager

A full-stack task and project management application with role-based access control.

## Structure

- `backend/` — Express + MongoDB API
- `frontend/client/` — Vite + React frontend

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend/client
npm install
npm run dev
```

## GitHub Deployment

1. Create a repository named `team-task-manager` on GitHub.
2. Add the remote locally:

```bash
git remote add origin git@github.com:<your-username>/team-task-manager.git
```

3. Push the main branch:

```bash
git push -u origin main
```

If you want me to create the remote repo automatically, provide a GitHub personal access token or install the GitHub CLI (`gh`).
