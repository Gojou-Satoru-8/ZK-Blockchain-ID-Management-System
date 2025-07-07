export default function CircularSpinner({ className = "", size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-spin text-gray-600 dark:text-gray-400 ${className}`}
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner-circle {
          animation: spin 2s linear infinite;
          transform-origin: center;
        }
      `}</style>

      {/* Background circle */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        className="opacity-20"
      />

      {/* Animated arc */}
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        className="spinner-circle"
      />
    </svg>
  );
}
