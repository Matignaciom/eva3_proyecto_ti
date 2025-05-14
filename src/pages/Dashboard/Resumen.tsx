import { useState, useEffect } from 'react';
import styles from './PaginasComunes.module.css';
import API_BASE_URL from '../../config/api.config';

interface EstadisticasComunidad {
  copropietarios: number;
  parcelas: number;
  gastosPendientes: number;
  avisos: number;
}

interface Usuario {
  id: number;
  nombreCompleto: string;
  rol: string;
}

interface Parcela {
  id: number;
  nombre: string;
  propietario: string;
  estado: 'Al día' | 'Pendiente' | 'Atrasado';
}

interface Gasto {
  id: number;
  concepto: string;
  monto: number;
  fechaVencimiento: string;
  estado: 'Pendiente' | 'Activo' | 'Cerrado';
}

export default function Resumen() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [estadisticas, setEstadisticas] = useState<EstadisticasComunidad>({
    copropietarios: 0,
    parcelas: 0,
    gastosPendientes: 0,
    avisos: 0
  });
  const [ultimosUsuarios, setUltimosUsuarios] = useState<Usuario[]>([]);
  const [ultimasParcelas, setUltimasParcelas] = useState<Parcela[]>([]);
  const [gastosRecientes, setGastosRecientes] = useState<Gasto[]>([]);
  const [idComunidad, setIdComunidad] = useState<number | null>(null);
  const [comunidadNombre, setComunidadNombre] = useState<string>('');
  
  // Obtener datos de la comunidad del administrador
  useEffect(() => {
    const fetchDatos = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
          throw new Error('No hay información de autenticación');
        }
        
        // Obtener datos del usuario para saber su comunidad
        const userResponse = await fetch(`${API_BASE_URL}/api/usuarios/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!userResponse.ok) {
          throw new Error('Error al obtener datos del usuario');
        }
        
        const userData = await userResponse.json();
        
        if (!userData.usuario || !userData.usuario.idComunidad) {
          throw new Error('No se pudo obtener la comunidad del usuario');
        }
        
        const comunidadId = userData.usuario.idComunidad;
        setIdComunidad(comunidadId);
        setComunidadNombre(userData.usuario.comunidad || 'Comunidad');
        
        // Obtener estadísticas de la comunidad
        const estadisticasResponse = await fetch(`${API_BASE_URL}/api/comunidades/${comunidadId}/estadisticas`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (estadisticasResponse.ok) {
          const estadisticasData = await estadisticasResponse.json();
          if (estadisticasData && estadisticasData.estadisticas) {
            setEstadisticas(estadisticasData.estadisticas);
          }
        } else {
          console.error('Error al obtener estadísticas', estadisticasResponse.status);
        }
        
        // Obtener usuarios de la comunidad
        const usuariosResponse = await fetch(`${API_BASE_URL}/api/usuarios`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (usuariosResponse.ok) {
          const usuariosData = await usuariosResponse.json();
          if (usuariosData && usuariosData.usuarios) {
            // Mostrar los 5 últimos usuarios
            setUltimosUsuarios(usuariosData.usuarios.slice(0, 5));
          }
        }
        
        // Obtener parcelas
        const parcelasResponse = await fetch(`${API_BASE_URL}/api/parcelas`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (parcelasResponse.ok) {
          const parcelasData = await parcelasResponse.json();
          if (parcelasData && parcelasData.parcelas) {
            // Mostrar las 5 últimas parcelas
            setUltimasParcelas(parcelasData.parcelas.slice(0, 5).map((p: any) => ({
              id: p.idParcela,
              nombre: p.nombre,
              propietario: p.propietario,
              estado: p.estado
            })));
          }
        }
        
        // Obtener gastos comunes
        const gastosResponse = await fetch(`${API_BASE_URL}/api/gastos-comunes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (gastosResponse.ok) {
          const gastosData = await gastosResponse.json();
          if (gastosData && gastosData.gastos) {
            // Mostrar los 5 gastos más recientes
            setGastosRecientes(gastosData.gastos.slice(0, 5).map((g: any) => ({
              id: g.idGasto,
              concepto: g.concepto,
              monto: g.montoTotal,
              fechaVencimiento: g.fechaVencimiento,
              estado: g.estado
            })));
          }
        }
        
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDatos();
  }, []);

  // Formatear números como moneda chilena
  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Resumen de {comunidadNombre}</h1>
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button 
            className={styles.buttonPrimary}
            onClick={() => window.location.reload()}
          >
            Intentar nuevamente
          </button>
        </div>
      )}
      
      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando datos del resumen...</p>
        </div>
      ) : (
        <>
          {/* Estadísticas generales */}
          <div className={styles.statCardsContainer}>
            <div className={`${styles.statCard} ${styles.cardCopropietarios}`}>
              <div className={styles.statCardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className={styles.statCardContent}>
                <h3 className={styles.statCardTitle}>Copropietarios</h3>
                <p className={styles.statCardValue}>{estadisticas.copropietarios}</p>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.cardParcelas}`}>
              <div className={styles.statCardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div className={styles.statCardContent}>
                <h3 className={styles.statCardTitle}>Parcelas</h3>
                <p className={styles.statCardValue}>{estadisticas.parcelas}</p>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.cardGastos}`}>
              <div className={styles.statCardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className={styles.statCardContent}>
                <h3 className={styles.statCardTitle}>Gastos Pendientes</h3>
                <p className={styles.statCardValue}>{estadisticas.gastosPendientes}</p>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.cardAvisos}`}>
              <div className={styles.statCardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <div className={styles.statCardContent}>
                <h3 className={styles.statCardTitle}>Avisos Activos</h3>
                <p className={styles.statCardValue}>{estadisticas.avisos}</p>
              </div>
            </div>
          </div>
          
          <div className={styles.dashboardGrid}>
            {/* Últimos usuarios registrados */}
            <div className={styles.dashboardCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Últimos Usuarios</h2>
                <button className={styles.cardAction} onClick={() => window.location.href = '/dashboard/admin/usuarios'}>
                  Ver todos
                </button>
              </div>
              <div className={styles.cardContent}>
                {ultimosUsuarios.length === 0 ? (
                  <div className={styles.emptyCardMessage}>
                    <p>No hay usuarios registrados.</p>
                  </div>
                ) : (
                  <ul className={styles.simpleList}>
                    {ultimosUsuarios.map(usuario => (
                      <li key={usuario.id} className={styles.simpleListItem}>
                        <div className={styles.listItemAvatar}>
                          {usuario.nombreCompleto.substring(0, 2).toUpperCase()}
                        </div>
                        <div className={styles.listItemContent}>
                          <span className={styles.listItemPrimary}>{usuario.nombreCompleto}</span>
                          <span className={`${styles.listItemSecondary} ${
                            usuario.rol === 'Administrador' ? styles.highEmphasis : ''
                          }`}>
                            {usuario.rol}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            {/* Últimas parcelas registradas */}
            <div className={styles.dashboardCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Parcelas Recientes</h2>
                <button className={styles.cardAction} onClick={() => window.location.href = '/dashboard/admin/parcelas'}>
                  Ver todas
                </button>
              </div>
              <div className={styles.cardContent}>
                {ultimasParcelas.length === 0 ? (
                  <div className={styles.emptyCardMessage}>
                    <p>No hay parcelas registradas.</p>
                  </div>
                ) : (
                  <ul className={styles.simpleList}>
                    {ultimasParcelas.map(parcela => (
                      <li key={parcela.id} className={styles.simpleListItem}>
                        <div className={`${styles.statusDot} ${
                          parcela.estado === 'Al día' 
                            ? styles.statusGreen 
                            : parcela.estado === 'Pendiente'
                            ? styles.statusYellow
                            : styles.statusRed
                        }`}></div>
                        <div className={styles.listItemContent}>
                          <span className={styles.listItemPrimary}>{parcela.nombre}</span>
                          <span className={styles.listItemSecondary}>{parcela.propietario}</span>
                        </div>
                        <div className={styles.listItemStatus}>
                          {parcela.estado}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            {/* Últimos gastos registrados */}
            <div className={styles.dashboardCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Gastos Recientes</h2>
                <button className={styles.cardAction} onClick={() => window.location.href = '/dashboard/admin/gastos'}>
                  Ver todos
                </button>
              </div>
              <div className={styles.cardContent}>
                {gastosRecientes.length === 0 ? (
                  <div className={styles.emptyCardMessage}>
                    <p>No hay gastos registrados.</p>
                  </div>
                ) : (
                  <ul className={styles.simpleList}>
                    {gastosRecientes.map(gasto => (
                      <li key={gasto.id} className={styles.simpleListItem}>
                        <div className={`${styles.statusDot} ${
                          gasto.estado === 'Cerrado'
                            ? styles.statusGreen
                            : gasto.estado === 'Activo'
                            ? styles.statusYellow
                            : styles.statusRed
                        }`}></div>
                        <div className={styles.listItemContent}>
                          <span className={styles.listItemPrimary}>{gasto.concepto}</span>
                          <span className={styles.listItemSecondary}>Vence: {gasto.fechaVencimiento}</span>
                        </div>
                        <div className={styles.listItemAmount}>
                          {formatearMoneda(gasto.monto)}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            {/* Mapa de la comunidad */}
            <div className={styles.dashboardWideCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Vista Geoespacial</h2>
                <button className={styles.cardAction} onClick={() => window.location.href = '/dashboard/mapa'}>
                  Ver mapa completo
                </button>
              </div>
              <div className={styles.cardMapContainer}>
                <div className={styles.mapPlaceholder}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <p>Haga clic para cargar el mapa</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Acciones rápidas */}
          <div className={styles.quickActionsSection}>
            <h2 className={styles.sectionTitle}>Acciones Rápidas</h2>
            <div className={styles.quickActionsGrid}>
              <button className={styles.quickActionButton} onClick={() => window.location.href = '/dashboard/admin/usuarios/nuevo'}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                <span>Agregar Usuario</span>
              </button>
              
              <button className={styles.quickActionButton} onClick={() => window.location.href = '/dashboard/admin/parcelas/nueva'}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  <line x1="12" y1="7" x2="12" y2="13"></line>
                  <line x1="15" y1="10" x2="9" y2="10"></line>
                </svg>
                <span>Agregar Parcela</span>
              </button>
              
              <button className={styles.quickActionButton} onClick={() => window.location.href = '/dashboard/admin/gastos/nuevo'}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  <path d="M15 1h5v5"></path>
                </svg>
                <span>Crear Gasto</span>
              </button>
              
              <button className={styles.quickActionButton} onClick={() => window.location.href = '/dashboard/admin/avisos/nuevo'}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  <line x1="12" y1="8" x2="12" y2="13"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>Crear Aviso</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 