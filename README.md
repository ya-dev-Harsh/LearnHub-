# 📚 LearnHub - Online Learning Platform

LearnHub is a full-stack online learning platform where users can browse, purchase, and view video courses. It features a modern, responsive UI with Dark Mode support, an Admin dashboard, and a secure payment simulation.

## 🚀 Features

*   **User Authentication**: Secure Sign Up and Login using bcrypt and sessions.
*   **Course Management**: Browse courses by category, view details, and enroll.
*   **Admin Dashboard**: Manage users and courses (Create, Read, Update, Delete).
*   **Modern UI**: Professional design with **Dark Mode** support and a sliding mobile menu.
*   **Responsive**: Fully optimized for Desktop, Tablet, and Mobile devices.
*   **Payment Simulation**: Mock checkout process for enrolling in courses.

## 🛠️ Tech Stack

*   **Frontend**: HTML5, CSS3 (Custom + Variables), EJS (Templating).
*   **Backend**: Node.js, Express.js.
*   **Database**: PostgreSQL.
*   **Deployment**: Vercel-ready.

## ⚙️ Prerequisites

*   [Node.js](https://nodejs.org/) (v14 or higher)
*   [PostgreSQL](https://www.postgresql.org/) (installed and running)

## 📥 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/learnhub.git
    cd learnhub
    ```

2.  **Install Dependencies**
    The backend manages the dependencies.
    ```bash
    cd backend
    npm install
    ```

3.  **Database Configuration**
    *   Create a PostgreSQL database named `online_learning`.
    *   In the `backend` folder, check the `.env` file (or create one based on the example below):
    ```env
    PORT=3000
    DB_USER=postgres
    DB_PASSWORD=your_password
    DB_HOST=localhost
    DB_NAME=online_learning
    DB_PORT=5432
    SESSION_SECRET=your_secret_key
    ```

4.  **Initialize & Seed Database**
    This will create the necessary tables and populate them with sample data (Courses, Admin User).
    ```bash
    # Inside backend/ folder
    node seed.js
    ```
    *   *Default Admin Credentials:* `admin@learnhub.com` / `admin123`

5.  **Run the Server**
    ```bash
    # For development (with nodemon)
    npm run dev
    
    # Or standard start
    node app.js
    ```

6.  **Access the App**
    Open your browser and visit: `http://localhost:3000`

## ☁️ Deployment

This project is configured for **Vercel**.
Please read [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on setting up a Cloud Database (Neon/Supabase) and deploying the application.

## 📂 Project Structure

```
├── backend/            # Express Server & Logic
│   ├── routes/         # Route definitions
│   ├── app.js          # Entry point
│   ├── seed.js         # Database seeder
│   └── package.json
├── frontend/           # UI Sources
│   ├── public/         # Static assets (CSS, JS)
│   └── views/          # EJS Templates
├── vercel.json         # Vercel Configuration
└── README.md           # Documentation
```
