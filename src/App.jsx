import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './paginas/Login.jsx'
import Registro from './paginas/Registro.jsx'
import Panel from './paginas/Panel.jsx'
import Diagnostico from './paginas/Diagnostico.jsx'
import InformeResultados from './paginas/InformeResultados.jsx'
import PlanEstrategico from './paginas/PlanEstrategico.jsx'
import Historial from './paginas/Historial.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/panel" element={<Panel />} />
      <Route path="/diagnostico" element={<Diagnostico />} />
      <Route path="/resultados/:id" element={<InformeResultados />} />
      <Route path="/plan/:id" element={<PlanEstrategico />} />
      <Route path="/historial" element={<Historial />} />
    </Routes>
  )
}
