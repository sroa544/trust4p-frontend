import { useEffect, useState } from 'react'
import { mensajeDeError } from '../servicios/api'
import { obtenerCuestionario, obtenerDiagnostico, listarDiagnosticos } from '../servicios/diagnosticos'

// Carga un diagnóstico del representante junto con su cuestionario (nombres de
// dimensiones y rúbrica de la versión aplicada). Si no se indica id, usa el
// diagnóstico con resultado más reciente de la empresa.
export function useResultado(id) {
  const [estado, setEstado] = useState({ fase: 'cargando', diagnostico: null, cuestionario: null, error: '' })

  useEffect(() => {
    let activo = true
    async function cargar() {
      try {
        let idFinal = id
        if (!idFinal || idFinal === 'ultimo') {
          const lista = await listarDiagnosticos()
          const conResultado = lista
            .filter((d) => d.resultado)
            .sort((a, b) => b.consecutivo - a.consecutivo)
          if (!conResultado.length) {
            if (activo) setEstado({ fase: 'vacio', diagnostico: null, cuestionario: null, error: '' })
            return
          }
          idFinal = conResultado[0].id
        }
        const [diagnostico, cuestionario] = await Promise.all([
          obtenerDiagnostico(idFinal),
          obtenerCuestionario(idFinal),
        ])
        if (!activo) return
        setEstado({
          fase: diagnostico.resultado ? 'listo' : 'sinResultado',
          diagnostico,
          cuestionario,
          error: '',
        })
      } catch (falla) {
        if (activo) setEstado({ fase: 'error', diagnostico: null, cuestionario: null, error: mensajeDeError(falla) })
      }
    }
    cargar()
    return () => {
      activo = false
    }
  }, [id])

  return estado
}
