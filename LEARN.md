# 🎓 Learning and Contributing to Doc@Home

Welcome, developer! This document is your comprehensive guide to understanding, running, and contributing to the **Doc@Home** platform. Whether you're a student, a potential collaborator, or a recruiter, this guide will walk you through the architecture, technology stack, and core concepts that power this application.

## ✨ Core Philosophy & Vision

Doc@Home is more than just an app; it's a **full-stack MERN ecosystem** designed to solve a critical, dual-sided problem in the Indian healthcare market.

1.  **For Patients:** To provide a seamless, secure, and trustworthy way to access high-quality, in-home medical care.
2.  **For Professionals:** To create a platform for dignified, flexible, and well-compensated employment for a wide range of healthcare workers, from MBBS graduates to experienced retired nurses.

The project is built with a **monorepo structure**, keeping the frontend and backend separate for clarity and scalability, but managed within a single repository.

---

## 🏗️ Architectural Overview: The Monorepo Structure

The project is organized into two primary applications: a React frontend and a Node.js backend.

```
DocAtHome/
├── 📁 backend/
│   ├── 📄 server.js       # Main server entry point (Express, Socket.IO)
│   ├── 📁 config/         # Database connection (db.js)
│   ├── 📁 models/         # Mongoose Schemas (User.js, Appointment.js, etc.)
│   ├── 📁 routes/         # API endpoint definitions (authRoutes.js, etc.)
│   ├── 📁 controllers/    # Business logic for each route
│   ├── 📁 middleware/     # Authentication & security middleware (authMiddleware.js)
│   └── 📄 seeder.js       # Script to populate DB with sample data using Faker.js
│
└── 📁 frontend/
    ├── 📁 src/
    │   ├── 📄 main.jsx      # Main React DOM render entry point
    │   ├── 📄 App.jsx        # Core application component with React Router setup
    │   ├── 📁 pages/        # Top-level components for each page/route
    │   ├── 📁 components/   # Reusable UI components (Navbar, DoctorCard, etc.)
    │   ├── 📁 context/      # React Context for global state management (AuthContext.js)
    │   └── 📁 api/          # Centralized Axios functions for all backend API calls
    ├── 📄 vite.config.js    # Configuration for the Vite build tool
    └── 📄 tailwind.config.js # Configuration for Tailwind CSS
```

---

## 🚀 Technology Stack & Rationale

Each technology was chosen for a specific reason to meet the project's goals of speed, scalability, and user experience.

| Category | Technology | Why It Was Chosen |
| :--- | :--- | :--- |
| **Frontend** | **React.js** | Its component-based architecture is perfect for building a complex, dynamic UI. Reusable components like `DoctorCard` and `FeatureCard` keep the code clean and maintainable. |
| **Build Tool** | **Vite** | Chosen for its blazing-fast development server and Hot Module Replacement (HMR), which dramatically speeds up the development feedback loop compared to older tools. |
| **Styling** | **Tailwind CSS** | A utility-first CSS framework that allows for building a completely custom and responsive design system directly in the HTML, without writing separate CSS files. |
| **Backend** | **Node.js & Express.js**| A lightweight yet powerful combination for building a fast, scalable RESTful API. Its non-blocking, asynchronous nature is ideal for a web application. |
| **Database** | **MongoDB (with Mongoose)** | A NoSQL database selected for its flexibility. The document-based structure easily accommodates the varied data of different user profiles (e.g., a doctor's complex profile vs. a patient's simple one) and allows for easy schema evolution as new features are added. |
| **Authentication**| **JWT (JSON Web Tokens)** | A modern, stateless approach to security. It allows the server to verify user identity and role on every secure request without needing to maintain a session state, which is crucial for scalability. |
| **Payments** | **Razorpay** | A leading payment gateway in India, chosen for its excellent developer documentation and seamless checkout experience for users. |

---

## 💻 Local Development Workflow

To get the project running on your local machine, follow these steps:

1.  **Clone the Repository:**
    ```sh
    git clone <your-repo-url>
    cd DocAtHome
    ```
2.  **Set Up the Backend:**
    *   Navigate to the backend: `cd backend`
    *   Install dependencies: `npm install`
    *   Create a `.env` file and add your `MONGO_URI`, `JWT_SECRET`, and `RAZORPAY` keys.
    *   Start the server: `npm run dev`
    *   *(Optional)* Populate the database: `npm run data:import`

3.  **Set Up the Frontend:**
    *   Open a new terminal.
    *   Navigate to the frontend: `cd frontend`
    *   Install dependencies: `npm install`
    *   Create a `.env` file and add your `VITE_RAZORPAY_KEY_ID`.
    *   Start the client: `npm run dev`

The backend will be running on `http://localhost:5000` and the frontend on `http://localhost:5173`.

---

## 🧠 Key Concepts Implemented

This project is a practical application of several important computer science concepts:

*   **Role-Based Access Control (RBAC):** The core of the security model. The `protect` and `admin` middleware functions in `backend/middleware/` act as gatekeepers for the API. They decode the JWT from each request's header to verify a user's role before granting access to sensitive data or actions. This ensures a patient cannot access an admin-only endpoint.

*   **Asynchronous Operations:** The entire application is built on asynchronous JavaScript (`async/await`). From fetching doctor data on the frontend with `useEffect` to database queries on the backend with Mongoose, handling promises correctly is essential for a non-blocking, responsive user experience.

*   **State Management with React Context:** Instead of passing user login data down through many layers of components (prop drilling), the `AuthContext` provides global access to the user's authentication state. Any component can easily know if a user is logged in and what their role is.

*   **RESTful API Design:** The backend API is designed following REST principles. Each resource (like `Users`, `Appointments`, `Doctors`) has its own set of endpoints (`/api/doctors`, `/api/appointments`). HTTP methods (`GET`, `POST`, `PUT`) are used logically to perform actions on these resources.
## 🌱 How to Contribute
This is a capstone project, but collaboration and feedback are always welcome. Please feel free to fork the repository and submit a pull request for any improvements or new features.
1.  **Fork** the repository.
2.  Create your feature branch: `git checkout -b feature/NewAwesomeFeature`
3.  Commit your changes: `git commit -m 'Add: NewAwesomeFeature'`
4.  Push to the branch: `git push origin feature/NewAwesomeFeature`
5.  Open a **Pull Request**.

Thank you for taking the time to learn about Doc@Home!
