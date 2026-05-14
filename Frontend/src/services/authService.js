import api, { USE_MOCK } from '../api/axios';
import { mockUsers } from '../mock/users';

const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

export const login = async (email, password) => {
  if (USE_MOCK) {
    await delay();
    const user = mockUsers.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    const safeUser = Object.fromEntries(Object.entries(user).filter(([k]) => k !== 'password'));
    const token = `mock-token-${user.id}-${Date.now()}`;
    return { user: safeUser, token };
  }
  const { data } = await api.post('/api/auth/login/', { email, password });
  return data;
};

export const register = async (payload) => {
  if (USE_MOCK) {
    await delay();
    const exists = mockUsers.find((u) => u.email === payload.email);
    if (exists) throw new Error('An account with this email already exists');
    const newUser = {
      ...payload,
      id: `u${Date.now()}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.name}`,
    };
    mockUsers.push(newUser);
    const safeUser = Object.fromEntries(Object.entries(newUser).filter(([k]) => k !== 'password'));
    const token = `mock-token-${newUser.id}-${Date.now()}`;
    return { user: safeUser, token };
  }
  const { data } = await api.post('/api/auth/register/', payload);
  return data;
};

export const logout = async () => {
  if (USE_MOCK) {
    await delay(200);
    return { success: true };
  }
  await api.post('/api/auth/logout/');
  return { success: true };
};
