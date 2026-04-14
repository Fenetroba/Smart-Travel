export default function ValidationError({ message }) {
  if (!message) return null;

  return (
    <span className="text-red-400 text-sm flex items-center gap-1">
      <span>⚠</span>
      <span>{message}</span>
    </span>
  );
}
