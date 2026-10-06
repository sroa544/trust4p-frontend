import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BaseConocimiento, { errorDeArchivo } from '../componentes/BaseConocimiento.jsx'
import { ErrorApi } from '../servicios/api'

vi.mock('../servicios/baseConocimiento', async (original) => ({
  ...(await original()),
  listarDocumentos: vi.fn(),
  cargarDocumento: vi.fn(),
  actualizarDocumento: vi.fn(),
  desactivarDocumento: vi.fn(),
  reactivarDocumento: vi.fn(),
}))

const servicios = await import('../servicios/baseConocimiento')

// RF-41: el administrador carga PDF que alimentan al agente. Cargar, actualizar
// o desactivar un documento afecta las evaluaciones siguientes.

const DOCUMENTO = {
  id: 'doc-1',
  titulo: 'Rúbrica oficial',
  categoria: 'rubrica',
  version: '1.0',
  cargado_por: 'admin-1',
  fuente: 'Tesis, capítulo 3',
  activo: true,
  creado_en: '2026-10-01T10:00:00Z',
}

const pdf = (nombre = 'rubrica.pdf', tipo = 'application/pdf', tamano = 1024) => {
  const archivo = new File(['%PDF-1.4'], nombre, { type: tipo })
  Object.defineProperty(archivo, 'size', { value: tamano })
  return archivo
}

const formulario = () => within(screen.getByRole('form', { name: 'Formulario de documento' }))

async function abrir(documentos = [DOCUMENTO]) {
  servicios.listarDocumentos.mockResolvedValue(documentos)
  const usuario = userEvent.setup()
  render(<BaseConocimiento />)
  await screen.findByText(/Base de conocimiento del agente/i)
  return usuario
}

describe('Base de conocimiento', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lista los documentos con su categoría, versión y estado', async () => {
    await abrir()

    const fila = (await screen.findByText('Rúbrica oficial', { selector: 'td' })).closest('tr')
    expect(within(fila).getByText('1.0')).toBeInTheDocument()
    expect(within(fila).getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText(/1 documentos, 1 activos/i)).toBeInTheDocument()
  })

  it('sin documentos avisa que el agente redacta solo con la rúbrica del modelo', async () => {
    await abrir([])

    expect(await screen.findByText(/solo con la rúbrica del modelo/i)).toBeInTheDocument()
  })

  it('carga un documento nuevo y avisa que se usará desde la próxima evaluación', async () => {
    servicios.cargarDocumento.mockResolvedValue({})
    const usuario = await abrir()
    const archivo = pdf()

    await usuario.click(screen.getByRole('button', { name: 'Cargar documento' }))
    await usuario.type(formulario().getByLabelText('Título'), 'Perfiles de cultura')
    await usuario.selectOptions(formulario().getByLabelText(/Categoría/), 'perfiles_cultura')
    await usuario.type(formulario().getByLabelText('Versión'), '1.0')
    await usuario.upload(formulario().getByLabelText(/Archivo PDF/), archivo)
    await usuario.click(formulario().getByRole('button', { name: 'Cargar documento' }))

    await waitFor(() => expect(servicios.cargarDocumento).toHaveBeenCalledTimes(1))
    expect(servicios.cargarDocumento.mock.calls[0][0]).toMatchObject({
      titulo: 'Perfiles de cultura',
      categoria: 'perfiles_cultura',
      version: '1.0',
      archivo,
    })
    expect(await screen.findByText(/Se usará desde la próxima evaluación/i)).toBeInTheDocument()
  })

  it('rechaza un archivo que no es PDF sin llamar al servidor', async () => {
    await abrir()
    // El navegador filtra por `accept`; aquí se simula un archivo que se cuela igual.
    const usuario = userEvent.setup({ applyAccept: false })

    await usuario.click(screen.getByRole('button', { name: 'Cargar documento' }))
    await usuario.type(formulario().getByLabelText('Título'), 'Texto')
    await usuario.type(formulario().getByLabelText('Versión'), '1.0')
    await usuario.upload(formulario().getByLabelText(/Archivo PDF/), pdf('notas.txt', 'text/plain'))
    await usuario.click(formulario().getByRole('button', { name: 'Cargar documento' }))

    expect(await screen.findByText(/Solo se aceptan documentos PDF/i)).toBeInTheDocument()
    expect(servicios.cargarDocumento).not.toHaveBeenCalled()
  })

  it('exige elegir un archivo', async () => {
    const usuario = await abrir()

    await usuario.click(screen.getByRole('button', { name: 'Cargar documento' }))
    await usuario.type(formulario().getByLabelText('Título'), 'Sin archivo')
    await usuario.type(formulario().getByLabelText('Versión'), '1.0')
    await usuario.click(formulario().getByRole('button', { name: 'Cargar documento' }))

    expect(await screen.findByText(/Seleccione un archivo PDF/i)).toBeInTheDocument()
    expect(servicios.cargarDocumento).not.toHaveBeenCalled()
  })

  it('muestra el mensaje del servidor si el PDF no se puede leer', async () => {
    servicios.cargarDocumento.mockRejectedValue(new ErrorApi(422, 'El archivo no es un PDF legible'))
    const usuario = await abrir()

    await usuario.click(screen.getByRole('button', { name: 'Cargar documento' }))
    await usuario.type(formulario().getByLabelText('Título'), 'Roto')
    await usuario.type(formulario().getByLabelText('Versión'), '1.0')
    await usuario.upload(formulario().getByLabelText(/Archivo PDF/), pdf())
    await usuario.click(formulario().getByRole('button', { name: 'Cargar documento' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/no es un PDF legible/i)
  })

  it('una nueva versión actualiza el documento y deja de usar la anterior', async () => {
    servicios.actualizarDocumento.mockResolvedValue({})
    const usuario = await abrir()
    const archivo = pdf('rubrica-v2.pdf')

    await usuario.click(screen.getByRole('button', { name: 'Nueva versión de Rúbrica oficial' }))
    await usuario.type(formulario().getByLabelText('Versión'), '2.0')
    await usuario.upload(formulario().getByLabelText(/Archivo PDF/), archivo)
    await usuario.click(formulario().getByRole('button', { name: 'Cargar nueva versión' }))

    await waitFor(() => expect(servicios.actualizarDocumento).toHaveBeenCalledTimes(1))
    const [id, datos] = servicios.actualizarDocumento.mock.calls[0]
    expect(id).toBe('doc-1')
    expect(datos).toMatchObject({ version: '2.0', titulo: 'Rúbrica oficial', categoria: 'rubrica', archivo })
    expect(await screen.findByText(/La anterior dejó de usarse/i)).toBeInTheDocument()
  })

  it('desactiva un documento y avisa que ya no se usa', async () => {
    servicios.desactivarDocumento.mockResolvedValue({})
    const usuario = await abrir()

    await usuario.click(screen.getByRole('button', { name: 'Desactivar Rúbrica oficial' }))

    await waitFor(() => expect(servicios.desactivarDocumento).toHaveBeenCalledWith('doc-1'))
    expect(await screen.findByText(/ya no se usa en las evaluaciones/i)).toBeInTheDocument()
  })

  it('reactiva un documento inactivo', async () => {
    servicios.reactivarDocumento.mockResolvedValue({})
    const usuario = await abrir([{ ...DOCUMENTO, activo: false }])

    await usuario.click(screen.getByRole('button', { name: 'Reactivar Rúbrica oficial' }))

    await waitFor(() => expect(servicios.reactivarDocumento).toHaveBeenCalledWith('doc-1'))
  })
})

describe('errorDeArchivo', () => {
  it('acepta un PDF y rechaza otros formatos o tamaños', () => {
    expect(errorDeArchivo(pdf())).toBe('')
    expect(errorDeArchivo(pdf('x.PDF', ''))).toBe('') // algunos navegadores no informan el tipo
    expect(errorDeArchivo(pdf('x.doc', 'application/msword'))).toMatch(/PDF/)
    expect(errorDeArchivo(pdf('grande.pdf', 'application/pdf', 21 * 1024 * 1024))).toMatch(/20 MB/)
    expect(errorDeArchivo(null)).toMatch(/Seleccione/)
  })
})
