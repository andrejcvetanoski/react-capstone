import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import App from '../App';
import { CartProvider } from '../context/CartContext';

const products = [
  { id: 1, title: 'Everyday Notebook', price: 12.50, category: 'stationery', stock: 3, thumbnail: '/notebook.png', description: 'A simple notebook.', rating: 4.5 },
  { id: 2, title: 'Desk Lamp', price: 25, category: 'home-decoration', stock: 2, thumbnail: '/lamp.png', description: 'A small desk lamp.', rating: 4 },
  { id: 3, title: 'Unavailable Pen', price: 4, category: 'stationery', stock: 0, thumbnail: '/pen.png' },
];

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CartProvider><App /></CartProvider>
    </MemoryRouter>,
  );
}

function mockProducts() {
  vi.stubGlobal('fetch', vi.fn(async url => {
    const id = url.match(/\/products\/(\d+)$/)?.[1];
    const product = products.find(item => item.id === Number(id));
    return { ok: !id || Boolean(product), status: product || !id ? 200 : 404,
      json: async () => id ? product : { products } };
  }));
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

test('shows a loading message while the API request is pending', () => {
  vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
  renderApp();
  expect(screen.getByText('Loading products…')).toBeInTheDocument();
});

test('search and category filters work together and can be reset', async () => {
  mockProducts();
  const user = userEvent.setup();
  renderApp();
  await screen.findByRole('heading', { name: 'Everyday Notebook' });
  await user.type(screen.getByLabelText('Search products'), 'NOTEBOOK');
  expect(screen.queryByRole('heading', { name: 'Desk Lamp' })).not.toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Category'), 'home-decoration');
  expect(screen.getByRole('heading', { name: 'No products found' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(screen.getByRole('heading', { name: 'Desk Lamp' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Everyday Notebook' })).toBeInTheDocument();
});

test('cart state is shared across pages, quantities update totals, and removal empties it', async () => {
  mockProducts();
  const user = userEvent.setup();
  renderApp();
  const title = await screen.findByRole('heading', { name: 'Everyday Notebook' });
  const card = title.closest('article');
  await user.click(within(card).getByRole('button', { name: 'Add to cart' }));
  await user.click(screen.getByRole('link', { name: 'Cart (1)' }));
  const summary = screen.getByRole('complementary', { name: 'Cart summary' });
  expect(within(summary).getByText('$12.50')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Increase quantity of Everyday Notebook' }));
  expect(within(summary).getByText('$25.00')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Cart (2)' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Decrease quantity of Everyday Notebook' }));
  expect(within(summary).getByText('$12.50')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Remove Everyday Notebook' }));
  expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Cart (0)' })).toBeInTheDocument();
});

test('product details load directly and can add to the shared cart', async () => {
  mockProducts();
  const user = userEvent.setup();
  renderApp('/products/2');
  expect(await screen.findByRole('heading', { name: 'Desk Lamp' })).toBeInTheDocument();
  expect(screen.getByText('A small desk lamp.')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Add to cart' }));
  expect(screen.getByRole('link', { name: 'Cart (1)' })).toBeInTheDocument();
});

test('failed requests show an error and retry recovers', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: false, status: 500 })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ products }) });
  vi.stubGlobal('fetch', fetchMock);
  const user = userEvent.setup();
  renderApp();
  expect(await screen.findByRole('alert')).toHaveTextContent('We could not load the products');
  await user.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByRole('heading', { name: 'Everyday Notebook' })).toBeInTheDocument();
});

test('stock limits prevent extra additions and out-of-stock products cannot be added', async () => {
  mockProducts();
  const user = userEvent.setup();
  renderApp();
  const heading = await screen.findByRole('heading', { name: 'Desk Lamp' });
  const card = heading.closest('article');
  await user.click(within(card).getByRole('button', { name: 'Add to cart' }));
  await user.click(within(card).getByRole('button', { name: 'Add to cart' }));
  expect(within(card).getByRole('button', { name: 'Stock limit reached' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Out of stock' })).toBeDisabled();
  await user.click(screen.getByRole('link', { name: 'Cart (2)' }));
  expect(screen.getByRole('button', { name: 'Increase quantity of Desk Lamp' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Clear cart' }));
  expect(screen.getByRole('heading', { name: 'Your cart is empty' })).toBeInTheDocument();
});

test('an unknown product displays a helpful error', async () => {
  mockProducts();
  renderApp('/products/999999');
  expect(await screen.findByRole('alert')).toHaveTextContent('This product could not be found');
});

test('an unknown route displays a return link', () => {
  renderApp('/missing-page');
  expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Back to products' })).toHaveAttribute('href', '/');
});


test('recently viewed survives remounting and can be cleared', async () => {
  mockProducts();
  const user = userEvent.setup();
  const app = renderApp('/products/2');
  await screen.findByRole('heading', { name: 'Desk Lamp' });
  await user.click(screen.getByRole('link', { name: /Back to products/ }));
  const recent = await screen.findByRole('region', { name: 'Recently viewed' });
  expect(within(recent).getByRole('link', { name: /Desk Lamp/ })).toBeInTheDocument();
  app.unmount();
  renderApp();
  const restored = await screen.findByRole('region', { name: 'Recently viewed' });
  expect(within(restored).getByRole('link', { name: /Desk Lamp/ })).toBeInTheDocument();
  await user.click(within(restored).getByRole('button', { name: 'Clear history' }));
  expect(screen.queryByRole('region', { name: 'Recently viewed' })).not.toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem('everyday-store-recently-viewed'))).toEqual([]);
});

test('invalid saved history does not break the product page', async () => {
  localStorage.setItem('everyday-store-recently-viewed', 'broken JSON');
  mockProducts();
  renderApp();
  expect(await screen.findByRole('heading', { name: 'Desk Lamp' })).toBeInTheDocument();
  expect(screen.queryByRole('region', { name: 'Recently viewed' })).not.toBeInTheDocument();
});

test('the cart is saved in the browser and is still there after a reload', async () => {
  mockProducts();
  const user = userEvent.setup();
  const app = renderApp();
  const title = await screen.findByRole('heading', { name: 'Everyday Notebook' });
  await user.click(within(title.closest('article')).getByRole('button', { name: 'Add to cart' }));
  expect(screen.getByRole('link', { name: 'Cart (1)' })).toBeInTheDocument();
  app.unmount();
  renderApp();
  expect(await screen.findByRole('link', { name: 'Cart (1)' })).toBeInTheDocument();
});

test('a broken saved cart is ignored and the cart starts empty', async () => {
  localStorage.setItem('everyday-store-cart', 'broken JSON');
  mockProducts();
  renderApp();
  expect(await screen.findByRole('heading', { name: 'Everyday Notebook' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Cart (0)' })).toBeInTheDocument();
});

test('the dark mode button switches the theme and remembers it', async () => {
  mockProducts();
  const user = userEvent.setup();
  renderApp();
  await screen.findByRole('heading', { name: 'Everyday Notebook' });
  await user.click(screen.getByRole('button', { name: 'Dark mode' }));
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  expect(localStorage.getItem('everyday-store-theme')).toBe('dark');
  await user.click(screen.getByRole('button', { name: 'Light mode' }));
  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  expect(localStorage.getItem('everyday-store-theme')).toBe('light');
});
