export default function ErrorState({ message, onRetry }) {
  return (
    <div className="status error" role="alert">
      <p>⚠️ {message}</p>
      <button onClick={onRetry}>Try again</button>
    </div>
  );
}
