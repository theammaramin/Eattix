import api, { USE_MOCK } from '../api/axios';
import { mockEvents } from '../mock/events';

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export const getEvents = async (filters = {}) => {
  if (USE_MOCK) {
    await delay();
    let results = [...mockEvents];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (e) => e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
      );
    }
    if (filters.category) results = results.filter((e) => e.category === filters.category);
    if (filters.status) results = results.filter((e) => e.status === filters.status);
    return results;
  }
  const { data } = await api.get('/api/events/', { params: filters });
  return data;
};

export const getEventById = async (id) => {
  if (USE_MOCK) {
    await delay();
    return mockEvents.find((e) => e.id === id) || null;
  }
  const { data } = await api.get(`/api/events/${id}/`);
  return data;
};

export const createEvent = async (payload) => {
  if (USE_MOCK) {
    await delay(500);
    const newEvent = { ...payload, id: `e${Date.now()}`, status: 'upcoming', stallCount: 0 };
    mockEvents.push(newEvent);
    return newEvent;
  }
  const { data } = await api.post('/api/events/', payload);
  return data;
};

export const updateEvent = async (id, payload) => {
  if (USE_MOCK) {
    await delay(500);
    const idx = mockEvents.findIndex((e) => e.id === id);
    if (idx !== -1) mockEvents[idx] = { ...mockEvents[idx], ...payload };
    return mockEvents[idx];
  }
  const { data } = await api.patch(`/api/events/${id}/`, payload);
  return data;
};
