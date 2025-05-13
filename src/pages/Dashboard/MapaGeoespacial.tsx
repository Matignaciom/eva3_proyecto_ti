import { useState, useEffect } from 'react';
import MapaGeoespacial from '../../components/Maps/MapaGeoespacial';
import styles from './PaginasComunes.module.css';

// Datos de ejemplo para los propietarios
const propietariosMock = [
  { id: 0, nombre: 'Todos los propietarios' },
  { id: 1, nombre: 'Juan Pérez' },
  { id: 2, nombre: 'María González' },
  { id: 3, nombre: 'Pedro Sánchez' },
  { id: 4, nombre: 'Ana Martínez' }
];

export default function PaginaMapaGeoespacial() {
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroPropietario, setFiltroPropietario] = useState<number>(0); // 0 = Todos los propietarios
  const [estadisticas, setEstadisticas] = useState({
    total: 22,
    alDia: 15,
    pendientes: 5,
    atrasados: 2
  });
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState<any | null>(null);
  
  const handleSelectParcela = (parcela: any) => {
    setParcelaSeleccionada(parcela);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Mapa Geoespacial</h1>
        <div className={styles.pageActions}>
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
              {propietariosMock.map((propietario) => (
                <option key={propietario.id} value={propietario.id}>
                  {propietario.nombre}
                </option>
              ))}
            </select>
          </div>
          
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

      <div className={styles.mapSection}>
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
        />
      </div>

      {parcelaSeleccionada && (
        <div className={styles.parcelaDetail}>
          <div className={styles.parcelaDetailHeader}>
            <h2 className={styles.parcelaDetailTitle}>{parcelaSeleccionada.title}</h2>
            <span className={`${styles.parcelaDetailStatus} ${
              parcelaSeleccionada.estado === 'Al día' 
                ? styles.statusGreen 
                : parcelaSeleccionada.estado === 'Pendiente' 
                ? styles.statusYellow 
                : styles.statusRed
            }`}>
              {parcelaSeleccionada.estado}
            </span>
          </div>
          
          <div className={styles.parcelaDetailBody}>
            <div className={styles.parcelaDetailItem}>
              <span className={styles.parcelaDetailLabel}>Propietario:</span>
              <span className={styles.parcelaDetailValue}>{parcelaSeleccionada.propietario}</span>
            </div>
            <div className={styles.parcelaDetailItem}>
              <span className={styles.parcelaDetailLabel}>Dirección:</span>
              <span className={styles.parcelaDetailValue}>{parcelaSeleccionada.direccion}</span>
            </div>
            <div className={styles.parcelaDetailItem}>
              <span className={styles.parcelaDetailLabel}>Superficie:</span>
              <span className={styles.parcelaDetailValue}>{parcelaSeleccionada.superficie}</span>
            </div>
            
            <div className={styles.parcelaDetailActions}>
              <button className={styles.actionButton}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Ver documentos
              </button>
              <button className={`${styles.actionButton} ${styles.primaryButton}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                Enviar notificación
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <h2 className={styles.infoTitle}>Resumen</h2>
          <div className={styles.infoStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Parcelas:</span>
              <span className={styles.statValue}>{estadisticas.total}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Al día:</span>
              <span className={`${styles.statValue} ${styles.statValueGreen}`}>{estadisticas.alDia}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Pendientes:</span>
              <span className={`${styles.statValue} ${styles.statValueYellow}`}>{estadisticas.pendientes}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Atrasados:</span>
              <span className={`${styles.statValue} ${styles.statValueRed}`}>{estadisticas.atrasados}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 