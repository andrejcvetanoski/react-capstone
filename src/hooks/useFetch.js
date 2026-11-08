import { useEffect, useState } from 'react';
import { getData } from '../api/products';

export default function useFetch(endpoint) {
  const [result, setResult] = useState({ endpoint: null, data: null, loading: true, error: '' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setResult({ endpoint, data: null, loading: true, error: '' });

    async function load() {
      try {
        const data = await getData(endpoint, controller.signal);
        if (!controller.signal.aborted) {
          setResult({ endpoint, data, loading: false, error: '' });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({ endpoint, data: null, loading: false, error: error.message || 'Please check your connection and try again.' });
        }
      }
    }
    load();
    // Ignore old requests when navigating away or changing the product ID.
    return () => controller.abort();
  }, [endpoint, attempt]);

  function retry() {
    setResult({ endpoint, data: null, loading: true, error: '' });
    setAttempt(value => value + 1);
  }

  // Do not show the previous product before the new effect starts.
  if (result.endpoint !== endpoint) return { data: null, loading: true, error: '', retry };
  return { ...result, retry };
}
