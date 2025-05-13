import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Dashboard/Sidebar';
import styles from '../../components/Dashboard/Dashboard.module.css';

interface DashboardProps {
  userRole?: string; // Si no se proporciona, se obtiene de la sesión
  children?: ReactNode; // Nuevo: para renderizar contenido personalizado
}

export default function Dashboard({ userRole: propUserRole, children }: DashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [userRole, setUserRole] = useState(propUserRole || 'Copropietario'); // Valor por defecto
  const [userName, setUserName] = useState('Juan Pérez');
  const navigate = useNavigate();

  // Efecto para manejar el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // En un caso real, aquí verificaríamos si el usuario está autenticado
  // y obtendríamos su información desde el servidor o estado global
  useEffect(() => {
    // Simulación de obtención de datos del usuario
    const getUserData = () => {
      // Aquí iría la lógica para obtener los datos reales del usuario
      // Por ahora usamos datos de ejemplo
      const mockUserData = {
        name: 'Juan Pérez',
        role: propUserRole || localStorage.getItem('userRole') || 'Copropietario', // Intentar recuperar de localStorage
      };
      
      setUserName(mockUserData.name);
      setUserRole(mockUserData.role);
      
      // Guardar el rol en localStorage para que otros componentes puedan acceder a él
      localStorage.setItem('userRole', mockUserData.role);
    };
    
    getUserData();
  }, [propUserRole]);

  // Efecto para guardar el rol en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('userRole', userRole);
  }, [userRole]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  // Función para cambiar de rol (solo para testing)
  const toggleRole = () => {
    const newRole = userRole === 'Administrador' ? 'Copropietario' : 'Administrador';
    setUserRole(newRole);
    // Guardamos el nuevo rol en localStorage para que otros componentes puedan usarlo
    localStorage.setItem('userRole', newRole);
  };

  // Contenido por defecto del dashboard
  const defaultContent = (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Panel Principal</h1>
        <div className={styles.actionButtons}>
          <button 
            className={styles.actionButton}
            onClick={() => navigate('/dashboard/calendario')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Ver Calendario
          </button>
          {userRole.toLowerCase() === 'administrador' && (
            <button className={`${styles.actionButton} ${styles.primaryButton}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Crear Aviso
            </button>
          )}
        </div>
      </div>
      
      <div className={styles.contentArea}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Estado de Pagos</h2>
          </div>
          <div className={styles.cardBody}>
            {userRole.toLowerCase() === 'administrador' ? (
              <p>Tienes <strong>5 pagos</strong> pendientes por revisar.</p>
            ) : (
              <p>Tienes <strong>2 pagos</strong> pendientes para este mes.</p>
            )}
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Últimos Avisos</h2>
          </div>
          <div className={styles.cardBody}>
            <p>Hay <strong>5 nuevos avisos</strong> desde tu última visita.</p>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Documentos Recientes</h2>
          </div>
          <div className={styles.cardBody}>
            <p>Se han subido <strong>3 nuevos documentos</strong> a la plataforma.</p>
          </div>
        </div>
        
        {userRole.toLowerCase() === 'administrador' && (
          <>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Usuarios Activos</h2>
              </div>
              <div className={styles.cardBody}>
                <p>Hay <strong>18 usuarios</strong> registrados en el sistema.</p>
              </div>
            </div>
            
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Resumen de Gastos</h2>
              </div>
              <div className={styles.cardBody}>
                <p>Total de gastos este mes: <strong>$1,250,000</strong></p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar 
        userName={userName}
        userRole={userRole}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
      
      <button 
        className={styles.mobileMenuToggle}
        onClick={toggleSidebar}
        aria-label="Abrir/Cerrar menú"
      >
        {isSidebarOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        )}
      </button>
      
      <main className={styles.mainContent}>
        {/* Botón para cambiar de rol (solo para testing) */}
        <div className={styles.testingTools}>
          <p>Modo de prueba</p>
          <button 
            onClick={toggleRole}
            className={styles.roleToggleButton}
            style={{
              position: 'fixed',
              top: '10px',
              right: '10px',
              zIndex: 10,
              backgroundColor: userRole === 'Administrador' ? '#4f46e5' : '#10b981',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            Rol actual: {userRole}
            <span style={{ marginLeft: '6px', fontSize: '0.7rem', opacity: 0.8 }}>
              (Clic para cambiar)
            </span>
          </button>
        </div>

        {/* Renderizar el contenido personalizado si existe, o el contenido predeterminado */}
        {children || defaultContent}
      </main>
    </div>
  );
} 