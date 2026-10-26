export interface ErrorMessageProps {
  id?: string;
  message?: string | null;
}

function ErrorMessage({ id, message }: ErrorMessageProps) {
  return (
    message && (
      <p
        id={id}
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
