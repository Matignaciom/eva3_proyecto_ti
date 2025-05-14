// Configuración de las URLs de la API según el entorno

// Determinar si estamos en producción
const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';

// URL del backend en producción (definida en variables de entorno de Netlify)
const PRODUCTION_API_URL = import.meta.env.VITE_API_URL || 'https://sigepa-backend.your-backend-service.com';

// Configurar la URL base de la API
const API_BASE_URL = isProduction 
  ? PRODUCTION_API_URL
  : 'http://localhost:3000';

export default API_BASE_URL; 