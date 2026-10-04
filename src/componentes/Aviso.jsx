const ESTILOS = {
  error: 'bg-error-container text-on-error-container',
  exito: 'bg-tertiary-fixed/40 text-tertiary',
  info: 'bg-secondary-container/40 text-on-surface',
}

// Mensaje de estado accesible (errores del servidor, confirmaciones).
export default function Aviso({ tipo = 'info', children, className = '' }) {
  if (!children) return null
  return (
    <p
      className={`p-2.5 rounded-md font-label-md text-label-md ${ESTILOS[tipo]} ${className}`}
      role={tipo === 'error' ? 'alert' : 'status'}
    >
      {children}
    </p>
  )
}
