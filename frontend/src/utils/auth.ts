// JWT Token management utilities
import type { User } from '../types/user';

export interface AuthResponse {
  token: string;
  user: User;
}

// Re-export User type for convenience
export type { User };

// Token storage keys
const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';

// Store authentication data
export const storeAuthData = (authData: AuthResponse): void => {
  localStorage.setItem(TOKEN_KEY, authData.token);
  localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
};

// Get stored token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Get stored user data
export const getUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

// Clear authentication data
export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    // Check if token is expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch {
    return false;
  }
};

// Get authorization header for API requests
export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API request helper with authentication
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const authHeader = getAuthHeader();
  
  // Don't set Content-Type for FormData, let the browser set it with boundary
  const isFormData = options.body instanceof FormData;
  
  const defaultOptions: RequestInit = {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...authHeader,
      ...options.headers,
    },
  };

  return fetch(url, { ...defaultOptions, ...options });
};
