import { useState } from 'react'
import Aviso from './Aviso.jsx'
import { DialogoConfirmar, DialogoEdicion } from './Dialogo.jsx'
import { BarraDeProgreso, ChipEstadoTarea, FechaLimite } from './TareaPlan.jsx'
import { mensajeDeError } from '../servicios/api'
import { avanzarNivel, editarTarea, registrarRecomendacion } from '../servicios/consultoria'
import {
  ESTADOS_TAREA,
  agruparPorNivel,
  avanceDelSiguienteNivel,
  estadoDe,
  nivelMaximo,
  nombreDeNivel,
} from '../servicios/plan'
import { formatearFecha } from '../servicios/validaciones'

const BOTON = 'h-9 px-3 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md disabled:opacity-60'
const BOTON_PRIMARIO = 'h-10 px-5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold disabled:opacity-60'
const SI_NO = [
  { valor: 'si', texto: 'Sí' },
  { valor: 'no', texto: 'No' },
]

// Plan de mejora de la empresa: las recomendaciones son tareas para llegar al
// siguiente nivel de madurez. El consultor las gestiona (estado, fecha, nivel),
// agrega más y confirma cuándo la empresa alcanzó el nivel.
export default function PlanDeMejoraConsultor({ diagnostico, cuestionario, alCambiar }) {
  const [dialogo, setDialogo] = useState(null)
  const [mensaje, setMensaje] = useState({ tipo: 'info', texto: '' })
  const [error, setError] = useState('')

  const niveles = cuestionario.niveles
  const maximo = nivelMaximo(niveles)
  const grupos = agruparPorNivel(diagnostico)
  const avance = avanceDelSiguienteNivel(diagnostico)
  const enMaximo = avance.actual >= maximo
  const puedeConfirmar = !enMaximo && avance.total > 0 && avance.completadas === avance.total
  const nombre = (n) => nombreDeNivel(niveles, n)
  const etiquetaNivel = (n) => (nombre(n) ? `${n} · ${nombre(n)}` : String(n))
  const cerrar = () => {
    setDialogo(null)
    setError('')
  }

  // Ejecuta una acción, recarga el diagnóstico y devuelve true si salió bien.
  async function ejecutar(accion, exito) {
    setMensaje({ tipo: 'info', texto: '' })
    setError('')
    try {
      await accion()
      setMensaje({ tipo: 'exito', texto: exito })
      await alCambiar()
      return true
    } catch (falla) {
      const texto = mensajeDeError(falla)
      setError(texto)
      setMensaje({ tipo: 'error', texto })
      return false
    }
  }

  const cambiarEstado = (tarea, estado) =>
    ejecutar(() => editarTarea(diagnostico.id, tarea.id, { estado }), `Tarea «${tarea.titulo}»: ${ESTADOS_TAREA.find((e) => e.valor === estado).texto.toLowerCase()}.`)

  function guardarEdicion(tarea, v) {
    const cambios = {}
    if (v.titulo.trim() !== tarea.titulo) cambios.titulo = v.titulo.trim()
    if (v.contenido.trim() !== tarea.contenido) cambios.contenido = v.contenido.trim()
    if (v.estado !== estadoDe(tarea)) cambios.estado = v.estado
    if (v.fecha_limite !== (tarea.fecha_limite ?? '')) cambios.fecha_limite = v.fecha_limite || null
    if (Number(v.nivel_objetivo) !== tarea.nivel_objetivo) cambios.nivel_objetivo = Number(v.nivel_objetivo)
    if ((v.visible === 'si') !== tarea.visible) cambios.visible = v.visible === 'si'
    if (Object.keys(cambios).length === 0) return Promise.resolve(true)
    return ejecutar(() => editarTarea(diagnostico.id, tarea.id, cambios), 'Tarea actualizada.')
  }

  function agregar(v) {
    return ejecutar(
      () =>
        registrarRecomendacion(diagnostico.id, {
          titulo: v.titulo,
          contenido: v.contenido,
          dimension: v.dimension,
          visible: v.visible === 'si',
          fecha_limite: v.fecha_limite || null,
          nivel_objetivo: Number(v.nivel_objetivo),
        }),
      'Tarea agregada.',
    )
  }

  const camposDeTarea = (tarea) => [
    { nombre: 'titulo', etiqueta: 'Título', valor: tarea.titulo, requerido: true, maxLength: 200 },
    { nombre: 'contenido', etiqueta: 'Qué debe hacer la empresa', valor: tarea.contenido, tipo: 'textarea', requerido: true, maxLength: 2000 },
    {
      nombre: 'estado',
      etiqueta: 'Estado',
      tipo: 'select',
      valor: estadoDe(tarea),
      opciones: ESTADOS_TAREA,
    },
    { nombre: 'fecha_limite', etiqueta: 'Fecha límite (opcional)', valor: tarea.fecha_limite ?? '', tipo: 'date' },
    {
      nombre: 'nivel_objetivo',
      etiqueta: 'Nivel al que ayuda a llegar',
      valor: String(tarea.nivel_objetivo ?? avance.siguiente),
      tipo: 'number',
      // Una tarea de un nivel ya confirmado conserva su valor; los cambios deben apuntar adelante.
      min: Math.min(avance.actual + 1, tarea.nivel_objetivo ?? avance.siguiente),
      requerido: true,
      ayuda: () => `Entre ${avance.actual + 1} y ${maximo}.`,
    },
    {
      nombre: 'visible',
      etiqueta: '¿Visible para la empresa?',
      tipo: 'select',
      valor: tarea.visible ? 'si' : 'no',
      opciones: SI_NO,
    },
  ]

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-headline-md text-headline-md font-bold">Plan de mejora</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Cada recomendación es una tarea para que la empresa llegue al siguiente nivel de madurez. Usted cambia su
            estado y su fecha, agrega más y confirma cuándo se alcanzó el nivel.
          </p>
        </div>
        <button className={BOTON_PRIMARIO} onClick={() => setDialogo({ tipo: 'agregar' })} type="button">
          Agregar tarea
        </button>
      </div>

      <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>

      {diagnostico.nuevo_diagnostico_recomendado && (
        <p className="bg-secondary-container/40 text-on-surface rounded-md p-3 font-body-md text-body-md" data-testid="aviso-nuevo-diagnostico">
          La empresa avanzó {diagnostico.niveles_para_nuevo_diagnostico} niveles desde este diagnóstico: se recomienda
          cerrarlo para que inicie uno nuevo y medir su progreso real.
        </p>
      )}

      <div className="bg-surface-container-low rounded-lg p-4 flex flex-col gap-2" data-testid="avance-de-nivel">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-label-caps text-label-caps text-outline uppercase">Nivel actual de la empresa</span>
            <div className="font-headline-sm text-headline-sm font-bold">{etiquetaNivel(avance.actual)}</div>
          </div>
          {!enMaximo && (
            <button
              className={BOTON_PRIMARIO}
              disabled={!puedeConfirmar}
              onClick={() => setDialogo({ tipo: 'avanzar' })}
              type="button"
            >
              Confirmar que alcanzó el nivel {avance.siguiente}
            </button>
          )}
        </div>
        {enMaximo ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">La empresa está en el nivel máximo de la rúbrica.</p>
        ) : (
          <>
            <BarraDeProgreso
              completadas={avance.completadas}
              etiqueta={`Progreso hacia el nivel ${avance.siguiente}`}
              total={avance.total}
            />
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {avance.total === 0
                ? `No hay tareas compartidas para llegar al nivel ${etiquetaNivel(avance.siguiente)}: agregue al menos una.`
                : `${avance.completadas} de ${avance.total} tareas completadas para llegar al nivel ${etiquetaNivel(avance.siguiente)}.`}
              {avance.total > 0 && !puedeConfirmar && ' Complete todas para poder confirmarlo.'}
            </p>
          </>
        )}
        {diagnostico.avances_de_nivel?.length > 0 && (
          <ul className="font-body-sm text-body-sm text-on-surface-variant list-disc list-inside">
            {diagnostico.avances_de_nivel.map((a) => (
              <li key={a.nivel}>
                Nivel {etiquetaNivel(a.nivel)} confirmado el {formatearFecha(a.alcanzado_en)}
                {a.consultor_nombre ? ` por ${a.consultor_nombre}` : ''}.
              </li>
            ))}
          </ul>
        )}
      </div>

      {grupos.length === 0 && (
        <p className="font-body-md text-body-md text-on-surface-variant">Todavía no hay tareas en el plan de esta empresa.</p>
      )}

      {grupos.map((grupo) => (
        <div className="flex flex-col gap-2" key={grupo.nivel}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-headline-sm text-headline-sm font-bold">Para llegar al nivel {etiquetaNivel(grupo.nivel)}</h3>
            <span className="font-label-md text-label-md text-on-surface-variant">
              {grupo.nivel <= avance.actual ? 'Nivel alcanzado · ' : ''}
              {grupo.completadas} de {grupo.total} completadas
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {grupo.tareas.map((tarea) => {
              const bloqueada = grupo.nivel <= avance.actual && estadoDe(tarea) === 'completada'
              return (
                <li className="bg-surface-container-low rounded-lg p-3 flex flex-col gap-2" key={tarea.id ?? tarea.titulo}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="font-label-lg text-label-lg font-bold">{tarea.titulo}</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <ChipEstadoTarea tarea={tarea} />
                        <FechaLimite tarea={tarea} />
                        {!tarea.visible && (
                          <span className="font-label-caps text-label-caps bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
                            No compartida
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        aria-label={`Estado de ${tarea.titulo}`}
                        className="h-9 px-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md disabled:opacity-60"
                        disabled={bloqueada}
                        onChange={(e) => cambiarEstado(tarea, e.target.value)}
                        value={estadoDe(tarea)}
                      >
                        {ESTADOS_TAREA.map((e) => (
                          <option key={e.valor} value={e.valor}>{e.texto}</option>
                        ))}
                      </select>
                      <button
                        aria-label={`Editar tarea ${tarea.titulo}`}
                        className={BOTON}
                        onClick={() => setDialogo({ tipo: 'editar', tarea })}
                        type="button"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{tarea.contenido}</p>
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      {dialogo?.tipo === 'editar' && (
        <DialogoEdicion
          campos={camposDeTarea(dialogo.tarea)}
          error={error}
          onCerrar={cerrar}
          onGuardar={(v) => guardarEdicion(dialogo.tarea, v)}
          titulo="Editar tarea"
        />
      )}
      {dialogo?.tipo === 'agregar' && (
        <DialogoEdicion
          campos={[
            { nombre: 'titulo', etiqueta: 'Título', valor: '', requerido: true, maxLength: 200 },
            { nombre: 'contenido', etiqueta: 'Qué debe hacer la empresa', valor: '', tipo: 'textarea', requerido: true, maxLength: 2000 },
            {
              nombre: 'dimension',
              etiqueta: 'Dimensión (opcional)',
              tipo: 'select',
              valor: '',
              vacio: 'General',
              opciones: [...cuestionario.dimensiones].sort((a, b) => a.orden - b.orden).map((d) => ({ valor: d.codigo, texto: d.nombre })),
            },
            {
              nombre: 'nivel_objetivo',
              etiqueta: 'Nivel al que ayuda a llegar',
              valor: String(Math.min(avance.siguiente, maximo)),
              tipo: 'number',
              min: avance.actual + 1,
              requerido: true,
              ayuda: () => `Entre ${avance.actual + 1} y ${maximo}.`,
            },
            { nombre: 'fecha_limite', etiqueta: 'Fecha límite (opcional)', valor: '', tipo: 'date' },
            { nombre: 'visible', etiqueta: '¿Compartir con la empresa ahora?', tipo: 'select', valor: 'si', opciones: SI_NO },
          ]}
          error={error}
          onCerrar={cerrar}
          onGuardar={agregar}
          titulo="Agregar tarea"
        />
      )}
      {dialogo?.tipo === 'avanzar' && (
        <DialogoConfirmar
          mensaje="Queda registrado que la empresa alcanzó este nivel y se avisa al representante. Después podrá agregar las tareas para el siguiente."
          onCerrar={cerrar}
          onConfirmar={() => ejecutar(() => avanzarNivel(diagnostico.id), `La empresa alcanzó el nivel ${avance.siguiente}.`)}
          textoConfirmar="Confirmar nivel"
          titulo={`¿Confirmar que la empresa alcanzó el nivel ${etiquetaNivel(avance.siguiente)}?`}
        />
      )}
    </section>
  )
}
