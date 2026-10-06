import { useEffect, useState } from 'react'
import { obtenerModeloVigente } from '../servicios/modelo'
import { numero } from '../servicios/validaciones'

// Estructura pública del modelo vigente: la página de inicio muestra siempre lo
// que está publicado (dimensiones y niveles), no un texto fijo. Si el
// administrador agrega, renombra o quita dimensiones, aquí se refleja.

export function useModeloVigente() {
  const [estado, setEstado] = useState({ cargando: true, modelo: null })
  useEffect(() => {
    let activo = true
    obtenerModeloVigente()
      .then((modelo) => activo && setEstado({ cargando: false, modelo }))
      .catch(() => activo && setEstado({ cargando: false, modelo: null }))
    return () => {
      activo = false
    }
  }, [])
  return estado
}

const ESTILOS_DIMENSION = [
  { barra: 'bg-primary', caja: 'bg-primary/10 text-primary', etiqueta: 'text-primary' },
  { barra: 'bg-secondary', caja: 'bg-secondary/15 text-secondary', etiqueta: 'text-secondary' },
  { barra: 'bg-tertiary-container', caja: 'bg-tertiary-fixed/50 text-tertiary', etiqueta: 'text-tertiary' },
  { barra: 'bg-on-surface', caja: 'bg-surface-variant text-on-surface', etiqueta: 'text-on-surface-variant' },
]
const ICONOS_DIMENSION = ['track_changes', 'published_with_changes', 'groups_3', 'layers', 'category', 'insights']

const ESTILO_NIVEL_INICIAL = { insignia: 'bg-surface-variant text-on-surface-variant', icono: 'text-outline', pie: 'text-outline', punto: 'bg-outline', glifo: 'lock_clock' }
const ESTILOS_NIVEL_INTERMEDIO = [
  { insignia: 'bg-secondary-fixed/40 text-secondary', icono: 'text-secondary', pie: 'text-secondary', punto: 'bg-secondary', glifo: 'update' },
  { insignia: 'bg-tertiary-fixed text-tertiary', icono: 'text-tertiary', pie: 'text-tertiary', punto: 'bg-tertiary', glifo: 'sync' },
]
const ESTILO_NIVEL_FINAL = { insignia: 'bg-primary text-on-primary', icono: 'text-primary', pie: 'text-primary font-semibold', punto: 'bg-primary', glifo: 'stars' }

function estiloDeNivel(indice, total) {
  if (indice === 0) return ESTILO_NIVEL_INICIAL
  if (indice === total - 1) return ESTILO_NIVEL_FINAL
  return ESTILOS_NIVEL_INTERMEDIO[(indice - 1) % ESTILOS_NIVEL_INTERMEDIO.length]
}

// Las dos primeras tarjetas del encabezado: dimensiones y escala del modelo.
export function ResumenDelModelo({ modelo }) {
  const dimensiones = modelo?.dimensiones ?? []
  const niveles = modelo?.niveles ?? []
  return (
    <>
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 text-primary mb-2">
          <span className="material-symbols-outlined text-headline-md">hub</span>
          <span className="font-headline-lg text-headline-lg text-on-surface">{modelo ? dimensiones.length : '—'}</span>
        </div>
        <p className="font-label-md text-label-md text-on-surface-variant font-medium">Dimensiones Clave</p>
        <span className="font-body-sm text-body-sm text-outline mt-0.5">
          {modelo ? dimensiones.map((d) => d.nombre).join(', ') : 'Cargando el modelo vigente…'}
        </span>
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 text-secondary mb-2">
          <span className="material-symbols-outlined text-headline-md">timeline</span>
          <span className="font-headline-lg text-headline-lg text-on-surface">
            {niveles.length ? `N${niveles[0].numero}–N${niveles[niveles.length - 1].numero}` : '—'}
          </span>
        </div>
        <p className="font-label-md text-label-md text-on-surface-variant font-medium">Escala de Madurez</p>
        <span className="font-body-sm text-body-sm text-outline mt-0.5">
          {niveles.length ? niveles.map((n) => n.nombre).join(' · ') : 'Cargando el modelo vigente…'}
        </span>
      </div>
    </>
  )
}

export function SeccionDimensiones({ modelo }) {
  if (!modelo?.dimensiones.length) return null
  const { dimensiones } = modelo
  return (
    <section className="w-full py-12 sm:py-16">
      <div className="flex flex-col items-start gap-2 mb-10">
        <div className="flex items-center gap-2">
          <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">Estructura Diagnóstica</span>
        </div>
        <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
          {dimensiones.length === 1 ? 'La dimensión del modelo Trust 4P' : `Las ${dimensiones.length} dimensiones del modelo Trust 4P`}
        </h2>
        <div className="h-1 w-20 rounded-full bg-gradient-to-r from-primary to-secondary-container"></div>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mt-1">
          Una estructura integral e interconectada para diagnosticar la capacidad real de innovar en cada nivel organizacional, desde la estrategia de junta directiva hasta el código y la experimentación diaria.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dimensiones.map((d, i) => {
          const estilo = ESTILOS_DIMENSION[i % ESTILOS_DIMENSION.length]
          return (
            <div className="group bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden" key={d.codigo}>
              <div className={`absolute top-0 left-0 right-0 h-1 ${estilo.barra}`}></div>
              <div>
                <div className={`w-12 h-12 rounded-lg ${estilo.caja} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <span className="material-symbols-outlined text-headline-lg">{ICONOS_DIMENSION[i % ICONOS_DIMENSION.length]}</span>
                </div>
                <span className={`font-label-caps text-label-caps ${estilo.etiqueta} uppercase font-bold tracking-wider`}>Dimensión {String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1 mb-2">{i + 1}. {d.nombre}</h3>
                {d.descripcion && (
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{d.descripcion}</p>
                )}
              </div>
              <div className="mt-6 pt-4 bg-surface-container-low -mx-6 -mb-6 p-4 flex flex-col gap-1">
                <span className="font-label-caps text-label-caps text-outline uppercase font-semibold">Peso en el índice</span>
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">{numero(Number(d.peso) * 100)} %</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function SeccionNiveles({ modelo }) {
  if (!modelo?.niveles.length) return null
  const { niveles } = modelo
  const primero = niveles[0]
  const ultimo = niveles[niveles.length - 1]
  const intermedios = niveles.slice(1, -1)
  return (
    <section className="w-full py-12 sm:py-16 bg-surface-container-low rounded-2xl p-6 sm:p-10 mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <span className="font-label-caps text-label-caps uppercase tracking-wider text-primary">Matriz de Evolución</span>
          <h2 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Escala de Madurez Organizacional (N{primero.numero} a N{ultimo.numero})
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            El modelo Trust 4P diagnostica el comportamiento real de la organización y ubica su capacidad de innovar en una escala de {niveles.length} niveles de madurez.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-lowest p-1.5 rounded-lg shadow-sm">
          <span className="font-label-caps text-label-caps text-outline px-2">Nivel Objetivo:</span>
          <span className="px-2.5 py-1 rounded bg-secondary-container/40 text-primary font-label-md text-label-md font-semibold">N{ultimo.numero} {ultimo.nombre}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {niveles.map((n, i) => {
          const estilo = estiloDeNivel(i, niveles.length)
          const esUltimo = i === niveles.length - 1
          return (
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden" key={n.numero}>
              {esUltimo && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/15 to-transparent rounded-bl-full pointer-events-none"></div>
              )}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-full ${estilo.insignia} font-label-caps text-label-caps font-bold`}>NIVEL {n.numero}</span>
                  <span
                    className={`material-symbols-outlined ${estilo.icono} text-body-md`}
                    style={esUltimo ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {estilo.glifo}
                  </span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2">{n.nombre}</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{n.descripcion}</p>
              </div>
              <div className={`mt-4 pt-3 flex items-center gap-2 ${estilo.pie} font-label-md text-label-md`}>
                <span className={`w-2 h-2 rounded-full ${estilo.punto}`}></span>
                <span>{numero(n.umbral_min, 2)} a {numero(n.umbral_max, 2)} puntos</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 pt-6">
        <div className="flex items-center justify-between text-label-caps font-label-caps text-outline mb-2">
          <span>Madurez Inicial (N{primero.numero})</span>
          {intermedios.length > 0 && (
            <span>
              Madurez Intermedia (N{intermedios[0].numero}
              {intermedios.length > 1 ? ` - N${intermedios[intermedios.length - 1].numero}` : ''})
            </span>
          )}
          {niveles.length > 1 && <span>Madurez Transformacional (N{ultimo.numero})</span>}
        </div>
        <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden p-0.5">
          <div className="h-full rounded-full bg-gradient-to-r from-secondary-container via-tertiary-fixed-dim to-primary w-full"></div>
        </div>
      </div>
    </section>
  )
}
