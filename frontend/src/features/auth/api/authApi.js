import { apiClient } from '../../../lib/apiClient';

export const login = async (email, password) => {
  return await apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};
