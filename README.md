# TaskFlow — Project Management App

A full-stack web app for managing projects and tasks with role-based access control (Admin/Member).

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Mongoose)
- **Auth**: JWT + bcryptjs

---

## Features

- **Authentication** — Signup/Login with JWT, role selection (Admin/Member)
- **Projects** — Create, view, delete projects; add/remove team members
- **Tasks** — Create, assign, edit, delete tasks with status & priority
- **Dashboard** — Stats (total, todo, in-progress, done, overdue) + recent tasks
- **Role-Based Access**:
  - **Admin** — Full access to all projects, tasks, and users
  - **Member** — Access only to projects they belong to; can update task status

---

## Project Structure

```
├── backend/
│   ├── controllers/       # authController, projectController, taskController, userController
│   ├── middleware/        # auth.js (JWT + role guard)
│   ├── models/            # User, Project, Task schemas
│   ├── routes/            # auth, projects, tasks, users
│   ├── server.js
│   └── .env               # (not committed)
└── frontend/
    ├── src/
    │   ├── api/           # axios instance with interceptors
    │   ├── context/       # AuthContext
    │   ├── components/    # Navbar, PrivateRoute
    │   └── pages/         # Login, Signup, Dashboard, Projects, ProjectDetail
    └── .env               # (not committed)
```

---

## Setup & Run Locally

### Prerequisites
- Node.js >= 16
- MongoDB Atlas cluster (free tier works)

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/taskflow.git
cd taskflow
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/projectmanager?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key
```

```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
npm start
```

App runs at **http://localhost:3000**

---

## REST API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/projects` | List projects | All |
| POST | `/api/projects` | Create project | All |
| GET | `/api/projects/:id` | Get project | Member+ |
| PUT | `/api/projects/:id` | Update project | Owner/Admin |
| DELETE | `/api/projects/:id` | Delete project | Owner/Admin |
| POST | `/api/projects/:id/members` | Add member by email | Owner/Admin |
| DELETE | `/api/projects/:id/members/:userId` | Remove member | Owner/Admin |

### Tasks
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/tasks/dashboard` | Dashboard stats | All |
| POST | `/api/tasks` | Create task | Project member |
| GET | `/api/tasks/project/:projectId` | List tasks | Project member |
| PUT | `/api/tasks/:id` | Update task | Member (status only) / Admin |
| DELETE | `/api/tasks/:id` | Delete task | Creator/Admin |

### Users
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/users` | List all users | Auth |
| PUT | `/api/users/:id/role` | Change user role | Admin only |

---

## Deployment

### Backend — Render / Railway
1. Push code to GitHub
2. Create a new Web Service on [Render](https://render.com)
3. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT`
4. Build command: `npm install` | Start command: `node server.js`

### Frontend — Vercel / Netlify
1. Set `REACT_APP_API_URL` to your deployed backend URL
2. Build command: `npm run build` | Publish directory: `build`

---

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<strong-random-secret>
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:5000/api
```
