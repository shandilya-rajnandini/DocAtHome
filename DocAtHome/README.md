# Doc@Home - On-Demand In-Home Healthcare Platform

Doc@Home is a full-stack web application built with the MERN stack, designed to bridge the gap between patients seeking convenient healthcare and underemployed medical professionals. It serves as a trusted marketplace for booking verified doctors, nurses, and other health services directly to the user's home.


 

---

## 🚀 Core Features

### For Patients:
*   **Secure Authentication:** Users can register and log in as Patients, Doctors, or Nurses.
*   **Personalized Dashboard:** A dedicated dashboard to manage health services.
*   **Find Professionals:** Search and filter for doctors and nurses by specialty and city.
*   **Detailed Profiles:** View professional profiles with details like experience, ratings, and fees.
*   **Seamless Booking:** An interactive calendar to book appointments for in-home visits or video consultations.
*   **Secure Payments:** Integrated with Razorpay for secure and reliable payment processing.
*   **Additional Services:** On-demand booking for in-home lab tests and emergency ambulance services.

### For Professionals (Doctors & Nurses):
*   **Professional Dashboard:** A command center to manage their schedule, view earnings, and see upcoming appointments.
*   **Appointment Management:** Professionals can view appointment details and update the status (e.g., Confirm, Cancel, Mark as Complete).
*   **Profile Management:** Ability to edit their public-facing profile, including bio, qualifications, and availability.

### For Admins:
*   **Verification System:** A secure admin panel to review and approve/reject new professional applications.
*   **User Management:** Admins have oversight of all users on the platform.

---

## 🛠️ Technology Stack

This project is a full-stack application built with modern web technologies:

*   **Frontend:**
    *   **Framework:** React.js
    *   **Build Tool:** Vite
    *   **Styling:** Tailwind CSS
    *   **Routing:** React Router
    *   **State Management:** React Context API

*   **Backend:**
    *   **Framework:** Node.js with Express.js
    *   **Database:** MongoDB with Mongoose
    *   **Authentication:** JWT (JSON Web Tokens) & bcrypt for password hashing
    *   **Real-time Communication:** Socket.IO (for chat features)

*   **Payments:**
    *   **Gateway:** Razorpay

---

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
*   Node.js and npm installed
*   MongoDB (local instance or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Setup the Backend:**
    ```sh
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory and add the following variables:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret
    ```

3.  **Setup the Frontend:**
    ```sh
    cd ../frontend
    npm install
    ```
    Create a `.env` file in the `frontend` directory and add your Razorpay Key ID:
    ```env
    VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
    ```

### Running the Application

1.  **Start the Backend Server:**
    *   Open a terminal in the `backend` directory.
    *   Run `npm run dev`

2.  **Start the Frontend Development Server:**
    *   Open a second terminal in the `frontend` directory.
    *   Run `npm run dev`

The application will be available at `http://localhost:5173`.

---

## 🌟 Future Scope

*   **Proactive Care Circle:** A collaborative dashboard for patients, family members, and doctors.
*   **Smart Scheduling:** Route optimization for professionals to minimize travel time.
*   **AI-Powered Features:** Transcription services for consultations and intelligent patient-provider matching.