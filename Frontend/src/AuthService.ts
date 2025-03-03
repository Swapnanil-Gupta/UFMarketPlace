
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

interface Product {
  name: string;
  description: string;
  price: number;
  category: string;
  images: File[];
  id?: string;
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
  async createProduct(productData: Product): Promise<Product[]> {
    try {
      const formData = new FormData();
      
      // Append text fields
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price.toString());
      formData.append('category', productData.category);

      // Append image files
      productData.images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Session-ID': sessionStorage.getItem('sessionId') || ''
        }
      };
      console.log(formData)

      const response = await api.post<Product[]>('/products', formData, config);
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
