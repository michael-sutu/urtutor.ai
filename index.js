# urtutor.ai Learning Platform

This repository contains the entire codebase for **urtutor.ai**, a web-based learning platform designed to provide personalized tutoring sessions through AI integration. The platform allows users to sign up, manage their sessions, and interact with an AI tutor to enhance their learning experience.

## Table of Contents

1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Installation](#installation)
4. [Usage](#usage)
5. [API Endpoints](#api-endpoints)
6. [File Structure](#file-structure)

## Features

### User Management
- **Sign-Up and Login:** Users can create accounts and log in securely using their credentials. Passwords are hashed using **bcrypt** to ensure security.
- **Profile Management:** Users can update their account information, including first name, last name, email, and password. They also have the option to delete their accounts if needed.

### Session Management
- **Setup Sessions:** Users can set up new tutoring sessions by providing details such as personality, voice, and session duration.
- **Retrieve Sessions:** Users can view their existing sessions and fetch details for each session, including the status and historical messages.
- **Interactive Chat:** Users can send messages to the AI tutor and receive responses based on the session’s configuration, making the learning process interactive and engaging.

### AI Integration
- **OpenAI GPT-4:** The platform integrates with OpenAI's GPT-4 API to provide intelligent tutoring responses based on user input and session settings.

### Payment and Session Tracking
- **Payment Tracking:** The platform tracks payments based on the duration of tutoring sessions, providing detailed payment histories to users.
- **Session Monitoring:** Sessions are monitored for status updates, allowing users to review or continue sessions as needed.

### Utility Functions
- **String Utilities:** Functions for generating random strings and capitalizing strings for consistent formatting.
- **Database Utilities:** Functions for creating, retrieving, and updating data in MongoDB.
- **Validation:** Functions for validating emails and required fields to ensure data integrity.

## Technologies Used

- **Node.js** and **Express.js** for the backend server.
- **MongoDB** for the database.
- **OpenAI API** for AI-driven responses.
- **bcrypt** for secure password hashing.
- **HTML**, **CSS**, and **JavaScript** for the frontend.

## Installation

To set up the project locally:

1. Clone the repository: `git clone https://github.com/yourusername/urtutor.ai.git`
2. Navigate to the project directory: `cd urtutor.ai`
3. Install dependencies: `npm install`
4. Set up environment variables for your MongoDB connection string and OpenAI API key.
5. Start the server: `node app.js`

## Usage

Once the server is running, you can access the platform in your web browser at `http://localhost:1000`.

## API Endpoints

### **GET Requests**
- `/` - Serves the homepage.
- `/signup` - Serves the sign-up page.
- `/login` - Serves the login page.
- `/dashboard` - Serves the user dashboard.
- `/setup` - Serves the session setup page.
- `/learn` - Serves the learning page.
- `/review` - Serves the review page.
- `/src/:path` - Serves static files from the `src` directory.
- `/images/:path` - Serves images from the `images` directory.
- `*` - Redirects any unspecified routes to the homepage.

### **POST Requests**
- `/get` - Retrieves user data based on the provided private key.
- `/signup` - Handles user registration.
- `/login` - Handles user login.
- `/setup` - Sets up a new tutoring session.
- `/send` - Sends a message to the AI tutor and receives a response.
- `/update` - Updates user profile information.
- `/deleteaccount` - Deletes a user account.

## File Structure

- `app.js` - Main server file.
- `public/` - Directory containing HTML, CSS, and JavaScript files for the frontend.
- `src/` - Directory for additional source files and assets.
- `images/` - Directory for image assets.

---

Feel free to contribute to the project by submitting a pull request or reporting issues.
