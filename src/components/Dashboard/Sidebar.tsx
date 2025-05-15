import { Link, useLocation } from 'react-router-dom';
import styles from './Dashboard.module.css';
import '../../FixTextColors.css';
import { useEffect, useRef } from 'react';

interface SidebarProps {
  userName: string;
  userRole: string;
  isOpen: boolean;
  onClose: () => void;
}

// Función para obtener las iniciales del nombre
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Función para determinar si un enlace está activo
const isLinkActive = (currentPath: string, linkPath: string, isCopropietario: boolean = false): boolean => {
  if (linkPath === '/dashboard' && currentPath === '/dashboard') {
    return true;
  }
  if (isCopropietario && linkPath === '/dashboard') {
    return false;
  }
  return currentPath.startsWith(linkPath) && linkPath !== '/dashboard';
};

export default function Sidebar({ userName, userRole, isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const isAdmin = userRole.toLowerCase() === 'administrador';
  const sidebarRef = useRef<HTMLElement>(null);
  
  // Efecto para aplicar/remover la clase manualmente cuando cambia el estado
  useEffect(() => {
    if (sidebarRef.current) {
      if (isOpen) {
        sidebarRef.current.classList.add(styles.open);
      } else {
        sidebarRef.current.classList.remove(styles.open);
      }
    }
  }, [isOpen]);

  return (
    <aside 
      ref={sidebarRef}
      className={styles.sidebar}
      aria-hidden={!isOpen}
      aria-label="Menú de navegación principal"
      data-is-open={isOpen ? 'true' : 'false'}
    >
      <div className={styles.sidebarHeader}>
        <div className={styles.logoContainer}>
          <Link to="/dashboard" className={styles.logoText} onClick={onClose} aria-label="Ir al inicio">
            SIGEPA
          </Link>
        </div>
        
        <div className={styles.userInfo} role="complementary" aria-label="Información del usuario">
          <div className={styles.avatar} aria-hidden="true">
            {getInitials(userName)}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>{userRole}</span>
          </div>
        </div>
      </div>

      <nav aria-label="Menú de navegación">
        <ul className={styles.navMenu}>
          {/* Opciones para Administrador */}
          {isAdmin && (
            <>
              <li className={styles.navHeader} role="presentation">Principal</li>
              
              <li className={styles.navItem}>
                <Link 
                  to="/dashboard" 
                  className={`${styles.navLink} ${isLinkActive(location.pathname, '/dashboard') ? styles.active : ''}`}
                  onClick={onClose}
                  aria-current={isLinkActive(location.pathname, '/dashboard') ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </span>
                  <span className={styles.navText}>Inicio</span>
                </Link>
              </li>
              
              <li className={styles.navItem}>
                <Link 
                  to="/dashboard/mapa" 
                  className={`${styles.navLink} ${isLinkActive(location.pathname, '/dashboard/mapa') ? styles.active : ''}`}
                  onClick={onClose}
                  aria-current={isLinkActive(location.pathname, '/dashboard/mapa') ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                      <line x1="8" y1="2" x2="8" y2="18"></line>
                      <line x1="16" y1="6" x2="16" y2="22"></line>
                    </svg>
                  </span>
                  <span className={styles.navText}>Mapa Geoespacial</span>
                </Link>
              </li>
              
              <li className={styles.navItem}>
                <Link 
                  to="/dashboard/resumen" 
                  className={`${styles.navLink} ${isLinkActive(location.pathname, '/dashboard/resumen') ? styles.active : ''}`}
                  onClick={onClose}
                  aria-current={isLinkActive(location.pathname, '/dashboard/resumen') ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"></line>
                      <line x1="12" y1="20" x2="12" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="14"></line>
                      <line x1="3" y1="20" x2="21" y2="20"></line>
                    </svg>
                  </span>
                  <span className={styles.navText}>Resumen</span>
                </Link>
              </li>
              
              <li className={styles.navItem}>
                <Link 
                  to="/dashboard/contratos" 
                  className={`${styles.navLink} ${isLinkActive(location.pathname, '/dashboard/contratos') ? styles.active : ''}`}
                  onClick={onClose}
                  aria-current={isLinkActive(location.pathname, '/dashboard/contratos') ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </span>
                  <span className={styles.navText}>Mis Contratos</span>
                </Link>
              </li>
              
              <li className={styles.navItem}>
                <Link 
                  to="/dashboard/alertas" 
                  className={`${styles.navLink} ${isLinkActive(location.pathname, '/dashboard/alertas') ? styles.active : ''}`}
                  onClick={onClose}
                  aria-current={isLinkActive(location.pathname, '/dashboard/alertas') ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                  </span>
                  <span className={styles.navText}>Alertas Pendientes</span>
                  <span className={styles.navBadge} aria-label="5 notificaciones">5</span>
                </Link>
              </li>
              
              <li className={styles.navHeader} role="presentation">Administración</li>
              
              <li className={styles.navItem}>
                <Link 
                  to="/dashboard/usuarios" 
                  className={`${styles.navLink} ${isLinkActive(location.pathname, '/dashboard/usuarios') ? styles.active : ''}`}
                  onClick={onClose}
                  aria-current={isLinkActive(location.pathname, '/dashboard/usuarios') ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </span>
                  <span className={styles.navText}>Gestión de Usuarios</span>
                </Link>
              </li>
              
              <li className={styles.navItem}>
                <Link 
                  to="/dashboard/notificaciones" 
                  className={`${styles.navLink} ${isLinkActive(location.pathname, '/dashboard/notificaciones') ? styles.active : ''}`}
                  onClick={onClose}
                  aria-current={isLinkActive(location.pathname, '/dashboard/notificaciones') ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </span>
                  <span className={styles.navText}>Crear Notificaciones</span>
                </Link>
              </li>
            </>
          )}

          {/* Opciones para Copropietario */}
          {!isAdmin && (
            <>
              <li className={styles.navHeader} role="presentation">Mi Propiedad</li>
              
              <li className={styles.navItem}>
                <Link 
                  to="/dashboard" 
                  className={`${styles.navLink} ${isLinkActive(location.pathname, '/dashboard', true) ? styles.active : ''}`}
                  onClick={onClose}
                  aria-current={isLinkActive(location.pathname, '/dashboard', true) ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </span>
                  <span className={styles.navText}>Inicio</span>
                </Link>
              </li>
              
              <li className={styles.navItem}>
                <Link 
                  to="/dashboard/parcela" 
                  className={`${styles.navLink} ${isLinkActive(location.pathname, '/dashboard/parcela') ? styles.active : ''}`}
                  onClick={onClose}
                  aria-current={isLinkActive(location.pathname, '/dashboard/parcela') ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                  </span>
                  <span className={styles.navText}>Mi Parcela</span>
                </Link>
              </li>
              
              <li className={styles.navHeader} role="presentation">Finanzas</li>
              
              <li className={styles.navItem}>
                <Link 
                  to="/dashboard/pagos" 
                  className={`${styles.navLink} ${isLinkActive(location.pathname, '/dashboard/pagos') ? styles.active : ''}`}
                  onClick={onClose}
                  aria-current={isLinkActive(location.pathname, '/dashboard/pagos') ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                  </span>
                  <span className={styles.navText}>Pagos</span>
                  <span className={styles.navBadge} aria-label="2 pagos pendientes">2</span>
                </Link>
              </li>
              
              <li className={styles.navItem}>
                <Link 
                  to="/dashboard/historial-pagos" 
                  className={`${styles.navLink} ${isLinkActive(location.pathname, '/dashboard/historial-pagos') ? styles.active : ''}`}
                  onClick={onClose}
                  aria-current={isLinkActive(location.pathname, '/dashboard/historial-pagos') ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </span>
                  <span className={styles.navText}>Historial de Pagos</span>
                </Link>
              </li>
              
              <li className={styles.navItem}>
                <Link 
                  to="/dashboard/estadisticas" 
                  className={`${styles.navLink} ${isLinkActive(location.pathname, '/dashboard/estadisticas') ? styles.active : ''}`}
                  onClick={onClose}
                  aria-current={isLinkActive(location.pathname, '/dashboard/estadisticas') ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                    </svg>
                  </span>
                  <span className={styles.navText}>Estadísticas</span>
                </Link>
              </li>
            </>
          )}
          
          <li className={styles.navHeader} role="presentation">Cuenta</li>
          
          <li className={styles.navItem}>
            <Link 
              to="/dashboard/perfil" 
              className={`${styles.navLink} ${isLinkActive(location.pathname, '/dashboard/perfil') ? styles.active : ''}`}
              onClick={onClose}
              aria-current={isLinkActive(location.pathname, '/dashboard/perfil') ? 'page' : undefined}
            >
              <span className={styles.navIcon} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <span className={styles.navText}>Mi Perfil</span>
            </Link>
          </li>
          
          <li className={styles.navItem}>
            <Link 
              to="/login" 
              className={styles.navLink}
              aria-label="Cerrar sesión"
            >
              <span className={styles.navIcon} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              <span className={styles.navText}>Cerrar Sesión</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
} 