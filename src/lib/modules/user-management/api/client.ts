/* HTTP client configuration for user management API */

/* External library imports */
import axios from "axios"

/* Shared module imports */
import { BACKEND_BASE_URL } from "@shared/config"

/* HTTP client configured for user management API endpoints */
const userApiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}/users`,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* Attach auth token to requests */
userApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/* Handle auth errors and token cleanup */
userApiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('loggedIn')
      window.dispatchEvent(new Event('authStateChanged'))
    }
    return Promise.reject(error)
  }
)

export { userApiClient }