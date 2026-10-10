export function Field({ label, htmlFor, error, hint, required, children }) {
  return (
    <div>
      {label ? (
        <label className="label" htmlFor={htmlFor}>
          {label} {required ? <span className="text-red-500">*</span> : null}
        </label>
      ) : null}
      {children}
      {hint && !error ? <p className="mt-1 text-xs text-navy-400">{hint}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

export function Input({ error, className = '', ...props }) {
  return <input className={`input ${error ? 'input-error' : ''} ${className}`} {...props} />;
}

export function Textarea({ error, className = '', rows = 5, ...props }) {
  return <textarea rows={rows} className={`input ${error ? 'input-error' : ''} ${className}`} {...props} />;
}

export function Select({ error, className = '', children, ...props }) {
  return (
    <select className={`input ${error ? 'input-error' : ''} ${className}`} {...props}>
      {children}
    </select>
  );
}

export default Field;
