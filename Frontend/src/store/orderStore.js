import { create } from 'zustand';
import { placeOrder, getOrderById, getOrdersByCustomer, getOrdersByStall, updateOrderStatus } from '../services/orderService';

const useOrderStore = create((set, get) => ({
  orders: [],
  activeOrder: null,
  isLoading: false,
  error: null,

  placeOrder: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const order = await placeOrder(payload);
      set((state) => ({ orders: [order, ...state.orders], activeOrder: order, isLoading: false }));
      return order;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  fetchOrderById: async (id) => {
    set({ isLoading: true });
    try {
      const order = await getOrderById(id);
      set({ activeOrder: order, isLoading: false });
      return order;
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  pollOrderStatus: async (id) => {
    try {
      const order = await getOrderById(id);
      const { activeOrder } = get();
      if (activeOrder?.id === id) {
        set({ activeOrder: order });
      }
      set((state) => ({
        orders: state.orders.map((o) => o.id === id ? order : o),
      }));
      return order;
    } catch {
      // silent polling failure
    }
  },

  fetchCustomerOrders: async (customerId) => {
    set({ isLoading: true });
    try {
      const orders = await getOrdersByCustomer(customerId);
      set({ orders, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchStallOrders: async (stallId) => {
    set({ isLoading: true });
    try {
      const orders = await getOrdersByStall(stallId);
      set({ orders, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const updated = await updateOrderStatus(orderId, status);
      set((state) => ({
        orders: state.orders.map((o) => o.id === orderId ? updated : o),
        activeOrder: state.activeOrder?.id === orderId ? updated : state.activeOrder,
      }));
      return updated;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  clearActiveOrder: () => set({ activeOrder: null }),
}));

export default useOrderStore;
