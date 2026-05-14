import api, { USE_MOCK } from '../api/axios';
import { mockStalls } from '../mock/stalls';
import { mockMenuItems } from '../mock/menus';

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export const getStallsByEvent = async (eventId) => {
  if (USE_MOCK) {
    await delay();
    return mockStalls.filter((s) => s.eventId === eventId);
  }
  const { data } = await api.get(`/api/events/${eventId}/stalls/`);
  return data;
};

export const getStallById = async (id) => {
  if (USE_MOCK) {
    await delay();
    return mockStalls.find((s) => s.id === id) || null;
  }
  const { data } = await api.get(`/api/stalls/${id}/`);
  return data;
};

export const getStallsByVendor = async (vendorId) => {
  if (USE_MOCK) {
    await delay();
    return mockStalls.filter((s) => s.vendorId === vendorId);
  }
  const { data } = await api.get('/api/stalls/', { params: { vendorId } });
  return data;
};

export const getMenuByStall = async (stallId) => {
  if (USE_MOCK) {
    await delay();
    return mockMenuItems.filter((m) => m.stallId === stallId);
  }
  const { data } = await api.get(`/api/stalls/${stallId}/menu/`);
  return data;
};

export const createMenuItem = async (stallId, payload) => {
  if (USE_MOCK) {
    await delay(500);
    const item = { ...payload, id: `m${Date.now()}`, stallId };
    mockMenuItems.push(item);
    return item;
  }
  const { data } = await api.post(`/api/stalls/${stallId}/menu/`, payload);
  return data;
};

export const updateMenuItem = async (itemId, payload) => {
  if (USE_MOCK) {
    await delay(500);
    const idx = mockMenuItems.findIndex((m) => m.id === itemId);
    if (idx !== -1) mockMenuItems[idx] = { ...mockMenuItems[idx], ...payload };
    return mockMenuItems[idx];
  }
  const { data } = await api.patch(`/api/menu-items/${itemId}/`, payload);
  return data;
};

export const deleteMenuItem = async (itemId) => {
  if (USE_MOCK) {
    await delay(500);
    const idx = mockMenuItems.findIndex((m) => m.id === itemId);
    if (idx !== -1) mockMenuItems.splice(idx, 1);
    return { success: true };
  }
  await api.delete(`/api/menu-items/${itemId}/`);
  return { success: true };
};

export const updateStall = async (stallId, payload) => {
  if (USE_MOCK) {
    await delay(500);
    const idx = mockStalls.findIndex((s) => s.id === stallId);
    if (idx !== -1) mockStalls[idx] = { ...mockStalls[idx], ...payload };
    return mockStalls[idx];
  }
  const { data } = await api.patch(`/api/stalls/${stallId}/`, payload);
  return data;
};

export const applyToEvent = async (eventId, stallData) => {
  if (USE_MOCK) {
    await delay(500);
    const newStall = { ...stallData, id: `s${Date.now()}`, eventId, status: 'pending' };
    mockStalls.push(newStall);
    return newStall;
  }
  const { data } = await api.post(`/api/events/${eventId}/apply/`, stallData);
  return data;
};

export const updateStallStatus = async (stallId, status) => {
  if (USE_MOCK) {
    await delay(500);
    const idx = mockStalls.findIndex((s) => s.id === stallId);
    if (idx !== -1) mockStalls[idx].status = status;
    return mockStalls[idx];
  }
  const { data } = await api.patch(`/api/stalls/${stallId}/status/`, { status });
  return data;
};
