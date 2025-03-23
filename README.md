# Scrollpedia

Scrollpedia is a modern, AI-powered React Native app that delivers an immersive, TikTok-style scrolling experience for Wikipedia articles. Users can explore curated content with interactive features like Like, Share, and Comment, all while enjoying a sleek and engaging interface.

## System Architecture
![image](https://github.com/user-attachments/assets/ed7f5e7e-fbf7-4c94-98f7-81a1bbfc99d8)


## Features

- **Dynamic Onboarding**: Personalized onboarding process that collects user preferences.
- **Interest-Based Feed**: Infinite scrolling feed tailored to user interests.
- **User Engagement**: Options to Like, Share, and Comment on articles.
- **AI-Powered Summaries**: Enhanced article summaries generated through Llama LLM.
- **Text-to-Speech**: Integrated text-to-speech for audio summaries.
- **Modern UI/UX**: Inspired by TikTok and Pinterest, with a sleek and responsive design.

## Tech Stack

- **Frontend**: React Native (Expo) with NativeWind (Tailwind CSS).
- **Backend**: Hono.js running on Cloudflare Workers.
- **Database**: PostgreSQL for structured data, Redis for caching and session management.
- **AI & ML**: Llama LLM for article summaries and TensorFlow for personalized recommendations.
- **Infrastructure**: Cloudflare Workers for edge deployment and fast content delivery.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (>=18.x)
- Expo CLI

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mayuresh-22/scrollpedia.git
   cd scrollpedia
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

## Project Structure

```
scrollpedia/
├── apps/
│    └── Scrollpedia/         # React Native (Expo) app
├── services/                 # Backend and data pipeline
│    ├── backend/             # Hono.js backend logic
│    └── wikipedia-data-pipeline/  # Wikipedia data fetching pipeline
├── .gitignore
├── README.md
└── package-lock.json
```

## Contribution

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

MIT License.

