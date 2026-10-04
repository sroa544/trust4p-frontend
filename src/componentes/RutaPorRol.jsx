import { Navigate, useLocation } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'

export default function RutaPorRol({ children, roles }) {
  const { estado, puede } = useSesion()
  const ubicacion = useLocation()

  if (estado === 'cargando') {
    return (
      <main className="w-full flex-1 flex items-center justify-center p-margin">
        <span className="font-body-md text-body-md text-on-surface-variant" role="status">
          Verificando sesión…
        </span>
      </main>
    )
  }

  if (estado === 'anonimo') {
    return <Navigate replace state={{ desde: ubicacion.pathname }} to="/login" />
  }

  if (!puede(roles)) return <Navigate replace to="/panel" />

  return children
}
