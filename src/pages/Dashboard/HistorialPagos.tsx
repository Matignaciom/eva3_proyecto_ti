import { useState, useEffect } from 'react';
import styles from './PaginasComunes.module.css';

// Datos de ejemplo para historial de pagos más completo
const historialPagosMockCompleto = [
  {
    id: 101,
    concepto: 'Cuota de Mantención - Agosto 2023',
    monto: 120000,
    fechaPago: '2023-08-12',
    comprobante: 'TR-123456',
    parcelaId: 1,
    parcelaNombre: 'Parcela A-123',
    tipo: 'Cuota Ordinaria',
    metodoPago: 'WebPay'
  },
  {
    id: 102,
    concepto: 'Cuota de Mantención - Agosto 2023',
    monto: 110000,
    fechaPago: '2023-08-14',
    comprobante: 'TR-123489',
    parcelaId: 4,
    parcelaNombre: 'Parcela D-101',
    tipo: 'Cuota Ordinaria',
    metodoPago: 'WebPay'
  },
  {
    id: 103,
    concepto: 'Instalación Sistema de Riego Común',
    monto: 85000,
    fechaPago: '2023-07-25',
    comprobante: 'TR-122001',
    parcelaId: 1,
    parcelaNombre: 'Parcela A-123',
    tipo: 'Cuota Extraordinaria',
    metodoPago: 'WebPay'
  },
  {
    id: 104,
    concepto: 'Cuota de Mantención - Julio 2023',
    monto: 120000,
    fechaPago: '2023-07-10',
    comprobante: 'TR-121345',
    parcelaId: 1,
    parcelaNombre: 'Parcela A-123',
    tipo: 'Cuota Ordinaria',
    metodoPago: 'WebPay'
  },
  {
    id: 105,
    concepto: 'Cuota de Mantención - Julio 2023',
    monto: 110000,
    fechaPago: '2023-07-12',
    comprobante: 'TR-121398',
    parcelaId: 4,
    parcelaNombre: 'Parcela D-101',
    tipo: 'Cuota Ordinaria',
    metodoPago: 'WebPay'
  },
  {
    id: 106,
    concepto: 'Multa por Pago Atrasado - Junio 2023',
    monto: 15000,
    fechaPago: '2023-07-01',
    comprobante: 'TR-120567',
    parcelaId: 4,
    parcelaNombre: 'Parcela D-101',
    tipo: 'Multa',
    metodoPago: 'WebPay'
  },
  {
    id: 107,
    concepto: 'Cuota de Mantención - Junio 2023',
    monto: 110000,
    fechaPago: '2023-06-20',
    comprobante: 'TR-119854',
    parcelaId: 4,
    parcelaNombre: 'Parcela D-101',
    tipo: 'Cuota Ordinaria',
    metodoPago: 'WebPay'
  },
  {
    id: 108,
    concepto: 'Cuota de Mantención - Junio 2023',
    monto: 120000,
    fechaPago: '2023-06-10',
    comprobante: 'TR-119321',
    parcelaId: 1,
    parcelaNombre: 'Parcela A-123',
    tipo: 'Cuota Ordinaria',
    metodoPago: 'WebPay'
  }
];

export default function HistorialPagos() {
  // ID del usuario actual (en un caso real, vendría de la autenticación)
  const currentUserId = 1; // Simulando que es Juan Pérez
  
  // Estados para la página
  const [historialCompleto, setHistorialCompleto] = useState<any[]>([]);
  const [parcelasUsuario, setParcelasUsuario] = useState<{id: number, nombre: string}[]>([]);
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState<number | 'todas'>('todas');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [mostrarComprobante, setMostrarComprobante] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState<any | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Efecto para cargar datos iniciales
  useEffect(() => {
    // En un caso real, estos datos se obtendrían con una petición al backend
    
    // Filtrar las parcelas del usuario actual
    const parcelasDelUsuario = [
      { id: 1, nombre: 'Parcela A-123' },
      { id: 4, nombre: 'Parcela D-101' }
    ];
    setParcelasUsuario(parcelasDelUsuario);
    
    // Actualizar historial de pagos
    setHistorialCompleto(historialPagosMockCompleto);
  }, []);
  
  // Función para mostrar el comprobante
  const verComprobante = (pago: any) => {
    setPagoSeleccionado(pago);
    setMostrarComprobante(true);
    // Reiniciar zoom al abrir el comprobante
    setZoomLevel(100);
  };
  
  // Función para cerrar el modal de comprobante
  const cerrarComprobante = () => {
    setMostrarComprobante(false);
    setPagoSeleccionado(null);
    setIsFullscreen(false);
  };

  // Función para aumentar zoom
  const zoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel(prevZoom => prevZoom + 20);
    }
  };

  // Función para disminuir zoom
  const zoomOut = () => {
    if (zoomLevel > 60) {
      setZoomLevel(prevZoom => prevZoom - 20);
    }
  };

  // Función para cambiar a modo pantalla completa
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Función para filtrar pagos según filtros seleccionados
  const filtrarHistorial = () => {
    let pagosFiltrados = [...historialPagosMockCompleto];
    
    // Filtrar por parcela
    if (parcelaSeleccionada !== 'todas') {
      pagosFiltrados = pagosFiltrados.filter(pago => pago.parcelaId === parcelaSeleccionada);
    }
    
    // Filtrar por tipo
    if (filtroTipo !== 'todos') {
      pagosFiltrados = pagosFiltrados.filter(pago => pago.tipo === filtroTipo);
    }
    
    // Filtrar por periodo
    if (filtroPeriodo !== 'todos') {
      const fechaActual = new Date();
      
      switch (filtroPeriodo) {
        case 'ultimoMes':
          // Último mes
          const mesAnterior = new Date(fechaActual);
          mesAnterior.setMonth(mesAnterior.getMonth() - 1);
          pagosFiltrados = pagosFiltrados.filter(pago => new Date(pago.fechaPago) >= mesAnterior);
          break;
        case 'ultimos3Meses':
          // Últimos 3 meses
          const hace3Meses = new Date(fechaActual);
          hace3Meses.setMonth(hace3Meses.getMonth() - 3);
          pagosFiltrados = pagosFiltrados.filter(pago => new Date(pago.fechaPago) >= hace3Meses);
          break;
        case 'ultimos6Meses':
          // Últimos 6 meses
          const hace6Meses = new Date(fechaActual);
          hace6Meses.setMonth(hace6Meses.getMonth() - 6);
          pagosFiltrados = pagosFiltrados.filter(pago => new Date(pago.fechaPago) >= hace6Meses);
          break;
        default:
          // No hacer nada (mostrar todos)
          break;
      }
    }
    
    return pagosFiltrados;
  };
  
  // Obtener pagos filtrados
  const pagosFiltrados = filtrarHistorial();
  
  // Función para formatear fechas
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  // Función para formatear montos en pesos chilenos
  const formatearMonto = (monto: number) => {
    return monto.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  };
  
  // Calcular total pagado según filtros actuales
  const totalPagado = pagosFiltrados.reduce((sum, pago) => sum + pago.monto, 0);
  
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Historial de Pagos</h1>
      </div>
      
      {/* Filtros */}
      <div className={styles.filtersPanel}>
        <div className={styles.filterContainer}>
          <label htmlFor="parcelaFilter" className={styles.filterLabel}>
            Parcela:
          </label>
          <select 
            id="parcelaFilter" 
            className={styles.filterSelect}
            value={parcelaSeleccionada === 'todas' ? 'todas' : parcelaSeleccionada}
            onChange={(e) => setParcelaSeleccionada(e.target.value === 'todas' ? 'todas' : Number(e.target.value))}
          >
            <option value="todas">Todas mis parcelas</option>
            {parcelasUsuario.map((parcela) => (
              <option key={parcela.id} value={parcela.id}>
                {parcela.nombre}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.filterContainer}>
          <label htmlFor="tipoFilter" className={styles.filterLabel}>
            Tipo de Pago:
          </label>
          <select 
            id="tipoFilter" 
            className={styles.filterSelect}
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="todos">Todos los tipos</option>
            <option value="Cuota Ordinaria">Cuota Ordinaria</option>
            <option value="Cuota Extraordinaria">Cuota Extraordinaria</option>
            <option value="Multa">Multa</option>
          </select>
        </div>
        
        <div className={styles.filterContainer}>
          <label htmlFor="periodoFilter" className={styles.filterLabel}>
            Período:
          </label>
          <select 
            id="periodoFilter" 
            className={styles.filterSelect}
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
          >
            <option value="todos">Todo el historial</option>
            <option value="ultimoMes">Último mes</option>
            <option value="ultimos3Meses">Últimos 3 meses</option>
            <option value="ultimos6Meses">Últimos 6 meses</option>
          </select>
        </div>
      </div>
      
      {/* Panel de resumen */}
      <div className={styles.summaryPanel}>
        <div className={styles.summaryCard}>
          <h3>Total Pagado</h3>
          <div className={styles.summaryAmount}>
            {formatearMonto(totalPagado)}
          </div>
          <p className={styles.summaryDetail}>
            {pagosFiltrados.length} pago(s) realizados
          </p>
        </div>
      </div>
      
      {/* Tabla de historial */}
      <div className={styles.sectionTitle}>
        <h2>Detalle de Pagos</h2>
      </div>
      
      {pagosFiltrados.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>No hay pagos que coincidan con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className={styles.tableResponsive}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Tipo</th>
                <th>Parcela</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Comprobante</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.map((pago) => (
                <tr key={pago.id}>
                  <td>{formatearFecha(pago.fechaPago)}</td>
                  <td>{pago.concepto}</td>
                  <td>{pago.tipo}</td>
                  <td>{pago.parcelaNombre}</td>
                  <td>{formatearMonto(pago.monto)}</td>
                  <td>{pago.metodoPago}</td>
                  <td>{pago.comprobante}</td>
                  <td>
                    <button 
                      className={styles.buttonOutline}
                      onClick={() => verComprobante(pago)}
                    >
                      Ver Comprobante
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Opción para descargar */}
      <div className={styles.downloadOptions}>
        <button 
          className={styles.buttonPrimary}
          onClick={() => alert('Descargando historial en PDF...')}
        >
          Descargar PDF
        </button>
        <button 
          className={styles.buttonOutline}
          onClick={() => alert('Descargando historial en Excel...')}
          style={{ marginLeft: '10px' }}
        >
          Exportar a Excel
        </button>
      </div>
      
      {/* Modal de comprobante */}
      {mostrarComprobante && pagoSeleccionado && (
        <div className={`${styles.modalOverlay} ${isFullscreen ? styles.fullscreenModal : ''}`}>
          <div className={`${styles.modal} ${isFullscreen ? styles.fullscreenContent : ''}`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Comprobante de Pago</h2>
              <div className={styles.modalControls}>
                <button 
                  className={styles.controlButton}
                  onClick={zoomOut}
                  title="Reducir"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{color: "#000000"}}>
                    <line x1="5" y1="12" x2="19" y2="12" stroke="#000000"></line>
                  </svg>
                </button>
                <span className={styles.zoomText}>{zoomLevel}%</span>
                <button 
                  className={styles.controlButton}
                  onClick={zoomIn}
                  title="Ampliar"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{color: "#000000"}}>
                    <line x1="12" y1="5" x2="12" y2="19" stroke="#000000"></line>
                    <line x1="5" y1="12" x2="19" y2="12" stroke="#000000"></line>
                  </svg>
                </button>
                <button 
                  className={styles.controlButton}
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                >
                  {isFullscreen ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{color: "#000000"}}>
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" stroke="#000000"></path>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{color: "#000000"}}>
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="#000000"></path>
                    </svg>
                  )}
                </button>
                <button 
                  className={styles.closeButton}
                  onClick={cerrarComprobante}
                >
                </button>
              </div>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.documentViewport}>
                <div 
                  className={styles.documentScroller}
                  style={{ transform: `scale(${zoomLevel / 100})` }}
                >
                  <div className={styles.comprobanteContainer}>
                    {/* Encabezado del documento */}
                    <div className={styles.documentHeader}>
                      <img 
                        src="https://www.transbankdevelopers.cl/public/library/img/logo-tbk-de.png" 
                        alt="Transbank WebPay"
                        className={styles.documentLogo}
                      />
                      <div className={styles.documentTitle}>
                        <h2>Comprobante de Pago</h2>
                        <p className={styles.documentSmall}>Documento electrónico - No válido como boleta</p>
                      </div>
                    </div>

                    {/* Información del comprobante */}
                    <div className={styles.comprobanteHeader}>
                      <div className={styles.comprobanteCompany}>
                        <h3 className={styles.modalSubtitle}>Comunidad SIGEPA</h3>
                        <p className={styles.modalText}>RUT: 12.345.678-9</p>
                        <p className={styles.modalText}>Dirección: Av. Principal 123, Santiago</p>
                      </div>
                      <div className={styles.comprobanteNumber}>
                        <h3 className={styles.modalSubtitle}>Comprobante</h3>
                        <p className={styles.modalText}># {pagoSeleccionado.comprobante}</p>
                        <p className={styles.modalText}>Fecha: {formatearFecha(pagoSeleccionado.fechaPago)}</p>
                      </div>
                    </div>
                    
                    <div className={styles.documentSection}>
                      <h4 className={styles.sectionTitle}>Datos del Pago</h4>
                      <div className={styles.comprobanteMeta}>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Fecha de Pago:</span>
                          <span className={styles.detailValue}>{formatearFecha(pagoSeleccionado.fechaPago)}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Método de Pago:</span>
                          <span className={styles.detailValue}>
                            <img 
                              src="https://www.transbankdevelopers.cl/public/library/img/logo-tbk-de.png" 
                              alt="Transbank WebPay"
                              style={{ height: '20px', marginRight: '5px', verticalAlign: 'middle' }}
                            />
                            WebPay
                          </span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Propietario:</span>
                          <span className={styles.detailValue}>Juan Pérez</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Parcela:</span>
                          <span className={styles.detailValue}>{pagoSeleccionado.parcelaNombre}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.documentSection}>
                      <h4 className={styles.sectionTitle}>Detalle del Pago</h4>
                      <table className={styles.comprobanteTable}>
                        <thead>
                          <tr>
                            <th className={styles.modalText}>Concepto</th>
                            <th className={styles.modalText}>Tipo</th>
                            <th className={styles.modalText}>Monto</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className={styles.modalText}>{pagoSeleccionado.concepto}</td>
                            <td className={styles.modalText}>{pagoSeleccionado.tipo}</td>
                            <td className={styles.modalText}>{formatearMonto(pagoSeleccionado.monto)}</td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={2} className={styles.modalText}><strong>Total</strong></td>
                            <td className={styles.modalText}><strong>{formatearMonto(pagoSeleccionado.monto)}</strong></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    
                    <div className={styles.documentFooter}>
                      <div className={styles.qrCode}>
                        <div className={styles.qrPlaceholder}></div>
                        <p className={styles.documentSmall}>Código de verificación</p>
                      </div>
                      
                      <div className={styles.comprobanteFoot}>
                        <p className={styles.documentSmall}>Este comprobante es un documento válido para acreditar el pago realizado.</p>
                        <p className={styles.documentSmall}>Transacción procesada por Transbank.</p>
                        <p className={styles.documentSmall}>Para cualquier consulta, contactar a administracion@sigepa.cl</p>
                      </div>
                      
                      <div className={styles.stampContainer}>
                        <div className={styles.stampBox}>
                          <p className={styles.stampText}>Transacción Aprobada</p>
                          <p className={styles.stampDate}>{formatearFecha(pagoSeleccionado.fechaPago)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.buttonSecondary}
                onClick={cerrarComprobante}
              >
                Cerrar
              </button>
              
              <button 
                className={styles.buttonPrimary}
                onClick={() => alert(`Descargando comprobante ${pagoSeleccionado.comprobante} en PDF...`)}
              >
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 