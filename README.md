# Scrollpedia
Scrollpedia is a mobile application that transforms Wikipedia into an engaging, TikTok-style experience. Users can swipe through summaries of Wikipedia articles and listen to them using text-to-speech.
# Features Overview
Frontend (React Native + Expo)
•	User Authentication: Secure login & sign-up with validation.
•	Personalized Feed: Users select favorite topics for customized content.
•	TikTok-Style Swiping: Swipe vertically through AI-summarized Wikipedia articles.
•	API Fetching: Dynamically fetch Wikipedia summaries.
•	Text-to-Speech: Converts text summaries into speech for accessibility.
Backend (Optimized for Scalability)
•	Framework: Hono.js (Fast and lightweight edge framework).
•	Database: PostgreSQL (Stores structured user data).
•	Caching: Redis (Speeds up frequently accessed content).
•	Summarization: Llama LLM (AI-generated concise Wikipedia summaries).
•	Recommendation System: TensorFlow ML Model (Personalized content suggestions).
•	Cloud Execution: Cloudflare Workers (Efficient and scalable request handling).
•	Monitoring: Prometheus + Grafana (Real-time logging & analytics).
•	CI/CD: GitHub Actions (Automated deployments and testing).
# System Architecture
The architecture ensures seamless content delivery, caching, and AI-powered recommendations while maintaining high performance.
API Endpoints
Authentication
•	POST /auth/signup → Create a new user.
•	POST /auth/login → Authenticate and generate a token.
User Preferences
•	GET /preferences/:userId → Fetch stored preferences.
•	POST /preferences → Save user-selected topics.
Article Summarization
•	GET /article/random → Fetch a random Wikipedia summary.
•	GET /article/:topic → Fetch a summarized article based on user interest.
Recommendation System
•	GET /recommendations/:userId → Return personalized articles based on past interactions.
Analytics & Monitoring
•	GET /stats/traffic → Get live user traffic data.
•	GET /stats/popular → Fetch trending articles.
# Installation & Setup
Clone the repository
git clone https://github.com/yourusername/scrollpedia.git
cd scrollpedia
Install Dependencies
Frontend
cd frontend
npm install
expo start
Backend
cd backend
npm install
npm run dev
Environment Variables
Create a .env file in the backend and configure:
DATABASE_URL=your_postgres_url
REDIS_URL=your_redis_url
LLM_API_KEY=your_llm_key

# Project Roadmap
UI Design (Login, Sign-Up, Feed, Preferences)
Wikipedia API Integration
I-Powered Summarization
Machine Learning-Based Recommendations
Implement Offline Mode
Optimize for Performance and Scalability
