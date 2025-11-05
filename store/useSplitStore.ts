import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Session {
  id: string;
  code: string;
  restaurant_name: string;
  currency: string;
  tip_rate: number;
  tax_rate: number;
}

interface SplitStore {
  // Session state
  session: Session | null;
  setSession: (session: Session | null) => void;

  // Guest state
  guestId: string | null;
  guestName: string | null;
  setGuest: (id: string, name: string) => void;

  // Cart state (local, antes de sincronizar con backend)
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;

  // Split state
  assignments: Record<string, string[]>; // guestId -> [itemIds]
  setAssignments: (assignments: Record<string, string[]>) => void;

  // Reset all
  reset: () => void;
}

export const useSplitStore = create<SplitStore>()(
  persist(
    (set, get) => ({
      // Session
      session: null,
      setSession: (session) => set({ session }),

      // Guest
      guestId: null,
      guestName: null,
      setGuest: (id, name) => set({ guestId: id, guestName: name }),

      // Cart
      cart: [],
      addToCart: (item) => {
        const cart = get().cart;
        const existingItem = cart.find((i) => i.id === item.id);

        if (existingItem) {
          set({
            cart: cart.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ cart: [...cart, { ...item, quantity: 1 }] });
        }
      },

      removeFromCart: (itemId) => {
        set({ cart: get().cart.filter((i) => i.id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }
        set({
          cart: get().cart.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ cart: [] }),

      getTotalPrice: () => {
        return get().cart.reduce((total, item) => {
          return total + item.price * item.quantity;
        }, 0);
      },

      // Split
      assignments: {},
      setAssignments: (assignments) => set({ assignments }),

      // Reset
      reset: () => set({
        session: null,
        guestId: null,
        guestName: null,
        cart: [],
        assignments: {},
      }),
    }),
    {
      name: 'bouquet-storage',
      partialize: (state) => ({
        session: state.session,
        guestId: state.guestId,
        guestName: state.guestName,
        cart: state.cart,
      }),
    }
  )
);
