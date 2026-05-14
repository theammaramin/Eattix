import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      stallId: null,
      stallName: null,
      eventId: null,
      eventName: null,

      addItem: (item, stall, event) => {
        const { items, stallId } = get();
        if (stallId && stallId !== stall.id) {
          return { conflict: true, currentStall: stallId };
        }
        const existing = items.find((i) => i.menuItemId === item.id);
        if (existing) {
          set({ items: items.map((i) => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
          set({
            stallId: stall.id,
            stallName: stall.name,
            eventId: event.id,
            eventName: event.title,
            items: [...items, { menuItemId: item.id, name: item.name, price: item.price, image: item.image, quantity: 1 }],
          });
        }
        return { conflict: false };
      },

      removeItem: (menuItemId) => {
        const { items } = get();
        const updated = items.filter((i) => i.menuItemId !== menuItemId);
        if (updated.length === 0) {
          set({ items: [], stallId: null, stallName: null, eventId: null, eventName: null });
        } else {
          set({ items: updated });
        }
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(menuItemId);
          return;
        }
        set({ items: get().items.map((i) => i.menuItemId === menuItemId ? { ...i, quantity } : i) });
      },

      clearCart: () => set({ items: [], stallId: null, stallName: null, eventId: null, eventName: null }),

      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'eattix_cart',
    }
  )
);

export default useCartStore;
