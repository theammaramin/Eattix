import api, { USE_MOCK } from '../api/axios';
import { mockOrders } from '../mock/orders';

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

const generatePickupCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

export const placeOrder = async (payload) => {
  if (USE_MOCK) {
    await delay(800);
    const order = {
      ...payload,
      id: `ord${Date.now()}`,
      status: 'placed',
      pickupCode: generatePickupCode(),
      estimatedTime: '15-20 mins',
      placedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockOrders.unshift(order);
    return order;
  }
  const { data } = await api.post('/api/orders/', payload);
  return data;
};

export const getOrderById = async (id) => {
  if (USE_MOCK) {
    await delay();
    return mockOrders.find((o) => o.id === id) || null;
  }
  const { data } = await api.get(`/api/orders/${id}/`);
  return data;
};

export const getOrdersByCustomer = async (customerId) => {
  if (USE_MOCK) {
    await delay();
    return mockOrders.filter((o) => o.customerId === customerId);
  }
  const { data } = await api.get('/api/orders/', { params: { customerId } });
  return data;
};

export const getOrdersByStall = async (stallId) => {
  if (USE_MOCK) {
    await delay();
    return mockOrders.filter((o) => o.stallId === stallId);
  }
  const { data } = await api.get('/api/orders/', { params: { stallId } });
  return data;
};

export const updateOrderStatus = async (orderId, status) => {
  if (USE_MOCK) {
    await delay(500);
    const idx = mockOrders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      mockOrders[idx].status = status;
      mockOrders[idx].updatedAt = new Date().toISOString();
    }
    return mockOrders[idx];
  }
  const { data } = await api.patch(`/api/orders/${orderId}/status/`, { status });
  return data;
};
