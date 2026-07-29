export default function Spinner({ label = 'Cargando...', center = false }) {
  if (center) {
    return (
      <div className="loading-center">
        <div className="spinner spinner-lg" />
        <span>{label}</span>
      </div>
    );
  }
  return <div className="spinner" />;
}
