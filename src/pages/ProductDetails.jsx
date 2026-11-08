import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import AddToCart from '../components/AddToCart';
import RequestState from '../components/RequestState';
import styles from './ProductDetails.module.css';
import { useRememberProduct } from '../hooks/useRecentlyViewed';

export default function ProductDetails() {
  const { id } = useParams();
  const { data: product, loading, error, retry } = useFetch(`/products/${encodeURIComponent(id)}`);
  useRememberProduct(product);
  const [chosenImage, setChosenImage] = useState('');

  // Use the product's pictures, or just the thumbnail if there are none.
  const images = product ? (product.images?.length ? product.images : [product.thumbnail]) : [];
  const mainImage = images.includes(chosenImage) ? chosenImage : images[0];

  return (
    <>
      <Link className="back-link" to="/">← Back to products</Link>
      {loading || error ? <RequestState loading={loading} error={error} retry={retry} /> : (
        <article className={styles.detail}>
          <div>
            <img className={styles.image} src={mainImage} alt={product.title} />
            {images.length > 1 && (
              <div className={styles.thumbs}>
                {images.map((url, index) => (
                  <button key={url} type="button" className={`${styles.thumb} ${url === mainImage ? styles.activeThumb : ''}`}
                    aria-label={`Show picture ${index + 1}`} onClick={() => setChosenImage(url)}>
                    <img src={url} alt="" width="56" height="56" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={styles.info}>
            <p className="category">{product.category.replaceAll('-', ' ')}</p>
            <h1>{product.title}</h1>
            <p className={styles.description}>{product.description}</p>
            <dl className={styles.facts}>
              {product.brand && <><dt>Brand</dt><dd>{product.brand}</dd></>}
              <dt>Rating</dt><dd><span className={styles.stars} aria-hidden="true">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span> {product.rating} / 5</dd>
              <dt>Availability</dt><dd className={product.stock > 0 ? styles.inStock : styles.outOfStock}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</dd>
            </dl>
            <p className={styles.price}>${product.price.toFixed(2)}</p>
            <AddToCart key={product.id} product={product} />
            <Link to="/cart">View cart</Link>
          </div>
        </article>
      )}
    </>
  );
}
