interface ErrorMessageProps {
  errors: string[];
}

export function ErrorMessage({ errors }: ErrorMessageProps) {
  if (errors.length === 0) return null;

  return (
    <div className="error-banner">
      <div className="error-banner-header">
        <i className="fa-solid fa-triangle-exclamation"></i>
        <h4>Parsing Warnings / Errors</h4>
      </div>
      <ul>
        {errors.map((err, i) => (
          <li key={i}>{err}</li>
        ))}
      </ul>
    </div>
  );
}
