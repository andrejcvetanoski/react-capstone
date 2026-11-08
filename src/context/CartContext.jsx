import { createContext, useContext, useEffect, useReducer } from 'react';
import cartReducer from './cartReducer';

const CartContext = createContext(null);
const STORAGE_KEY = 'everyday-store-cart';

// Read the saved cart from the browser. If nothing is saved (or it is broken), start with an empty cart.
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    // Keep only items that have the fields the cart needs.
    return saved.filter(item =>
      item && typeof item.id === 'number' && typeof item.price === 'number' &&
      typeof item.quantity === 'number' && typeof item.stock === 'number',
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], loadCart);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100;

  // Every time the cart changes, save it in the browser.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // The cart still works if the browser blocks storage.
    }
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, dispatch, itemCount, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
