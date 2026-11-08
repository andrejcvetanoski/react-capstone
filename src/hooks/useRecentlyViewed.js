import { useEffect, useState } from 'react';

const STORAGE_KEY = 'everyday-store-recently-viewed';

export function readRecentlyViewed() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter(item =>
      item && Number.isInteger(item.id) && typeof item.title === 'string' &&
      typeof item.thumbnail === 'string' && typeof item.price === 'number',
    ).slice(0, 4) : [];
  } catch {
    return [];
  }
}

function saveRecentlyViewed(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Browsing still works when the browser blocks storage.
  }
}

// Record a product only after its details have successfully loaded.
export function useRememberProduct(product) {
  useEffect(() => {
    if (!product) return;
    const { id, title, thumbnail, price } = product;
    const previous = readRecentlyViewed().filter(item => item.id !== id);
    saveRecentlyViewed([{ id, title, thumbnail, price }, ...previous].slice(0, 4));
  }, [product]);
}

export default function useRecentlyViewed() {
  const [items, setItems] = useState(readRecentlyViewed);

  function clearHistory() {
    setItems([]);
    saveRecentlyViewed([]);
  }

  return { items, clearHistory };
}
