import { Link } from 'react-router-dom';
import useRecentlyViewed from '../hooks/useRecentlyViewed';
import styles from './RecentlyViewed.module.css';

export default function RecentlyViewed() {
  const { items, clearHistory } = useRecentlyViewed();
  if (items.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="recently-viewed-title">
      <div className={styles.heading}>
        <div>
          <h2 id="recently-viewed-title">Recently viewed</h2>
          <p>Pick up where you left off. Saved on this browser.</p>
        </div>
        <button className="secondary" onClick={clearHistory}>Clear history</button>
      </div>
      <div className={styles.grid}>
        {items.map(product => (
          <Link className={styles.item} key={product.id} to={`/products/${product.id}`}>
            <img src={product.thumbnail} alt="" width="64" height="64" />
            <div><strong>{product.title}</strong><span>${product.price.toFixed(2)}</span></div>
          </Link>
        ))}
      </div>
    </section>
  );
}
