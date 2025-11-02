# KoboWave 🎬🍽️

A comprehensive review platform for movies and restaurants with Firebase integration.

## Features

- **Movie Reviews** - Search and review movies using OMDb API
- **Restaurant Reviews** - Discover and review local restaurants
- **Firebase Integration** - Real-time data storage
- **React Frontend** - Modern, responsive UI
- **Express Backend** - Robust API server

## Tech Stack

### Frontend
- React.js
- React Bootstrap
- Axios for API calls
- Firebase Authentication

### Backend
- Node.js
- Express.js
- Firebase Admin SDK
- CORS enabled

## Project Structure

\\\
KoboWave/
├── backend/          # Express.js API server
├── frontend/         # React.js application
├── README.md         # Project documentation
└── .gitignore        # Git ignore rules
\\\

## Setup Instructions

### Backend Setup
\\\ash
cd backend
npm install
cp .env.example .env
# Add your environment variables
npm run dev
\\\

### Frontend Setup
\\\ash
cd frontend
npm install
npm start
\\\

## Environment Variables

Create a \.env\ file in the backend directory:

\\\env
SERVER_PORT=5000
OMDB_API_KEY=your_omdb_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
\\\

## API Endpoints

- \GET /api/health\ - Health check
- \GET /api/movies\ - Movie search and details
- \GET /api/restaurants\ - Restaurant listings and search
- \GET /api/reviews\ - Review management

## License

MIT License
