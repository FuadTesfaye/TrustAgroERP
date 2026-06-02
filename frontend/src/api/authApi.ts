import api from './axios';

const API_URL = '/api/auth';

export interface LoginResponse {
  token: string;
  type: string;
  expiresIn: number;
  id: number;
  name: string;
  email: string;
  role: string;
  roles: string[];
}

export const authApi = {
  sendSignupOTP: async (email: string, password?: string, fullName?: string) => {
    return api.post(`${API_URL}/signup/otp`, { email, password, fullName });
  },

  verifySignupOTP: async (email: string, otpCode: string) => {
    return api.post(`${API_URL}/signup/verify`, { email, otpCode });
  },

  sendLoginOTP: async (email: string, password?: string) => {
    return api.post(`${API_URL}/login/otp`, { email, password });
  },

  verifyLoginOTP: async (email: string, otpCode: string) => {
    const response = await api.post<{ data: LoginResponse }>(`${API_URL}/login/verify`, { email, otpCode });
    return response.data.data;
  },

  me: () => api.get(`${API_URL}/me`),
};
