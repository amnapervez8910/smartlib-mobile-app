# 📚 SmartLib — Library Management System

> A smart university library mobile app built with React Native & Supabase

![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green?style=flat-square)
![Built With](https://img.shields.io/badge/Built%20With-React%20Native%20%7C%20Expo-blue?style=flat-square)
![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-orange?style=flat-square)
![Status](https://img.shields.io/badge/Status-Completed-brightgreen?style=flat-square)

---

## 📖 About

SmartLib is a mobile application that digitizes and streamlines library operations. It provides role-based dashboards for **Librarians**, **Faculty**, and **Students** with real-time book tracking, issue/return management, and public catalog browsing — no login required.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native (Expo) |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Real-time | Supabase Realtime |

---

## ⚙️ Features

### 🔴 Librarian
- Add, update, delete, search & filter books
- Manage student and faculty members
- Approve/reject book issue requests
- Track issued books and due dates

### 🟡 Student
- Browse and search books by title, author, or category
- Request books and track request status
- Return books and view overdue list

### 🟢 Faculty
- Issue and return books
- Recommend new books to librarian
- View reports (issued, returned, overdue)

### 🌐 Public (No Login)
- Browse the full library catalog
- Search and filter books

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `books` | Book information |
| `issued_books` | Tracks issued books & status |
| `book_recommendation` | Faculty book recommendations |
| `members` | Student & faculty records |
| `requests` | Issue and return requests |

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/smartlib.git
cd smartlib

# Install dependencies
npm install

# Configure Supabase — update these in your config file
const supabaseUrl = "https://YOUR_PROJECT_ID.supabase.co";
const supabaseAnonKey = "YOUR_PUBLIC_ANON_KEY";

# Start the app
npx expo start
```

> ⚠️ Always use `anon public` key — never use `service_role` in frontend code.

---

## 📋 Non-Functional Requirements

- ⚡ **Performance** — Fast book browsing and search
- 🔒 **Security** — Role-based access control
- 📈 **Scalability** — Easily supports more users and books
- 🔄 **Reliability** — Real-time availability updates
- 🛠️ **Maintainability** — Modular, clean code structure