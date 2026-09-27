import { Routes, Route, Navigate } from 'react-router-dom'

import AsistenteChat from './componentes/AsistenteChat.jsx'
import RutaPorRol from './componentes/RutaPorRol.jsx'
import Login from './paginas/Login.jsx'
import Registro from './paginas/Registro.jsx'
import Panel from './paginas/Panel.jsx'
import Diagnostico from './paginas/Diagnostico.jsx'
import InformeResultados from './paginas/InformeResultados.jsx'
import PlanEstrategico from './paginas/PlanEstrategico.jsx'
import EvolucionHistorica from './paginas/EvolucionHistorica.jsx'
import PanelAuditoria from './paginas/PanelAuditoria.jsx'
import GestionCalibracion from './paginas/GestionCalibracion.jsx'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/panel" element={<Panel />} />

        <Route
          path="/diagnostico"
          element={
            <RutaPorRol roles={['A2']}>
              <Diagnostico />
            </RutaPorRol>
          }
        />
        <Route
          path="/resultados/:id"
          element={
            <RutaPorRol roles={['A2', 'A3']}>
              <InformeResultados />
            </RutaPorRol>
          }
        />
        <Route
          path="/plan/:id"
          element={
            <RutaPorRol roles={['A2', 'A3']}>
              <PlanEstrategico />
            </RutaPorRol>
          }
        />
        <Route
          path="/historial"
          element={
            <RutaPorRol roles={['A2', 'A3']}>
              <EvolucionHistorica />
            </RutaPorRol>
          }
        />
        <Route
          path="/auditoria"
          element={
            <RutaPorRol roles={['A4']}>
              <PanelAuditoria />
            </RutaPorRol>
          }
        />
        <Route
          path="/gestion"
          element={
            <RutaPorRol roles={['A4']}>
              <GestionCalibracion />
            </RutaPorRol>
          }
        />
      </Routes>

      <AsistenteChat />
    </>
  )
}