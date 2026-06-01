import axios from 'axios';

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
    return axios.post(`${API_URL}/signup/otp`, { email, password, fullName });
  },

  verifySignupOTP: async (email: string, otpCode: string) => {
    return axios.post(`${API_URL}/signup/verify`, { email, otpCode });
  },

  sendLoginOTP: async (email: string, password?: string) => {
    return axios.post(`${API_URL}/login/otp`, { email, password });
  },

  verifyLoginOTP: async (email: string, otpCode: string) => {
    const response = await axios.post<{ data: LoginResponse }>(`${API_URL}/login/verify`, { email, otpCode });
    return response.data.data;
  },

  me: () => axios.get(`${API_URL}/me`),
};
