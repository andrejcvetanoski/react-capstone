export default function RequestState({ loading, error, retry }) {
  if (loading) return <div className="message" role="status"><span className="spinner" aria-hidden="true"></span>Loading products…</div>;
  return (
    <div className="message">
      <p role="alert">{error}</p>
      <button type="button" onClick={retry}>Try again</button>
    </div>
  );
}
