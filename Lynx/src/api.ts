export const API_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.com' 
    : 'http://localhost:3001',
  endpoints: {
    chat: '/api/chat',
    generateCaption: '/api/captions/generate',
    getTrends: '/api/trends'
  }
};