# 🚀 RoleRadar AI

An AI-powered full-stack job search platform that aggregates jobs from multiple sources, analyzes resumes using AI, and recommends the most relevant opportunities through intelligent matching.

## 🌐 Live Demo

https://role-radar-ai.vercel.app/

## 📂 GitHub Repository

https://github.com/rishabh1606bits/RoleRadar-Ai

---

# ✨ Features

### 🔍 Smart Job Search

- Search jobs by title, company, or keyword
- Filter by:
  - Location
  - Salary Range
  - Job Type
  - Experience Level
  - Remote / Hybrid / Onsite
- Sort jobs by relevance and latest postings

---

### 🤖 AI Resume Analysis

- Upload PDF resumes
- AI-powered resume analysis using Groq
- Resume summary
- Skill extraction
- Missing skills identification
- Personalized improvement suggestions

---

### 🎯 AI Job Recommendations

- Resume-based job matching
- AI-generated "Why this job matches you" explanation
- Intelligent recommendation ranking

---

### 👤 Authentication

- JWT Authentication
- Secure Login/Register
- Protected Routes

---

### ☁ Resume Management

- Resume upload
- Cloudinary integration
- Secure cloud storage

---

### 🔄 Automatic Job Sync

- Daily cron job
- Fetches latest jobs automatically
- Removes duplicate listings
- Keeps database updated

---

### 📱 Responsive UI

- Mobile Friendly
- Modern React UI
- Fast loading with Vite

---

# 🛠 Tech Stack

## Frontend

- React.js
- Vite
- React Router
- Axios
- CSS3

## Backend

- Node.js
- Express.js
- Prisma ORM
- JWT Authentication
- Multer

## Database

- PostgreSQL (Neon)

## AI

- Groq API

## Cloud

- Cloudinary

## Deployment

- Vercel
- Render

---

# 🏗 Architecture

```
                React + Vite
                     │
                     ▼
              Express REST API
                     │
              Prisma ORM
                     │
             PostgreSQL (Neon)

        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   Groq AI     Cloudinary     Cron Jobs
 Resume AI     Resume Upload   Job Sync

                     │
                     ▼
      Adzuna • Remotive • Arbeitnow APIs
```

---

# 📂 Folder Structure

```
RoleRadar-Ai
│
├── client
│   ├── src
│   ├── components
│   ├── pages
│   ├── services
│   └── context
│
├── server
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── prisma
│   ├── cron
│   └── utils
│
└── README.md
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/rishabh1606bits/RoleRadar-Ai.git
```

## Backend

```bash
cd server
npm install
```

Create `.env`

```env
DATABASE_URL=

JWT_SECRET=

GROQ_API_KEY=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

PORT=5000
```

Run

```bash
npm run dev
```

---

## Frontend

```bash
cd client
npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:5000
```

Run

```bash
npm run dev
```

---

# 🚀 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |
| Resume Storage | Cloudinary |

---

# 🎯 Future Improvements

- LinkedIn OAuth
- Email Job Alerts
- AI Cover Letter Generator
- Interview Preparation Assistant
- Company Reviews
- Saved Searches
- Advanced Analytics Dashboard
- Multi-language Support

---

# 📸 Screenshots

Add screenshots of:

- Home Page
- Job Search
- AI Resume Analysis
- Job Details
- User Dashboard

---

# 👨‍💻 Author

**Rishabh Raj**

GitHub:
https://github.com/rishabh1606bits



---

⭐ If you found this project useful, consider giving it a star!
