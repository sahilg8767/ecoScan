# Eco Scan – AI-Based Waste Classifier with Analytics Dashboard

An AI-powered web application that classifies waste from images, provides an Eco Score, and displays analytics for user progress and environmental impact tracking.

## Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS + Recharts
- **Backend**: Node.js + Express + MongoDB
- **AI Service**: Python + Flask

## Setup Instructions

### Prerequisites
- Node.js installed
- Python 3.8+ installed
- MongoDB installed and running locally on `mongodb://127.0.0.1:27017/ecoscan`

### 1. AI Service (Flask)
1. Open terminal and navigate to `ai-model` directory.
2. Install dependencies: `pip install -r requirements.txt`
3. Run the service: `python app.py`
4. The service will run on `http://localhost:5000`

### 2. Backend Server (Node.js)
1. Open terminal and navigate to `server` directory.
2. Install dependencies: `npm install`
3. Run the server: `node server.js`
4. The server will run on `http://localhost:5001`

### 3. Frontend (React)
1. Open terminal and navigate to `client` directory.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open your browser and go to the provided Vite URL (usually `http://localhost:5173`)

## Features
- Upload waste images or use webcam
- AI classification of Waste (Mock service included for development)
- Eco Score calculation and level gamification
- Dashboard showing analytics with Recharts
- Scan history tracking
