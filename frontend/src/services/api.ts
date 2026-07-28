import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const message = error?.response?.data?.error || error.message || 'Erro inesperado da API.';
    return await Promise.reject(new Error(message));
  }
);
