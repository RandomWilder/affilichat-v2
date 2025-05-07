import axios from 'axios'

// Create a base API client with default configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to include authentication token
apiClient.interceptors.request.use(
  async (config) => {
    // Get the token from Firebase auth if available
    const token = localStorage.getItem('auth_token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global error responses (e.g., 401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // Redirect to login or show auth message
      console.error('Authentication required')
      // You could dispatch an event or action here
    }
    
    return Promise.reject(error)
  }
)

export default apiClient