import { Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content" onClick={event => {
        event.preventDefault();
        document.getElementById('main-content').focus();
      }}>Skip to content</a>
      <Header />
      <main id="main-content" tabIndex="-1">
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="*" element={<div className="message"><h1>Page not found</h1><Link to="/">Back to products</Link></div>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
