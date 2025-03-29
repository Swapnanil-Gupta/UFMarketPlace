
import axios from 'axios';

const API_BASE_URL = "http://localhost:8080";

interface AuthResponse {
  sessionId: string;
  name: string;
  email: string;
  userId: string;
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
  userEmail: string,    
  productName: string;
  productDescription: string;
  price: string;     
  category: string;
  userName: string;
  images: string[]; 
}


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

function getEmail() {
  return sessionStorage.getItem("email") || '';
}

api.interceptors.request.use(config => {
  const sessionId = sessionStorage.getItem('sessionId');
  if (sessionId) {
    config.headers['X-Session-ID'] = sessionId;
    config.headers['userId'] = sessionStorage.getItem('userId');
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
      sessionStorage.setItem('userId', response.data.userId);
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
  },async changePassword(payload: AuthPayload): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/changePassword', {
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
      formData.append('listingId', productData.id);
      formData.append('productName', productData.name);
      formData.append('productDescription', productData.description);
      formData.append('price', productData.price.toString());
      formData.append('category', productData.category);
      formData.append('userEmail', sessionStorage.getItem('email') || '');
      productData.images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Session-ID': sessionStorage.getItem('sessionId') || '',
          'userId': sessionStorage.getItem('userId')
        }
      };
      console.log("Formadat " + formData.get("userId"))

      const response = await api.post<ProductResponse[]>('/listings', formData, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },
  async updateProduct(productData: ProductRequest): Promise<ProductResponse[]> {
    try {
      const formData = new FormData();
      
      formData.append('listingId', productData.id);
      formData.append('productName', productData.name);
      formData.append('productDescription', productData.description);
      formData.append('price', productData.price.toString());
      formData.append('category', productData.category);
      formData.append('userEmail', sessionStorage.getItem('email') || '');

      productData.images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Session-ID': sessionStorage.getItem('sessionId') || '',
          'userId': sessionStorage.getItem('userId')
        }
      };

      const response = await api.put<ProductResponse[]>('/listing/updateListing', formData, config);
      return this.getListing();
    } catch (error) {
      throw this.handleError(error);
    }
  },
  async getListing(): Promise<ProductResponse[]> {
    try {

      const response = await api.get<ProductResponse[]>('/listings/user');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  ,
  async getListingsByOtheruser(): Promise<ProductResponse[]> {
    try {

      const response = await api.get<ProductResponse[]>('/listings');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },
  async deleteListing(productId: string): Promise<any> {
    try {
      const response = await api.delete<any>('/listing/deleteListing?listingId='+productId+'&userEmail='+getEmail());
      return this.getListing();
    } catch (error) {
      throw this.handleError(error);
    }
  }, async sendEmailVerificationCode(): Promise<any> {
    try {
      const response = await api.post<any>('/sendEmailVerificationCode', {
        email: getEmail()
      });
      return response.data
    } catch (error) {
      throw this.handleError(error);
    }
  }, async verifyEmailVerificationCode(code: string): Promise<any> {
    try {
      const response = await api.post<any>('/verifyEmailVerificationCode', {
        email: getEmail(),
        code: code
      });
      return response.data
    } catch (error) {
      throw this.handleError(error);
    }
  }
  ,
   handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      return new Error(error.response?.data || 'Authentication failed');
    }
    return error instanceof Error ? error : new Error('Network error');
  }
};
