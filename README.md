<div align="center">

# 🌐 Connectify | Social Media Web Application

A full-featured social networking platform built with **Next.js, TypeScript, and Redux Toolkit**, supporting user authentication, interactive posts, comments, follow systems, and real-time state management.

[![Live Demo](https://img.shields.io/badge/Live_Demo-0A66C2?style=for-the-badge&logo=vercel&logoColor=white)](https://socialmediaapp-livid.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React.js-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## 📸 Preview

<div align="center">

![Social Media App Feed](./screenshots/social-preview.png)

</div>

---

## ✨ Features

- **User Authentication & Profile:** Secure login, registration, password change, and profile photo uploads connected to a JWT-authenticated REST API.
- **Interactive Posts:** Create, edit, and delete posts with image uploads, likes, comments, and sharing capabilities.
- **Social Interactions:** Follow/unfollow system, comments management (edit/delete/like), and user profile pages.
- **Advanced State Management:** Centralized state managed via **Redux Toolkit** (covering auth, posts, comments, profile, and notifications) with asynchronous thunks and per-item loading states.
- **Performance & Pagination:** Implemented "Load More" pagination with duplicate filtering and skeleton loaders for smooth UX.
- **Responsive UI:** Modern and clean interface styled using Tailwind CSS, MUI, and shadcn/ui.

---

## 🛠️ Tech Stack

| Area | Technologies |
|---|---|
| Frontend Framework | Next.js, React, TypeScript[cite: 3] |
| State Management | Redux Toolkit (Async Thunks)[cite: 3] |
| Styling & UI | Tailwind CSS, MUI, shadcn/ui[cite: 3] |
| Forms & Validation | Formik, Yup[cite: 3] |
| API & Network | Axios, RESTful APIs, JWT Authentication[cite: 3] |
| Deployment | Vercel |

---

## 🔑 Demo Account

Use this account to explore authenticated features:

| Email | Password |
|---|---|
| `demo@example.com` | `123456` |

---

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone [https://github.com/Reem-Osama11/](https://github.com/Reem-Osama11/)[repo-name].git

# 2. Move into the project folder
cd [repo-name]

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
