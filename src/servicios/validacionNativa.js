// Mensajes de validación de los formularios en español.
//
// Los avisos nativos del navegador («Please check this box…») salen en el
// idioma del navegador, no de la aplicación. Se reemplazan por textos en
// español para todos los campos con una sola escucha global, sin tocar el
// diseño de ningún formulario. La regla sigue siendo del navegador (required,
// type, min, max…); el backend valida de nuevo todo lo que recibe.

export function mensajeDeValidacion(campo) {
  const v = campo.validity
  if (!v || v.valid) return ''

  if (v.valueMissing) {
    if (campo.type === 'checkbox') return 'Debe marcar esta casilla para continuar.'
    if (campo.type === 'radio') return 'Seleccione una de las opciones.'
    if (campo.tagName === 'SELECT') return 'Seleccione una opción de la lista.'
    if (campo.type === 'file') return 'Seleccione un archivo.'
    return 'Complete este campo.'
  }
  if (v.typeMismatch) {
    if (campo.type === 'email') return 'Escriba un correo electrónico válido, por ejemplo nombre@empresa.com.'
    if (campo.type === 'url') return 'Escriba una dirección web válida.'
    return 'El valor no tiene el formato esperado.'
  }
  if (v.patternMismatch) return campo.title || 'El valor no tiene el formato esperado.'
  if (v.tooShort) return `Use al menos ${campo.minLength} caracteres.`
  if (v.tooLong) return `Use como máximo ${campo.maxLength} caracteres.`
  if (v.rangeUnderflow) return `El valor debe ser mayor o igual a ${campo.min}.`
  if (v.rangeOverflow) return `El valor debe ser menor o igual a ${campo.max}.`
  if (v.stepMismatch) return 'Escriba un valor válido.'
  if (v.badInput) return 'Escriba un número válido.'
  return 'El valor no es válido.'
}

// Se instala una sola vez, en el arranque de la aplicación.
export function activarMensajesEnEspanol(documento = document) {
  // El evento «invalid» no burbujea: se escucha en la fase de captura.
  documento.addEventListener(
    'invalid',
    (evento) => {
      const campo = evento.target
      if (campo?.setCustomValidity) campo.setCustomValidity(mensajeDeValidacion(campo))
    },
    true,
  )
  // Al corregir el campo se limpia el mensaje para que el navegador revalide.
  const limpiar = (evento) => {
    if (evento.target?.setCustomValidity) evento.target.setCustomValidity('')
  }
  documento.addEventListener('input', limpiar, true)
  documento.addEventListener('change', limpiar, true)
}
