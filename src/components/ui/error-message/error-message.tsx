export interface ErrorMessageProps {
  message?: string | null;
}

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    message && (
      <p
        role="alert"
        aria-live="polite"
        className="text-sm text-danger bg-danger-bg border border-danger/20 rounded-lg px-3 py-2"
      >
        {message}
      </p>
    )
  );
}

export default ErrorMessage;
