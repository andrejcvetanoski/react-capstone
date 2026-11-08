import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './Cart.module.css';

export default function Cart() {
  const { cart, dispatch, itemCount, total } = useCart();
  return (
    <>
      <h1>Your cart</h1>
      <p className="intro">Review your items and adjust quantities.</p>
      {cart.length === 0 ? (
        <div className="message"><span className="empty-icon" aria-hidden="true">🛒</span><h2>Your cart is empty</h2><p>Browse our products to add your first item.</p><Link className="button-link" to="/">Browse products</Link></div>
      ) : (
        <div className={styles.layout}>
          <ul className={styles.items}>
            {cart.map(item => (
              <li className={styles.item} key={item.id}>
                <img src={item.thumbnail} alt={item.title} width="88" height="88" />
                <div className={styles.name}>
                  <Link to={`/products/${item.id}`}>{item.title}</Link>
                  <p>${item.price.toFixed(2)} each</p>
                  <button className={styles.remove} onClick={() => dispatch({ type: 'REMOVE', id: item.id })} aria-label={`Remove ${item.title}`}>Remove</button>
                </div>
                <div className={styles.quantity} role="group" aria-label={`Quantity for ${item.title}`}>
                  <button className="secondary" disabled={item.quantity === 1} aria-label={`Decrease quantity of ${item.title}`} onClick={() => dispatch({ type: 'DECREASE', id: item.id })}>−</button>
                  <span aria-label={`${item.quantity} in cart`}>{item.quantity}</span>
                  <button className="secondary" disabled={item.quantity >= item.stock} aria-label={`Increase quantity of ${item.title}`} onClick={() => dispatch({ type: 'INCREASE', id: item.id })}>+</button>
                </div>
                <strong className={styles.lineTotal}>${(Math.round(item.price * 100) * item.quantity / 100).toFixed(2)}</strong>
              </li>
            ))}
          </ul>
          <aside className={styles.summary} aria-label="Cart summary">
            <h2>Cart summary</h2>
            <p>Items <span>{itemCount}</span></p>
            <p className={styles.total}>Total <span>${total.toFixed(2)}</span></p>
            <p className={styles.note}>Demo store. No payments or real orders. Your cart is saved in this browser.</p>
            <Link to="/">Continue shopping</Link>
            <button className="secondary" onClick={() => dispatch({ type: 'CLEAR' })}>Clear cart</button>
          </aside>
        </div>
      )}
    </>
  );
}
