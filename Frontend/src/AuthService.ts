
import axios from 'axios';

const API_BASE_URL = "http://localhost:8080";

interface AuthResponse {
  sessionId: string;
  name: string;
  email: string;
}

interface AuthPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});


api.interceptors.request.use(config => {
  const sessionId = sessionStorage.getItem('sessionId');
  if (sessionId) {
    config.headers['X-Session-ID'] = sessionId;
  }
  return config;
});

export const authService = {
  async login(payload: AuthPayload): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/login', {
        email: payload.email,
        password: payload.password
      });
      
      sessionStorage.setItem('sessionId', response.data.sessionId);
      sessionStorage.setItem('name', response.data.name);
      sessionStorage.setItem('email', response.data.email);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async signup(payload: AuthPayload): Promise<AuthResponse> {
    try {
      if (payload.password !== payload.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      const response = await api.post<AuthResponse>('/signup', {
        name: payload.name,
        email: payload.email,
        password: payload.password
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      return new Error(error.response?.data || 'Authentication failed');
    }
    return error instanceof Error ? error : new Error('Network error');
  }
};
