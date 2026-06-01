import axios from 'axios';

const API_URL = '/api/auth'; // Assuming proxy setup or relative paths

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
  sendSignupOTP: async (email: string) => {
    return axios.post(`${API_URL}/signup/otp`, { email });
  },

  verifySignupOTP: async (email: string, otpCode: string) => {
    return axios.post(`${API_URL}/signup/verify`, { email, otpCode });
  },

  sendLoginOTP: async (email: string) => {
    return axios.post(`${API_URL}/login/otp`, { email });
  },

  verifyLoginOTP: async (email: string, otpCode: string) => {
    const response = await axios.post<{ data: LoginResponse }>(`${API_URL}/login/verify`, { email, otpCode });
    return response.data.data;
  },

  me: () => axios.get(`${API_URL}/me`),
};
