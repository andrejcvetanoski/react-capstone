import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './Header.module.css';

const THEME_KEY = 'everyday-store-theme';

export default function Header() {
  const { itemCount } = useCart();
  // Start with the theme saved in the browser, or light if nothing is saved.
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light');

  // Whenever the theme changes, put it on the page and save it.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} to="/">Everyday Store<span>Simple finds. Everyday essentials.</span></Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>Products</NavLink>
          <NavLink to="/cart" className={({ isActive }) => isActive ? styles.active : ''}>Cart <span className={styles.count}>({itemCount})</span></NavLink>
          <button type="button" className="secondary" onClick={toggleTheme}>
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </nav>
      </div>
    </header>
  );
}
