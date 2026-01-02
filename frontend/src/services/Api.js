import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserQR = async (userId) => {
  try {
    const response = await api.get(`/user/${userId}/qr`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};