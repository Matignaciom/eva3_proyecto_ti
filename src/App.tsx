import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import RecuperarPassword from './pages/RecuperarPassword'
import Dashboard from './pages/Dashboard/Dashboard'
import CopropietarioDashboard from './pages/Dashboard/CopropietarioDashboard'
import MapaGeoespacial from './pages/Dashboard/MapaGeoespacial'
import MiParcela from './pages/Dashboard/MiParcela'
import Pagos from './pages/Dashboard/Pagos'
import HistorialPagos from './pages/Dashboard/HistorialPagos'
import Estadisticas from './pages/Dashboard/Estadisticas'
import Perfil from './pages/Dashboard/Perfil'
import Calendario from './pages/Dashboard/Calendario'
import GestionUsuarios from './pages/Dashboard/GestionUsuarios'
import Resumen from './pages/Dashboard/Resumen'
import CrearAviso from './pages/Dashboard/CrearAviso'
import AlertasPendientes from './pages/Dashboard/AlertasPendientes'
import Layout from './components/Layout'
import './App.css'
import './ColorFixStyles.css'
import './FixTextColors.css'
import './MobileMenuFix.css'
import './OverflowFix.css'
import './CardFix.css'

// Configuración de las banderas futuras de React Router
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
}

export default function App() {
  return (
    <Router {...router}>
      <Routes>
        {/* Rutas públicas con Layout compartido */}
        <Route path="/" element={<Layout><Login /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/registro" element={<Layout><Register /></Layout>} />
        <Route path="/recuperar" element={<Layout><RecuperarPassword /></Layout>} />
        
        {/* Rutas del dashboard */}
        <Route path="/dashboard" element={<Dashboard><CopropietarioDashboard /></Dashboard>} />
        <Route path="/dashboard/admin" element={<Dashboard userRole="Administrador" />} />
        <Route path="/dashboard/copropietario" element={<Dashboard userRole="Copropietario"><CopropietarioDashboard /></Dashboard>} />
        
        {/* Rutas específicas del dashboard */}
        <Route path="/dashboard/mapa" element={<Dashboard><MapaGeoespacial /></Dashboard>} />
        <Route path="/dashboard/parcela" element={<Dashboard><MiParcela /></Dashboard>} />
        <Route path="/dashboard/pagos" element={<Dashboard><Pagos /></Dashboard>} />
        <Route path="/dashboard/historial-pagos" element={<Dashboard><HistorialPagos /></Dashboard>} />
        <Route path="/dashboard/estadisticas" element={<Dashboard><Estadisticas /></Dashboard>} />
        <Route path="/dashboard/perfil" element={<Dashboard><Perfil /></Dashboard>} />
        <Route path="/dashboard/calendario" element={<Dashboard><Calendario /></Dashboard>} />
        
        {/* Nuevas rutas para administrador */}
        <Route path="/dashboard/usuarios" element={<Dashboard><GestionUsuarios /></Dashboard>} />
        <Route path="/dashboard/resumen" element={<Dashboard><Resumen /></Dashboard>} />
        <Route path="/dashboard/notificaciones" element={<Dashboard><CrearAviso /></Dashboard>} />
        <Route path="/dashboard/alertas" element={<Dashboard><AlertasPendientes /></Dashboard>} />
        
        {/* Capturar todas las subrutas del dashboard */}
        <Route path="/dashboard/*" element={<Dashboard><CopropietarioDashboard /></Dashboard>} />
      </Routes>
    </Router>
  );
}
