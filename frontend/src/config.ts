// Configuration for frontend deployment
const CONFIG = {
    // For production deployment, use the backend service URL
    // For local development, use relative URLs (empty string)
    BACKEND_URL: window.location.hostname.includes('onrender.com')
        ? 'https://ft-transcendence-wrop.onrender.com'  // Actual backend URL from Render
        : '',  // Local development (relative URLs)
};

export default CONFIG;
