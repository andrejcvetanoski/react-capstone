import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function AddToCart({ product }) {
  const { cart, dispatch } = useCart();
  const [added, setAdded] = useState(false);
  const quantity = cart.find(item => item.id === product.id)?.quantity || 0;
  const unavailable = product.stock < 1;
  const limitReached = quantity >= product.stock;

  function add() {
    dispatch({ type: 'ADD', product });
    setAdded(true);
  }

  return (
    <div>
      <button type="button" onClick={add} disabled={unavailable || limitReached}>
        {unavailable ? 'Out of stock' : limitReached ? 'Stock limit reached' : 'Add to cart'}
      </button>
      <span className="added-message" role="status">{added && quantity > 0 ? 'Added to cart' : ''}</span>
    </div>
  );
}
