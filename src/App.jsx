import { Routes, Route, Navigate } from 'react-router-dom'

import AsistenteChat from './componentes/AsistenteChat.jsx'
import BarraSesion from './componentes/BarraSesion.jsx'
import MenuLateral from './componentes/MenuLateral.jsx'
import RutaPorRol from './componentes/RutaPorRol.jsx'
import Login from './paginas/Login.jsx'
import Registro from './paginas/Registro.jsx'
import SolicitarAcceso from './paginas/SolicitarAcceso.jsx'
import Demo from './paginas/Demo.jsx'
import RecuperarClave from './paginas/RecuperarClave.jsx'
import RestablecerClave from './paginas/RestablecerClave.jsx'
import Panel from './paginas/Panel.jsx'
import Perfil from './paginas/Perfil.jsx'
import Diagnostico from './paginas/Diagnostico.jsx'
import InformeResultados from './paginas/InformeResultados.jsx'
import PlanEstrategico from './paginas/PlanEstrategico.jsx'
import EvolucionHistorica from './paginas/EvolucionHistorica.jsx'
import Consultoria from './paginas/Consultoria.jsx'
import ConsultoriaEmpresa from './paginas/ConsultoriaEmpresa.jsx'
import ConsultoriaDiagnostico from './paginas/ConsultoriaDiagnostico.jsx'
import Indicadores from './paginas/Indicadores.jsx'
import PanelAuditoria from './paginas/PanelAuditoria.jsx'
import GestionCalibracion from './paginas/GestionCalibracion.jsx'
import Usuarios from './paginas/Usuarios.jsx'

const TODOS = ['A2', 'A3', 'A4']

function Protegida({ roles, children }) {
  return (
    <RutaPorRol roles={roles}>
      <div className="w-full flex-1 flex flex-col lg:flex-row">
        <MenuLateral />
        <div className="flex-1 min-w-0 flex flex-col">{children}</div>
      </div>
    </RutaPorRol>
  )
}

export default function App() {
  return (
    <>
      <BarraSesion />

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/solicitar-acceso" element={<SolicitarAcceso />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/recuperar" element={<RecuperarClave />} />
        <Route path="/restablecer" element={<RestablecerClave />} />

        <Route path="/panel" element={<Protegida roles={TODOS}><Panel /></Protegida>} />
        <Route path="/perfil" element={<Protegida roles={TODOS}><Perfil /></Protegida>} />

        <Route path="/diagnostico" element={<Protegida roles={['A2']}><Diagnostico /></Protegida>} />
        <Route path="/resultados" element={<Protegida roles={['A2']}><InformeResultados /></Protegida>} />
        <Route path="/resultados/:id" element={<Protegida roles={['A2']}><InformeResultados /></Protegida>} />
        <Route path="/plan" element={<Protegida roles={['A2']}><PlanEstrategico /></Protegida>} />
        <Route path="/plan/:id" element={<Protegida roles={['A2']}><PlanEstrategico /></Protegida>} />
        <Route path="/historial" element={<Protegida roles={['A2']}><EvolucionHistorica /></Protegida>} />

        <Route path="/consultoria" element={<Protegida roles={['A3']}><Consultoria /></Protegida>} />
        <Route path="/consultoria/empresas/:empresaId" element={<Protegida roles={['A3']}><ConsultoriaEmpresa /></Protegida>} />
        <Route path="/consultoria/diagnosticos/:id" element={<Protegida roles={['A3']}><ConsultoriaDiagnostico /></Protegida>} />
        <Route path="/indicadores" element={<Protegida roles={['A3', 'A4']}><Indicadores /></Protegida>} />

        <Route path="/gestion" element={<Protegida roles={['A4']}><GestionCalibracion /></Protegida>} />
        <Route path="/usuarios" element={<Protegida roles={['A4']}><Usuarios /></Protegida>} />
        <Route path="/auditoria" element={<Protegida roles={['A4']}><PanelAuditoria /></Protegida>} />

        <Route path="*" element={<Navigate to="/panel" replace />} />
      </Routes>

      <AsistenteChat />
    </>
  )
}
