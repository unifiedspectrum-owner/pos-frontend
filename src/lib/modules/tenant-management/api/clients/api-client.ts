/* External library imports */
import axios from "axios"

/* Shared module imports */
import { BACKEND_BASE_URL } from "@shared/config"

/* HTTP client configured for tenant management API endpoints */
const tenantApiClient = axios.create({
  baseURL: `${BACKEND_BASE_URL}/tenants`,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* Attach auth token to requests */
tenantApiClient.interceptors.request.use(
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
tenantApiClient.interceptors.response.use(
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

export { tenantApiClient }