import axios, { AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
})

// Request interceptor: attach JWT Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('donatebridge_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: catch 401s, normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if already on auth pages
      const currentPath = window.location.pathname
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register') &&
        currentPath !== '/'
      ) {
        localStorage.removeItem('donatebridge_token')
        localStorage.removeItem('donatebridge_user')
        window.location.href = '/login?expired=true'
      }
    }

    return Promise.reject(error)
  }
)

/**
 * Extracts a user-friendly error message from Axios errors
 */
export function extractErrorMessage(error: unknown, fallbackMessage = 'An unexpected error occurred'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === 'string' && data.trim()) return data
    if (data?.message) return data.message
    if (data?.error) return data.error
    if (error.message) return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallbackMessage
}

/**
 * Checks whether an error is due to a missing role profile (e.g. 404 or backend 500 "profile not found")
 */
export function isProfileNotFoundError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) return true
    const msg = (
      (typeof error.response?.data === 'string' ? error.response?.data : '') ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      ''
    ).toLowerCase()
    if (msg.includes('profile not found') || (error.response?.status === 500 && msg.includes('not found'))) {
      return true
    }
  }
  return false
}

