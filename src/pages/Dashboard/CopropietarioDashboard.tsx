import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

export default function CopropietarioDashboard() {
  const [userName, setUserName] = useState('');
  const [pendingPayments, setPendingPayments] = useState(2);
  const [newNotifications, setNewNotifications] = useState(5);
  const navigate = useNavigate();

  // Obtener datos del usuario
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }

    // En un caso real, aquí harías una llamada a la API para obtener:
    // - Número de pagos pendientes
    // - Nuevos avisos/notificaciones
    // - Información de la parcela
    // - Eventos próximos

    // Por ahora usamos datos de ejemplo
  }, []);

  return (
    <div className={styles.pageContainer}>
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
        </div>
      </div>
      
      <div className={styles.contentArea}>
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
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
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
          
          <div className={styles.quickAccessCard} onClick={() => navigate('/dashboard/historial-pagos')} role="button" tabIndex={0} aria-label="Ir a Mi Historial de Pagos">
            <div className={styles.quickAccessIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className={styles.quickAccessLabel}>Historial de Pagos</div>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Estado de Pagos</h2>
          </div>
          <div className={styles.cardBody}>
            <p>Tienes <strong>{pendingPayments} pagos</strong> pendientes para este mes.</p>
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
            <h2 className={styles.cardTitle}>Próximos Eventos</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.notificationList}>
              <div className={styles.notificationItem}>
                <span className={styles.notificationDot}></span>
                <p><strong>15/10</strong> - Reunión de copropietarios</p>
              </div>
              <div className={styles.notificationItem}>
                <span className={styles.notificationDot}></span>
                <p><strong>18/10</strong> - Mantención áreas verdes</p>
              </div>
              <div className={styles.notificationItem}>
                <span className={styles.notificationDot}></span>
                <p><strong>22/10</strong> - Fecha límite de pago cuota mensual</p>
              </div>
            </div>
            <button 
              className={styles.cardAction}
              onClick={() => navigate('/dashboard/calendario')}
              aria-label="Ver todos los eventos"
            >
              Ver calendario completo
            </button>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Últimos Avisos</h2>
          </div>
          <div className={styles.cardBody}>
            <p>Hay <strong>{newNotifications} nuevos avisos</strong> desde tu última visita.</p>
            <div className={styles.notificationList}>
              <div className={styles.notificationItem}>
                <span className={styles.notificationDot}></span>
                <p>Corte de agua programado para el miércoles 10/10</p>
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
            <h2 className={styles.cardTitle}>Información de mi Parcela</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.notificationList}>
              <div className={styles.notificationItem}>
                <p><strong>Parcela:</strong> A-123</p>
              </div>
              <div className={styles.notificationItem}>
                <p><strong>Superficie:</strong> 5000 m²</p>
              </div>
              <div className={styles.notificationItem}>
                <p><strong>Estado:</strong> Al día</p>
              </div>
            </div>
            <button 
              className={styles.cardAction}
              onClick={() => navigate('/dashboard/parcela')}
              aria-label="Ver detalles de mi parcela"
            >
              Ver detalles de mi parcela
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 