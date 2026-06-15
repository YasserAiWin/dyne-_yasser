export default function Input({
  label,
  id,
  type = 'text',
  icon = null,
  hint = null,
  className = '',
  as = 'input',
  options = [],
  children,
  ...props
}) {
  const inputId = id || props.name

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-400">
            {icon}
          </span>
        )}

        {as === 'select' ? (
          <select id={inputId} className={`input-base ${icon ? 'pr-10' : ''}`} {...props}>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            {children}
          </select>
        ) : (
          <input
            id={inputId}
            type={type}
            className={`input-base ${icon ? 'pr-10' : ''}`}
            {...props}
          />
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  )
}
