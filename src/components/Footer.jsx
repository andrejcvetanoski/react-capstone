import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <strong className={styles.brand}>Everyday Store</strong>
          <p>Simple finds. Everyday essentials.</p>
        </div>
        <nav className={styles.links} aria-label="Footer navigation">
          <Link to="/">Products</Link>
          <Link to="/cart">Cart</Link>
        </nav>
      </div>
      <p className={styles.copy}>© {new Date().getFullYear()} Everyday Store · React capstone project</p>
    </footer>
  );
}
