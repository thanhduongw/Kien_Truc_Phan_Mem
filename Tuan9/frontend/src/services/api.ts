import axios from 'axios';

const ORCHESTRATOR_URL = import.meta.env.VITE_ORCHESTRATOR_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: ORCHESTRATOR_URL,
});

export const login = async (email: string, password: string) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const getTours = async () => {
  const response = await api.get('/tours');
  return response.data;
};

export const getTourDetail = async (id: string) => {
  const response = await api.get(`/tours/${id}`);
  return response.data;
};

export const bookTour = async (userId: string, tourId: string) => {
  const response = await api.post('/book-tour', { userId, tourId });
  return response.data;
};

export default api;
