// El agente redacta en párrafos separados por una línea en blanco, y en las
// recomendaciones cada párrafo empieza por un rótulo: «Qué hacer», «Primeros
// pasos», «Horizonte». Pintado como un solo bloque de texto, aunque conserve
// los saltos, se lee como una pared. Aquí se separa en párrafos y se destaca
// el rótulo cuando lo hay.
//
// La detección es deliberadamente genérica —cualquier párrafo que abra con un
// texto corto seguido de dos puntos— para no acoplar la interfaz a la
// redacción exacta de la plantilla de instrucciones del agente. Si un párrafo
// no trae rótulo, se muestra tal cual.
const ROTULO = /^([^:\n]{3,40}):[ \t]+/

function enParrafos(texto) {
  return texto
    .split(/\n[ \t]*\n/)
    .map((parrafo) => parrafo.trim())
    .filter(Boolean)
}

export default function TextoDelAgente({ texto, clase = '', claseGrupo = '' }) {
  if (typeof texto !== 'string' || !texto.trim()) return null

  const parrafos = enParrafos(texto)

  return (
    <div className={`flex flex-col gap-2 ${claseGrupo}`}>
      {parrafos.map((parrafo, indice) => {
        const hallazgo = ROTULO.exec(parrafo)
        const clave = `${indice}-${parrafo.slice(0, 24)}`

        if (!hallazgo) {
          return (
            <p className={`whitespace-pre-line ${clase}`} key={clave}>
              {parrafo}
            </p>
          )
        }

        return (
          <p className={`whitespace-pre-line ${clase}`} key={clave}>
            <span className="font-bold text-on-surface">{hallazgo[1]}: </span>
            {parrafo.slice(hallazgo[0].length)}
          </p>
        )
      })}
    </div>
  )
}
