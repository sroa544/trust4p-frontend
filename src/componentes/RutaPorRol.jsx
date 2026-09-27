import { Navigate } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'

export default function RutaPorRol({ children, roles }) {
  const { puede } = useSesion()

  if (!puede(roles)) return <Navigate replace to="/panel" />

  return children
}
