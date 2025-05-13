import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import RecuperarPassword from './pages/RecuperarPassword'
import Dashboard from './pages/Dashboard/Dashboard'
import MapaGeoespacial from './pages/Dashboard/MapaGeoespacial'
import MiParcela from './pages/Dashboard/MiParcela'
import Pagos from './pages/Dashboard/Pagos'
import HistorialPagos from './pages/Dashboard/HistorialPagos'
import Estadisticas from './pages/Dashboard/Estadisticas'
import Perfil from './pages/Dashboard/Perfil'
import Calendario from './pages/Dashboard/Calendario'
import Layout from './components/Layout'
import './App.css'

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas con Layout compartido */}
        <Route path="/" element={<Layout><Login /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/registro" element={<Layout><Register /></Layout>} />
        <Route path="/recuperar" element={<Layout><RecuperarPassword /></Layout>} />
        
        {/* Rutas del dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/admin" element={<Dashboard userRole="Administrador" />} />
        <Route path="/dashboard/copropietario" element={<Dashboard userRole="Copropietario" />} />
        
        {/* Rutas específicas del dashboard */}
        <Route path="/dashboard/mapa" element={<Dashboard><MapaGeoespacial /></Dashboard>} />
        <Route path="/dashboard/parcela" element={<Dashboard><MiParcela /></Dashboard>} />
        <Route path="/dashboard/pagos" element={<Dashboard><Pagos /></Dashboard>} />
        <Route path="/dashboard/historial-pagos" element={<Dashboard><HistorialPagos /></Dashboard>} />
        <Route path="/dashboard/estadisticas" element={<Dashboard><Estadisticas /></Dashboard>} />
        <Route path="/dashboard/perfil" element={<Dashboard><Perfil /></Dashboard>} />
        <Route path="/dashboard/calendario" element={<Dashboard><Calendario /></Dashboard>} />
        
        {/* Capturar todas las subrutas del dashboard */}
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
