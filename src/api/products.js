const BASE_URL = 'https://dummyjson.com';

export async function getData(endpoint, signal) {
  const response = await fetch(`${BASE_URL}${endpoint}`, { signal });
  if (!response.ok) {
    if (response.status === 404) throw new Error('This product could not be found.');
    throw new Error('We could not load the products. Please try again.');
  }
  return response.json();
}

// Fetch every product so search and category filtering cover the entire catalog.
export const PRODUCTS_URL = '/products?limit=0&select=id,title,price,thumbnail,category,stock';
