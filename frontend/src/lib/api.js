import axios from 'axios';

const getDefaultApiUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5000';
  const { hostname, protocol, origin } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:5000`;
  }

  return `${origin}/api`;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || getDefaultApiUrl();

export const api = axios.create({
  baseURL: API_URL,
});

export const getAuthConfig = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const saveToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const parseJwt = (token) => {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};
