
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


export interface ProductRequest {
  id: string,
  name: string;
  description: string;
  price: number;  
  category: string;
  images: File[];    
}

export interface ProductResponse {
  id: string;       
  name: string;
  description: string;
  price: string;     
  category: string;
  images: string[]; 
}


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

function getUserName() {
  return sessionStorage.getItem("email") || '';
}

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
  async createProduct(productData: ProductRequest): Promise<ProductResponse[]> {
    try {
      const formData = new FormData();
      formData.append('productId', productData.id);
      formData.append('productName', productData.name);
      formData.append('productDescription', productData.description);
      formData.append('price', productData.price.toString());
      formData.append('category', productData.category);
      formData.append('userEmail', getUserName());
      productData.images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Session-ID': sessionStorage.getItem('sessionId') || ''
        }
      };
      console.log("Formadat " + formData.get("userId"))

      const response = await api.post<ProductResponse[]>('/createListing', formData, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },
  async updateProduct(productData: ProductRequest): Promise<ProductResponse[]> {
    try {
      const formData = new FormData();
      
      formData.append('productId', productData.id);
      formData.append('productName', productData.name);
      formData.append('productDescription', productData.description);
      formData.append('price', productData.price.toString());
      formData.append('category', productData.category);
      formData.append('userEmail', getUserName());

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

      const response = await api.put<ProductResponse[]>('/updateListing', formData, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },
  async getListing(): Promise<ProductResponse[]> {
    try {

      const response = await api.get<ProductResponse[]>('/listings?userEmail='+getUserName());
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },
  async deleteListing(productId: string): Promise<ProductResponse[]> {
    try {
      const response = await api.delete<ProductResponse[]>('/deleteListing?listingId='+productId+'&userEmail='+getUserName());
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
