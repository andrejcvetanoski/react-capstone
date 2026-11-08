import { useState } from 'react';
import useFetch from '../hooks/useFetch';
import { PRODUCTS_URL } from '../api/products';
import ProductCard from '../components/ProductCard';
import RequestState from '../components/RequestState';
import styles from './Products.module.css';
import RecentlyViewed from '../components/RecentlyViewed';

export default function Products() {
  const { data, loading, error, retry } = useFetch(PRODUCTS_URL);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(12);

  if (loading || error) return <RequestState loading={loading} error={error} retry={retry} />;

  const products = data.products;
  const categories = [...new Set(products.map(product => product.category))].sort();
  const filtered = products.filter(product =>
    product.title.toLowerCase().includes(search.trim().toLowerCase()) &&
    (category === 'all' || product.category === category),
  );

  // Sorting: start from a copy of the filtered list, then order it.
  const sorted = [...filtered];
  if (sort === 'low') sorted.sort((a, b) => a.price - b.price);
  if (sort === 'high') sorted.sort((a, b) => b.price - a.price);
  if (sort === 'name') sorted.sort((a, b) => a.title.localeCompare(b.title));

  function resetFilters() {
    setSearch('');
    setCategory('all');
    setSort('featured');
    setVisibleCount(12);
  }

  return (
    <>
      <div className={styles.banner}>
        <p className={styles.eyebrow}>THE EVERYDAY EDIT</p>
        <h1>Good finds. Everyday essentials.</h1>
        <p className="intro">Browse products, find your favourites, and make them part of your day.</p>
        <button type="button" className={styles.cta} onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })}>Shop now</button>
      </div>
      <RecentlyViewed />
      <div className={styles.filters} id="shop">
        <div>
          <label htmlFor="search">Search products</label>
          <input id="search" type="search" placeholder="Search by product name…" value={search}
            onChange={event => { setSearch(event.target.value); setVisibleCount(12); }} />
        </div>
        <div>
          <label htmlFor="category">Category</label>
          <select id="category" value={category}
            onChange={event => { setCategory(event.target.value); setVisibleCount(12); }}>
            <option value="all">All categories</option>
            {categories.map(name => <option key={name} value={name}>{name.replaceAll('-', ' ')}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sort">Sort by</label>
          <select id="sort" value={sort} onChange={event => setSort(event.target.value)}>
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
        <button className="secondary" type="button" onClick={resetFilters}>Clear filters</button>
      </div>
      <div className={styles.chips} role="group" aria-label="Quick category filter">
        <button type="button" className={`${styles.chip} ${category === 'all' ? styles.chipActive : ''}`} aria-pressed={category === 'all'}
          onClick={() => { setCategory('all'); setVisibleCount(12); }}>All</button>
        {categories.map(name => (
          <button key={name} type="button" className={`${styles.chip} ${category === name ? styles.chipActive : ''}`} aria-pressed={category === name}
            onClick={() => { setCategory(name); setVisibleCount(12); }}>{name.replaceAll('-', ' ')}</button>
        ))}
      </div>
      <p className={styles.count} role="status">
        Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} products
      </p>
      {filtered.length === 0 ? (
        <div className="message"><h2>No products found</h2><p>Try a different search or clear your filters.</p></div>
      ) : (
        <div className={styles.grid}>
          {sorted.slice(0, visibleCount).map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
      {visibleCount < filtered.length && (
        <div className={styles.more}><button className="secondary" onClick={() => setVisibleCount(count => count + 12)}>Show more products</button></div>
      )}
    </>
  );
}
