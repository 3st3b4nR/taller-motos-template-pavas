export default function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="alert-error">
      <span>⚠ {message}</span>
      {onClose && (
        <button type="button" className="close-btn" onClick={onClose}>✕</button>
      )}
    </div>
  );
}
