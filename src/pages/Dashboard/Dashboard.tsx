import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Dashboard/Sidebar';
import styles from './Dashboard.module.css';

interface DashboardProps {
  userRole?: string; // Si no se proporciona, se obtiene de la sesión
  children?: ReactNode; // Nuevo: para renderizar contenido personalizado
}

export default function Dashboard({ userRole: propUserRole, children }: DashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [userRole, setUserRole] = useState(propUserRole || '');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const mainContentRef = useRef<HTMLDivElement>(null);
  const sidebarStateRef = useRef(isSidebarOpen);
  const navigate = useNavigate();

  // Efecto para mantener actualizada la referencia del estado del sidebar
  useEffect(() => {
    sidebarStateRef.current = isSidebarOpen;
    
    // Forzar reflow del DOM para aplicar cambios de clase en móvil
    if (isMobile) {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        if (isSidebarOpen) {
          sidebar.classList.add(styles.open);
        } else {
          sidebar.classList.remove(styles.open);
        }
        (sidebar as HTMLElement).offsetHeight; // Trigger reflow
      }
    }
  }, [isSidebarOpen, isMobile]);

  // Efecto para manejar el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      const wasNotMobile = !isMobile;
      setIsMobile(mobile);
      
      // Ajustar el sidebar según el tamaño de la pantalla
      if (mobile && wasNotMobile) {
        // Cambiando de desktop a móvil: cerrar sidebar
        setIsSidebarOpen(false);
      } else if (!mobile && !sidebarStateRef.current) {
        // Cambiando de móvil a desktop: abrir sidebar
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Ejecutar al inicio
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Obtener los datos reales del usuario desde localStorage
  useEffect(() => {
    const getUserData = () => {
      // Intentar obtener datos del usuario desde localStorage
      const storedUserName = localStorage.getItem('userName');
      const storedUserRole = propUserRole || localStorage.getItem('userRole');
      const storedUserId = localStorage.getItem('userId');
      
      // Verificar si hay datos en localStorage
      if (storedUserName && storedUserRole) {
        setUserName(storedUserName);
        setUserRole(storedUserRole);
        
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } else {
        // Si no hay datos en localStorage, usar valores por defecto o redirigir al login
        setUserName('Usuario');
        setUserRole(propUserRole || 'Copropietario');
        // Opcionalmente redirigir al login si no hay datos de usuario
        // navigate('/login');
      }
    };
    
    getUserData();
  }, [propUserRole, navigate]);

  // Efecto para guardar el rol en localStorage cuando cambie
  useEffect(() => {
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    }
  }, [userRole]);

  // Scroll al inicio cuando se carga el componente
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, []);

  const toggleSidebar = () => {
    console.log('Toggling sidebar, current state:', isSidebarOpen);
    setIsSidebarOpen(prevState => !prevState);
  };

  const closeSidebar = () => {
    if (isMobile) {
      console.log('Closing sidebar');
      setIsSidebarOpen(false);
    }
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
            aria-label="Ver Calendario"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span className={styles.buttonText}>Ver Calendario</span>
          </button>
          {userRole.toLowerCase() === 'administrador' && (
            <button 
              className={`${styles.actionButton} ${styles.primaryButton}`}
              onClick={() => navigate('/dashboard/crear-aviso')}
              aria-label="Crear Aviso"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span className={styles.buttonText}>Crear Aviso</span>
            </button>
          )}
        </div>
      </div>
      
      <div className={styles.contentArea}>
        {userRole && userRole.toLowerCase() === 'copropietario' && (
          <>
            <div className={styles.welcomeMessage}>
              <h2>¡Bienvenido/a, {userName}!</h2>
              <p>Este es tu panel de control para gestionar tu parcela y pagos en la comunidad. Aquí encontrarás toda la información importante y accesos rápidos a las principales funciones.</p>
            </div>
            
            <div className={styles.quickAccessGrid}>
              <div className={styles.quickAccessCard} onClick={() => navigate('/dashboard/pagos')} role="button" tabIndex={0} aria-label="Ir a Mis Pagos">
                <div className={styles.quickAccessIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div className={styles.quickAccessLabel}>Mis Pagos</div>
              </div>
              
              <div className={styles.quickAccessCard} onClick={() => navigate('/dashboard/parcela')} role="button" tabIndex={0} aria-label="Ir a Mi Parcela">
                <div className={styles.quickAccessIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <div className={styles.quickAccessLabel}>Mi Parcela</div>
              </div>
              
              <div className={styles.quickAccessCard} onClick={() => navigate('/dashboard/calendario')} role="button" tabIndex={0} aria-label="Ir a Calendario">
                <div className={styles.quickAccessIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div className={styles.quickAccessLabel}>Calendario</div>
              </div>
              
              <div className={styles.quickAccessCard} onClick={() => navigate('/dashboard/perfil')} role="button" tabIndex={0} aria-label="Ir a Mi Perfil">
                <div className={styles.quickAccessIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className={styles.quickAccessLabel}>Mi Perfil</div>
              </div>
            </div>
            
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Estado de Pagos</h2>
              </div>
              <div className={styles.cardBody}>
                <p>Tienes <strong>2 pagos</strong> pendientes para este mes.</p>
                <button 
                  className={styles.cardAction}
                  onClick={() => navigate('/dashboard/pagos')}
                  aria-label="Ver detalles de pagos"
                >
                  Ver detalles
                </button>
              </div>
            </div>
            
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Últimos Avisos</h2>
              </div>
              <div className={styles.cardBody}>
                <p>Hay <strong>5 nuevos avisos</strong> desde tu última visita.</p>
                <div className={styles.notificationList}>
                  <div className={styles.notificationItem}>
                    <span className={styles.notificationDot}></span>
                    <p>Corte de agua programado para el miércoles 10/06</p>
                  </div>
                  <div className={styles.notificationItem}>
                    <span className={styles.notificationDot}></span>
                    <p>Nueva cuota de mantención a partir del próximo mes</p>
                  </div>
                  <div className={styles.notificationItem}>
                    <span className={styles.notificationDot}></span>
                    <p>Reunión de copropietarios este sábado</p>
                  </div>
                </div>
                <button 
                  className={styles.cardAction}
                  onClick={() => navigate('/dashboard/avisos')}
                  aria-label="Ver todos los avisos"
                >
                  Ver todos los avisos
                </button>
              </div>
            </div>
            
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Mi Parcela</h2>
              </div>
              <div className={styles.cardBody}>
                <p>Parcela ID: <strong>{userId || 'No disponible'}</strong></p>
                <p>Estado: <span className={styles.statusBadge}>Activo</span></p>
                <p>Próximo pago: <strong>15/06/2023</strong></p>
                <button 
                  className={styles.cardAction}
                  onClick={() => navigate('/dashboard/parcela')}
                  aria-label="Ver detalles de parcela"
                >
                  Ver detalles
                </button>
              </div>
            </div>
            
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Próximos Eventos</h2>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.notificationList}>
                  <div className={styles.notificationItem}>
                    <span className={styles.notificationDot} style={{ backgroundColor: '#dc2626' }}></span>
                    <p><strong>10/06/2023</strong> - Fecha límite de pago</p>
                  </div>
                  <div className={styles.notificationItem}>
                    <span className={styles.notificationDot} style={{ backgroundColor: '#2563eb' }}></span>
                    <p><strong>15/06/2023</strong> - Reunión de copropietarios</p>
                  </div>
                </div>
                <button 
                  className={styles.cardAction}
                  onClick={() => navigate('/dashboard/calendario')}
                  aria-label="Ver calendario completo"
                >
                  Ver calendario completo
                </button>
              </div>
            </div>
          </>
        )}
  
        {(!userRole || userRole.toLowerCase() === 'administrador') && (
          <>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Estado de Pagos</h2>
              </div>
              <div className={styles.cardBody}>
                <p>Tienes <strong>5 pagos</strong> pendientes por revisar.</p>
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
      
      {/* Overlay para cerrar el menú en modo móvil */}
      {isSidebarOpen && isMobile && (
        <div 
          className={styles.sidebarOverlay}
          onClick={closeSidebar}
          role="button"
          tabIndex={-1}
          aria-label="Cerrar menú lateral"
        />
      )}
      
      {/* Botón del menú móvil (solo se muestra en dispositivos móviles gracias a los estilos CSS) */}
      <button 
        className={styles.mobileMenuToggle}
        onClick={toggleSidebar}
        aria-label="Abrir/Cerrar menú"
        aria-expanded={isSidebarOpen}
      >
        {isSidebarOpen ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        )}
      </button>
      
      <main 
        className={`${styles.mainContent} ${isSidebarOpen ? styles.withSidebar : ''}`}
        ref={mainContentRef}
        style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden' }}
      >
        {/* Renderizar el contenido personalizado si existe, o el contenido predeterminado */}
        {children || defaultContent}
      </main>
    </div>
  );
} 