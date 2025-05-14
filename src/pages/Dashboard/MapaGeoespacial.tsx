import { useState, useEffect } from 'react';
import MapaGeoespacial from '../../components/Maps/MapaGeoespacial';
import styles from './PaginasComunes.module.css';

// API URL base
const API_BASE_URL = 'http://localhost:3000';

export default function PaginaMapaGeoespacial() {
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroPropietario, setFiltroPropietario] = useState<number>(0); // 0 = Todos los propietarios
  const [propietarios, setPropietarios] = useState<{ id: number, nombre: string }[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    alDia: 0,
    pendientes: 0,
    atrasados: 0
  });
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [idComunidad, setIdComunidad] = useState<number | null>(null);
  
  // Obtener datos del usuario y su comunidad
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
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
        
        // Si es administrador, obtener todos los propietarios de su comunidad
        if (userData.usuario.rol === 'Administrador') {
          const propietariosResponse = await fetch(`${API_BASE_URL}/api/usuarios`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (propietariosResponse.ok) {
            const propietariosData = await propietariosResponse.json();
            
            // Filtrar solo los copropietarios
            const copropietarios = propietariosData.usuarios
              .filter((user: any) => user.rol === 'Copropietario')
              .map((user: any) => ({
                id: user.id,
                nombre: user.nombreCompleto
              }));
            
            // Añadir opción "Todos los propietarios"
            setPropietarios([
              { id: 0, nombre: 'Todos los propietarios' },
              ...copropietarios
            ]);
          }
        }
        
        // Obtener estadísticas de parcelas para esta comunidad
        const parcelasResponse = await fetch(`${API_BASE_URL}/api/parcelas`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (parcelasResponse.ok) {
          const parcelasData = await parcelasResponse.json();
          
          // Calcular estadísticas
          const total = parcelasData.parcelas.length;
          const alDia = parcelasData.parcelas.filter((p: any) => p.estado === 'Al día').length;
          const pendientes = parcelasData.parcelas.filter((p: any) => p.estado === 'Pendiente').length;
          const atrasados = parcelasData.parcelas.filter((p: any) => p.estado === 'Atrasado').length;
          
          setEstadisticas({
            total,
            alDia,
            pendientes,
            atrasados
          });
        }
        
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleSelectParcela = (parcela: any) => {
    setParcelaSeleccionada(parcela);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Mapa Geoespacial</h1>
        <div className={styles.pageActions}>
          {propietarios.length > 0 && (
            <div className={styles.filterContainer}>
              <label htmlFor="filtroPropietario" className={styles.filterLabel}>
                Propietario:
              </label>
              <select 
                id="filtroPropietario" 
                className={styles.filterSelect}
                value={filtroPropietario}
                onChange={(e) => setFiltroPropietario(Number(e.target.value))}
              >
                {propietarios.map((propietario) => (
                  <option key={propietario.id} value={propietario.id}>
                    {propietario.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className={styles.filterContainer}>
            <label htmlFor="filtroEstado" className={styles.filterLabel}>
              Estado:
            </label>
            <select 
              id="filtroEstado" 
              className={styles.filterSelect}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="alDia">Al día</option>
              <option value="pendiente">Pendiente</option>
              <option value="atrasado">Atrasado</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando mapa y datos...</p>
        </div>
      ) : error ? (
        <div className={styles.errorState}>
          <p>Error: {error}</p>
          <button 
            className={styles.buttonPrimary}
            onClick={() => window.location.reload()}
          >
            Intentar nuevamente
          </button>
        </div>
      ) : (
        <>
          <div className={styles.dashboardStats}>
            <div className={`${styles.statCard} ${styles.statTotal}`}>
              <div className={styles.statValue}>{estadisticas.total}</div>
              <div className={styles.statLabel}>Total de parcelas</div>
            </div>
            <div className={`${styles.statCard} ${styles.statPagados}`}>
              <div className={styles.statValue}>{estadisticas.alDia}</div>
              <div className={styles.statLabel}>Al día</div>
            </div>
            <div className={`${styles.statCard} ${styles.statPendientes}`}>
              <div className={styles.statValue}>{estadisticas.pendientes}</div>
              <div className={styles.statLabel}>Pendientes</div>
            </div>
            <div className={`${styles.statCard} ${styles.statAtrasados}`}>
              <div className={styles.statValue}>{estadisticas.atrasados}</div>
              <div className={styles.statLabel}>Atrasados</div>
            </div>
          </div>
          
          <div className={styles.mapLegend}>
            <h3 className={styles.legendTitle}>Leyenda</h3>
            <div className={styles.legendItems}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotGreen}`}></span>
                <span>Al día</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotYellow}`}></span>
                <span>Pendiente</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotRed}`}></span>
                <span>Atrasado</span>
              </div>
            </div>
          </div>
          
          {/* Componente del mapa con altura personalizada */}
          <MapaGeoespacial 
            height="600px"
            mostrarTodas={filtroPropietario === 0}
            propietarioId={filtroPropietario !== 0 ? filtroPropietario : undefined}
            filtroEstado={filtroEstado}
            onSelectParcela={handleSelectParcela}
            idComunidad={idComunidad || undefined}
          />
          
          {parcelaSeleccionada && (
            <div className={styles.parcelaDetailCard}>
              <h3>Detalles de la Parcela</h3>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Nombre:</span>
                  <span className={styles.detailValue}>{parcelaSeleccionada.title}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Estado:</span>
                  <span className={`${styles.detailValue} ${
                    parcelaSeleccionada.estado === 'Al día' 
                      ? styles.estadoAlDia
                      : parcelaSeleccionada.estado === 'Pendiente'
                      ? styles.estadoPendiente
                      : styles.estadoAtrasado
                  }`}>{parcelaSeleccionada.estado}</span>
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
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 