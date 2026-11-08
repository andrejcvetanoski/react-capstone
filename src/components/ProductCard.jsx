import { Link } from 'react-router-dom';
import AddToCart from './AddToCart';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  return (
    <article className={styles.card}>
      <Link to={`/products/${product.id}`} className={styles.productLink}>
        <div className={styles.imageWrap}>
          <img src={product.thumbnail} alt={product.title} loading="lazy" width="240" height="190" />
          {product.stock < 1 && <span className={styles.badge}>Out of stock</span>}
          {product.stock > 0 && product.stock <= 5 && <span className={`${styles.badge} ${styles.low}`}>Only {product.stock} left</span>}
        </div>
        <div className={styles.text}>
          <p className="category">{product.category.replaceAll('-', ' ')}</p>
          <h2>{product.title}</h2>
        </div>
      </Link>
      <div className={styles.bottom}>
        <p className={styles.price}>${product.price.toFixed(2)}</p>
        <AddToCart product={product} />
      </div>
    </article>
  );
}
