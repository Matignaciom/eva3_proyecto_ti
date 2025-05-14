import { useState, useEffect } from 'react';
import MapaGeoespacial from '../../components/Maps/MapaGeoespacial';
import styles from './PaginasComunes.module.css';

// Datos de ejemplo para las parcelas que se usarán solo si no hay datos reales
const parcelasUsuarioMock = [
  {
    id: 1,
    nombre: 'Parcela A-123',
    propietario: '', // Se llenará dinámicamente
    propietarioId: 1,
    superficie: '5000 m²',
    direccion: 'Camino Los Pinos 567',
    estado: 'Al día',
    fechaAdquisicion: '15/03/2021',
    valorCatastral: '$75.000.000',
    proximoPago: '15/09/2023',
    montoPendiente: '$120.000'
  },
  {
    id: 4,
    nombre: 'Parcela D-101',
    propietario: '', // Se llenará dinámicamente
    propietarioId: 1,
    superficie: '3200 m²',
    direccion: 'Camino El Roble 789',
    estado: 'Al día',
    fechaAdquisicion: '10/01/2022',
    valorCatastral: '$63.000.000',
    proximoPago: '10/09/2023',
    montoPendiente: '$110.000'
  }
];

export default function MiParcela() {
  // Obtenemos los datos del usuario del localStorage
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [nombreUsuario, setNombreUsuario] = useState<string>('');
  
  // Estado para almacenar la parcela seleccionada actualmente
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState<any>(null);
  const [todasLasParcelas, setTodasLasParcelas] = useState<any[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  
  // Obtener datos del usuario al cargar el componente
  useEffect(() => {
    const userIdFromStorage = localStorage.getItem('userId');
    const userNameFromStorage = localStorage.getItem('userName');
    
    if (userIdFromStorage) {
      setUsuarioId(parseInt(userIdFromStorage));
    }
    
    if (userNameFromStorage) {
      setNombreUsuario(userNameFromStorage);
    }
  }, []);
  
  // Simular carga de datos una vez que tenemos el ID del usuario
  useEffect(() => {
    // En un caso real, aquí haríamos la llamada a la API para obtener las parcelas del usuario
    if (usuarioId || nombreUsuario) {
      setCargando(true);
      
      // Simular una llamada a la API
      setTimeout(() => {
        // Clonar las parcelas mock y asignar el nombre del usuario real
        const parcelasConDatosReales = parcelasUsuarioMock.map(parcela => ({
          ...parcela,
          propietario: nombreUsuario || 'Usuario',
          propietarioId: usuarioId || 1
        }));
        
        setTodasLasParcelas(parcelasConDatosReales);
        
        // Establecer la primera parcela como seleccionada por defecto
        if (parcelasConDatosReales.length > 0) {
          setParcelaSeleccionada(parcelasConDatosReales[0]);
        }
        
        setCargando(false);
      }, 500); // Simular tiempo de carga
    }
  }, [usuarioId, nombreUsuario]);
  
  // Comprobar si el usuario tiene múltiples parcelas
  const tieneMultiplesParcelas = todasLasParcelas.length > 1;
  
  // Función para cambiar la parcela seleccionada
  const cambiarParcelaSeleccionada = (id: number) => {
    const parcela = todasLasParcelas.find(p => p.id === id);
    if (parcela) {
      setParcelaSeleccionada(parcela);
    }
  };
  
  // Mostrar estado de carga
  if (cargando) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Mi Parcela</h1>
        </div>
        
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando información de tus parcelas...</p>
        </div>
      </div>
    );
  }
  
  // Si no hay parcelas, mostrar mensaje
  if (todasLasParcelas.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Mi Parcela</h1>
        </div>
        
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <h2 className={styles.emptyStateTitle}>No tienes parcelas registradas</h2>
          <p className={styles.emptyStateDescription}>
            No se encontraron parcelas asociadas a tu cuenta. Si crees que esto es un error, por favor contacta al administrador.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Mi Parcela</h1>
        
        {tieneMultiplesParcelas && (
          <div className={styles.parcelaSelector}>
            <label htmlFor="parcelaSelector" className={styles.parcelaSelectorLabel}>
              Seleccionar parcela:
            </label>
            <select 
              id="parcelaSelector" 
              className={styles.filterSelect}
              value={parcelaSeleccionada.id}
              onChange={(e) => cambiarParcelaSeleccionada(Number(e.target.value))}
            >
              {todasLasParcelas.map((parcela) => (
                <option key={parcela.id} value={parcela.id}>
                  {parcela.nombre} - {parcela.direccion}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className={styles.pageActions}>
          <button className={styles.actionButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="8" y1="12" x2="16" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="16"></line>
            </svg>
            Ver Documentos
          </button>
          <button className={`${styles.actionButton} ${styles.primaryButton}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <rect x="9" y="9" width="6" height="6"></rect>
            </svg>
            Realizar Pago
          </button>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.mainSection}>
          <div className={styles.detailCard}>
            <h2 className={styles.cardTitle}>Información de la Parcela</h2>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Nombre:</span>
                <span className={styles.detailValue}>{parcelaSeleccionada.nombre}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Propietario:</span>
                <span className={styles.detailValue}>{parcelaSeleccionada.propietario}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Superficie:</span>
                <span className={styles.detailValue}>{parcelaSeleccionada.superficie}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Dirección:</span>
                <span className={styles.detailValue}>{parcelaSeleccionada.direccion}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Estado:</span>
                <span className={`${styles.detailValue} ${
                  parcelaSeleccionada.estado === 'Al día' 
                    ? styles.statusGreen 
                    : parcelaSeleccionada.estado === 'Pendiente' 
                    ? styles.statusYellow 
                    : styles.statusRed
                }`}>
                  {parcelaSeleccionada.estado}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Fecha de adquisición:</span>
                <span className={styles.detailValue}>{parcelaSeleccionada.fechaAdquisicion}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Valor catastral:</span>
                <span className={styles.detailValue}>{parcelaSeleccionada.valorCatastral}</span>
              </div>
            </div>
          </div>
          
          <div className={styles.mapContainer}>
            <h2 className={styles.cardTitle}>Ubicación</h2>
            {tieneMultiplesParcelas ? (
              // Si tiene múltiples parcelas, mostrar todas pero resaltar la seleccionada
              <MapaGeoespacial propietarioId={usuarioId || 1} height="400px" />
            ) : (
              // Si tiene solo una parcela, mostrar solo esa
              <MapaGeoespacial parcelaId={parcelaSeleccionada.id} height="400px" />
            )}
          </div>
        </div>
        
        <div className={styles.sideSection}>
          <div className={styles.sideCard}>
            <h2 className={styles.cardTitle}>Pagos Pendientes</h2>
            {parcelaSeleccionada.estado === 'Al día' ? (
              <div className={styles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p>No tienes pagos pendientes</p>
              </div>
            ) : (
              <div className={styles.pendingPayment}>
                <div className={styles.paymentHeader}>
                  <span className={styles.paymentTitle}>Cuota Mensual</span>
                  <span className={styles.paymentDate}>Vence: {parcelaSeleccionada.proximoPago}</span>
                </div>
                <div className={styles.paymentAmount}>
                  {parcelaSeleccionada.montoPendiente}
                </div>
                <button className={styles.paymentButton}>
                  Pagar Ahora
                </button>
              </div>
            )}
          </div>
          
          <div className={styles.sideCard}>
            <h2 className={styles.cardTitle}>Últimas Actividades</h2>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div className={styles.activityContent}>
                  <span className={styles.activityText}>Pago recibido</span>
                  <span className={styles.activityDate}>15/08/2023</span>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div className={styles.activityContent}>
                  <span className={styles.activityText}>Documento actualizado</span>
                  <span className={styles.activityDate}>01/08/2023</span>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </div>
                <div className={styles.activityContent}>
                  <span className={styles.activityText}>Notificación recibida</span>
                  <span className={styles.activityDate}>28/07/2023</span>
                </div>
              </div>
            </div>
          </div>
          
          {tieneMultiplesParcelas && (
            <div className={styles.sideCard}>
              <h2 className={styles.cardTitle}>Mis Parcelas</h2>
              <div className={styles.parcelasList}>
                {todasLasParcelas.map(parcela => (
                  <div 
                    key={parcela.id} 
                    className={`${styles.parcelasListItem} ${parcela.id === parcelaSeleccionada.id ? styles.parcelasListItemActive : ''}`}
                    onClick={() => cambiarParcelaSeleccionada(parcela.id)}
                  >
                    <div className={styles.parcelasListContent}>
                      <span className={styles.parcelasListTitle}>{parcela.nombre}</span>
                      <span className={styles.parcelasListAddress}>{parcela.direccion}</span>
                    </div>
                    <span className={`${styles.parcelasListStatus} ${
                      parcela.estado === 'Al día' 
                        ? styles.statusDotGreen 
                        : parcela.estado === 'Pendiente' 
                        ? styles.statusDotYellow 
                        : styles.statusDotRed
                    }`}></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 