import { apiClient } from '../../../lib/apiClient';

export const login = async (email, password) => {
  return await apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const register = async (payload) => {
  return await apiClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
