# 📚 SmartLib — Library Management System

A smart university library mobile app built with **React Native (Expo Snack)** & **Supabase**

---

## 📖 About

SmartLib digitizes and streamlines library operations. It provides role-based dashboards for **Librarians**, **Faculty**, and **Students** with real-time book tracking, issue/return management, and public catalog browsing — no login required.

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

## 🗄️ Database — Supabase (PostgreSQL)

| Table | Purpose |
|-------|---------|
| `books` | Book information |
| `issued_books` | Tracks issued books & status |
| `book_recommendation` | Faculty book recommendations |
| `members` | Student & faculty records |
| `requests` | Issue and return requests |

---

## 📋 Non-Functional Requirements

- ⚡ **Performance** — Fast book browsing and search
- 🔒 **Security** — Role-based access control
- 📈 **Scalability** — Easily supports more users and books
- 🔄 **Reliability** — Real-time availability updates
- 🛠️ **Maintainability** — Modular, clean code structure
