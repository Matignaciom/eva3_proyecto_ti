import { useState, useEffect } from 'react';
import styles from './PaginasComunes.module.css';

// API URL base
const API_BASE_URL = 'http://localhost:3000';

interface Alerta {
  id: number;
  titulo: string;
  contenido: string;
  tipo: 'Pago' | 'Sistema' | 'Mantenimiento' | 'Seguridad';
  fechaCreacion: string;
  estado: 'Pendiente' | 'En proceso' | 'Resuelta';
  prioridad: 'Baja' | 'Normal' | 'Alta' | 'Urgente';
  asignadoA?: string;
}

export default function AlertasPendientes() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<Alerta | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('pendiente');
  const [idComunidad, setIdComunidad] = useState<number | null>(null);
  const [comunidadNombre, setComunidadNombre] = useState<string>('');
  
  // Estados para actualizar alertas
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string>('');
  const [formData, setFormData] = useState({
    estado: '',
    asignadoA: '',
    comentario: ''
  });
  
  // Obtener datos de la comunidad y alertas
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
        
        // En una implementación real, obtendríamos las alertas del servidor
        // Aquí simulamos datos de ejemplo
        const alertasMock: Alerta[] = [
          {
            id: 1,
            titulo: 'Falla en sistema de riego',
            contenido: 'Se ha detectado una falla en el sistema de riego de la parcela 23. Se requiere revisión urgente.',
            tipo: 'Mantenimiento',
            fechaCreacion: '2023-07-15',
            estado: 'Pendiente',
            prioridad: 'Alta'
          },
          {
            id: 2,
            titulo: 'Pago pendiente de cuota extraordinaria',
            contenido: 'El propietario de la parcela 12 tiene pendiente el pago de la cuota extraordinaria de junio.',
            tipo: 'Pago',
            fechaCreacion: '2023-07-18',
            estado: 'Pendiente',
            prioridad: 'Normal'
          },
          {
            id: 3,
            titulo: 'Actualización de sistema de seguridad',
            contenido: 'Se requiere actualizar el sistema de seguridad en la entrada principal.',
            tipo: 'Seguridad',
            fechaCreacion: '2023-07-20',
            estado: 'En proceso',
            prioridad: 'Alta',
            asignadoA: 'Juan Pérez'
          },
          {
            id: 4,
            titulo: 'Error en sistema de facturación',
            contenido: 'Se han reportado errores en el cálculo de intereses en el sistema de facturación.',
            tipo: 'Sistema',
            fechaCreacion: '2023-07-22',
            estado: 'Resuelta',
            prioridad: 'Urgente',
            asignadoA: 'María González'
          },
          {
            id: 5,
            titulo: 'Mantenimiento preventivo de cercos',
            contenido: 'Se debe programar el mantenimiento preventivo de los cercos perimetrales.',
            tipo: 'Mantenimiento',
            fechaCreacion: '2023-07-25',
            estado: 'Pendiente',
            prioridad: 'Baja'
          }
        ];
        
        setAlertas(alertasMock);
        
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDatos();
  }, []);
  
  // Filtrar alertas según los criterios seleccionados
  const alertasFiltradas = alertas.filter(alerta => {
    // Filtrar por tipo
    if (filtroTipo !== 'todos' && alerta.tipo.toLowerCase() !== filtroTipo.toLowerCase()) {
      return false;
    }
    
    // Filtrar por prioridad
    if (filtroPrioridad !== 'todos' && alerta.prioridad.toLowerCase() !== filtroPrioridad.toLowerCase()) {
      return false;
    }
    
    // Filtrar por estado
    if (filtroEstado !== 'todos' && alerta.estado.toLowerCase() !== filtroEstado.toLowerCase()) {
      return false;
    }
    
    return true;
  });
  
  // Manejar selección de alerta
  const handleSelectAlerta = (alerta: Alerta) => {
    setAlertaSeleccionada(alerta);
    setFormData({
      estado: alerta.estado,
      asignadoA: alerta.asignadoA || '',
      comentario: ''
    });
    setUpdateSuccess('');
  };
  
  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Manejar actualización de alerta
  const handleUpdateAlerta = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alertaSeleccionada) return;
    
    setIsUpdating(true);
    setUpdateSuccess('');
    
    try {
      // En una implementación real, enviaríamos los datos al servidor
      // Aquí simulamos la actualización
      
      setTimeout(() => {
        // Actualizar la alerta en el estado local
        setAlertas(prevAlertas => 
          prevAlertas.map(alerta => 
            alerta.id === alertaSeleccionada.id
              ? {
                  ...alerta,
                  estado: formData.estado as any,
                  asignadoA: formData.asignadoA || undefined
                }
              : alerta
          )
        );
        
        // Actualizar la alerta seleccionada
        setAlertaSeleccionada({
          ...alertaSeleccionada,
          estado: formData.estado as any,
          asignadoA: formData.asignadoA || undefined
        });
        
        setUpdateSuccess('Alerta actualizada correctamente');
        setIsUpdating(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error al actualizar alerta:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar la alerta');
      setIsUpdating(false);
    }
  };
  
  // Obtener clases de estilo según prioridad
  const getPrioridadClass = (prioridad: string) => {
    switch (prioridad.toLowerCase()) {
      case 'baja':
        return styles.prioridadBaja;
      case 'normal':
        return styles.prioridadNormal;
      case 'alta':
        return styles.prioridadAlta;
      case 'urgente':
        return styles.prioridadUrgente;
      default:
        return '';
    }
  };
  
  // Obtener clases de estilo según estado
  const getEstadoClass = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return styles.estadoPendiente;
      case 'en proceso':
        return styles.estadoProceso;
      case 'resuelta':
        return styles.estadoResuelta;
      default:
        return '';
    }
  };
  
  // Obtener icono según tipo de alerta
  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'pago':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        );
      case 'sistema':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        );
      case 'mantenimiento':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        );
      case 'seguridad':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Alertas Pendientes - {comunidadNombre}</h1>
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
          <p>Cargando alertas...</p>
        </div>
      ) : (
        <div className={styles.dashboardGrid}>
          {/* Panel de filtros y lista de alertas */}
          <div className={styles.dashboardPanel}>
            <div className={styles.filterSection}>
              <div className={styles.filterGroup}>
                <label htmlFor="filtroTipo" className={styles.filterLabel}>Tipo:</label>
                <select
                  id="filtroTipo"
                  className={styles.filterSelect}
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="pago">Pago</option>
                  <option value="sistema">Sistema</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="seguridad">Seguridad</option>
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label htmlFor="filtroPrioridad" className={styles.filterLabel}>Prioridad:</label>
                <select
                  id="filtroPrioridad"
                  className={styles.filterSelect}
                  value={filtroPrioridad}
                  onChange={(e) => setFiltroPrioridad(e.target.value)}
                >
                  <option value="todos">Todas</option>
                  <option value="baja">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label htmlFor="filtroEstado" className={styles.filterLabel}>Estado:</label>
                <select
                  id="filtroEstado"
                  className={styles.filterSelect}
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en proceso">En proceso</option>
                  <option value="resuelta">Resuelta</option>
                </select>
              </div>
            </div>
            
            <div className={styles.alertListHeader}>
              <h2 className={styles.sectionTitle}>
                Alertas ({alertasFiltradas.length})
              </h2>
              <button className={styles.buttonPrimary}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Nueva Alerta
              </button>
            </div>
            
            <div className={styles.alertList}>
              {alertasFiltradas.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <p>No hay alertas que coincidan con los filtros seleccionados.</p>
                </div>
              ) : (
                alertasFiltradas.map(alerta => (
                  <div
                    key={alerta.id}
                    className={`${styles.alertCard} ${alertaSeleccionada?.id === alerta.id ? styles.alertCardSelected : ''}`}
                    onClick={() => handleSelectAlerta(alerta)}
                  >
                    <div className={styles.alertCardHeader}>
                      <div className={styles.alertTypeIcon}>
                        {getTipoIcon(alerta.tipo)}
                      </div>
                      <span className={`${styles.alertPriority} ${getPrioridadClass(alerta.prioridad)}`}>
                        {alerta.prioridad}
                      </span>
                    </div>
                    <h3 className={styles.alertTitle}>{alerta.titulo}</h3>
                    <div className={styles.alertMeta}>
                      <span className={styles.alertDate}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {alerta.fechaCreacion}
                      </span>
                      <span className={`${styles.alertStatus} ${getEstadoClass(alerta.estado)}`}>
                        {alerta.estado}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Panel de detalles */}
          <div className={styles.dashboardPanel}>
            {alertaSeleccionada ? (
              <div className={styles.alertDetail}>
                <div className={styles.alertDetailHeader}>
                  <div className={styles.alertDetailHeaderTop}>
                    <h2 className={styles.alertDetailTitle}>{alertaSeleccionada.titulo}</h2>
                    <span className={`${styles.alertDetailPriority} ${getPrioridadClass(alertaSeleccionada.prioridad)}`}>
                      {alertaSeleccionada.prioridad}
                    </span>
                  </div>
                  <div className={styles.alertDetailMeta}>
                    <span className={styles.alertDetailMetaItem}>
                      <strong>Tipo:</strong> {alertaSeleccionada.tipo}
                    </span>
                    <span className={styles.alertDetailMetaItem}>
                      <strong>Fecha:</strong> {alertaSeleccionada.fechaCreacion}
                    </span>
                    <span className={`${styles.alertDetailMetaItem} ${getEstadoClass(alertaSeleccionada.estado)}`}>
                      <strong>Estado:</strong> {alertaSeleccionada.estado}
                    </span>
                  </div>
                </div>
                
                <div className={styles.alertDetailContent}>
                  <p>{alertaSeleccionada.contenido}</p>
                </div>
                
                {alertaSeleccionada.asignadoA && (
                  <div className={styles.alertDetailAssigned}>
                    <span className={styles.alertDetailAssignedLabel}>Asignado a:</span>
                    <span className={styles.alertDetailAssignedValue}>{alertaSeleccionada.asignadoA}</span>
                  </div>
                )}
                
                <div className={styles.alertDetailActions}>
                  <h3 className={styles.alertDetailSectionTitle}>Actualizar Alerta</h3>
                  
                  {updateSuccess && (
                    <div className={styles.successMessage}>
                      <p>{updateSuccess}</p>
                    </div>
                  )}
                  
                  <form onSubmit={handleUpdateAlerta} className={styles.alertUpdateForm}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="estado" className={styles.formLabel}>
                          Estado
                        </label>
                        <select
                          id="estado"
                          name="estado"
                          className={styles.formInput}
                          value={formData.estado}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En proceso">En proceso</option>
                          <option value="Resuelta">Resuelta</option>
                        </select>
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label htmlFor="asignadoA" className={styles.formLabel}>
                          Asignar a
                        </label>
                        <input
                          type="text"
                          id="asignadoA"
                          name="asignadoA"
                          className={styles.formInput}
                          value={formData.asignadoA}
                          onChange={handleInputChange}
                          placeholder="Nombre del responsable"
                        />
                      </div>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="comentario" className={styles.formLabel}>
                        Comentario
                      </label>
                      <textarea
                        id="comentario"
                        name="comentario"
                        className={styles.formTextarea}
                        value={formData.comentario}
                        onChange={handleInputChange}
                        placeholder="Añadir un comentario (opcional)"
                        rows={4}
                      />
                    </div>
                    
                    <div className={styles.formActions}>
                      <button
                        type="submit"
                        className={styles.buttonPrimary}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Actualizando...' : 'Actualizar Alerta'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className={styles.emptyDetailState}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                <p>Seleccione una alerta para ver los detalles</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 