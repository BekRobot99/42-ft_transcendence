// Configuration for frontend deployment
const CONFIG = {
    // For production deployment, use the backend service URL
    // For local development, use relative URLs (empty string)
    BACKEND_URL: window.location.hostname.includes('onrender.com')
        ? 'https://ft-transcendence-backend.onrender.com'  // Production backend URL
        : '',  // Local development (relative URLs)
};

export default CONFIG;
