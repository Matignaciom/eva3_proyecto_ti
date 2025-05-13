import { useState, useEffect } from 'react';
import styles from './PaginasComunes.module.css';

// Tipos para los gastos/pagos
interface Gasto {
  id: number;
  concepto: string;
  monto: number;
  fechaVencimiento: string;
  estado: 'Pendiente' | 'Pagado' | 'Atrasado';
  tipo: 'Cuota Ordinaria' | 'Cuota Extraordinaria' | 'Multa' | 'Otro';
  parcelaId: number;
  parcelaNombre: string;
}

// Datos de ejemplo para gastos pendientes
const gastosMock: Gasto[] = [
  {
    id: 1,
    concepto: 'Cuota de Mantención - Septiembre 2023',
    monto: 120000,
    fechaVencimiento: '2023-09-15',
    estado: 'Pendiente',
    tipo: 'Cuota Ordinaria',
    parcelaId: 1,
    parcelaNombre: 'Parcela A-123'
  },
  {
    id: 2,
    concepto: 'Reparación Camino Común',
    monto: 45000,
    fechaVencimiento: '2023-09-20',
    estado: 'Pendiente',
    tipo: 'Cuota Extraordinaria',
    parcelaId: 1,
    parcelaNombre: 'Parcela A-123'
  },
  {
    id: 3,
    concepto: 'Cuota de Mantención - Septiembre 2023',
    monto: 110000,
    fechaVencimiento: '2023-09-15',
    estado: 'Pendiente',
    tipo: 'Cuota Ordinaria',
    parcelaId: 4,
    parcelaNombre: 'Parcela D-101'
  },
  {
    id: 4,
    concepto: 'Multa por retraso en pago - Agosto 2023',
    monto: 15000,
    fechaVencimiento: '2023-09-10',
    estado: 'Atrasado',
    tipo: 'Multa',
    parcelaId: 4,
    parcelaNombre: 'Parcela D-101'
  }
];

// Datos de ejemplo para historial de pagos
const historialPagosMock = [
  {
    id: 101,
    concepto: 'Cuota de Mantención - Agosto 2023',
    monto: 120000,
    fechaPago: '2023-08-12',
    comprobante: 'TR-123456',
    parcelaId: 1,
    parcelaNombre: 'Parcela A-123'
  },
  {
    id: 102,
    concepto: 'Cuota de Mantención - Agosto 2023',
    monto: 110000,
    fechaPago: '2023-08-14',
    comprobante: 'TR-123489',
    parcelaId: 4,
    parcelaNombre: 'Parcela D-101'
  },
  {
    id: 103,
    concepto: 'Instalación Sistema de Riego Común',
    monto: 85000,
    fechaPago: '2023-07-25',
    comprobante: 'TR-122001',
    parcelaId: 1,
    parcelaNombre: 'Parcela A-123'
  }
];

// Componente para la página de Pagos
export default function Pagos() {
  // ID del usuario actual (en un caso real, vendría de la autenticación)
  const currentUserId = 1; // Simulando que es Juan Pérez
  
  // Estados para la página
  const [gastosPendientes, setGastosPendientes] = useState<Gasto[]>([]);
  const [historialPagos, setHistorialPagos] = useState<any[]>([]);
  const [parcelasUsuario, setParcelasUsuario] = useState<{id: number, nombre: string}[]>([]);
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState<number | 'todas'>(1);
  const [mostrarFormaPago, setMostrarFormaPago] = useState(false);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [gastoAPagar, setGastoAPagar] = useState<Gasto | null>(null);
  const [gastoDetalle, setGastoDetalle] = useState<Gasto | null>(null);
  const [metodoPago, setMetodoPago] = useState('webpay');
  const [totalPendiente, setTotalPendiente] = useState(0);
  
  // Estados para visor de comprobante
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
    
    // Inicialmente seleccionar 'todas' o la primera parcela
    setParcelaSeleccionada(parcelasDelUsuario.length > 0 ? parcelasDelUsuario[0].id : 'todas');
    
    // Actualizar gastos pendientes según la parcela seleccionada
    actualizarGastosPendientes(parcelasDelUsuario.length > 0 ? parcelasDelUsuario[0].id : 'todas');
    
    // Actualizar historial de pagos
    setHistorialPagos(historialPagosMock);
  }, []);
  
  // Efecto para actualizar gastos cuando cambia la parcela seleccionada
  useEffect(() => {
    actualizarGastosPendientes(parcelaSeleccionada);
  }, [parcelaSeleccionada]);
  
  // Función para actualizar gastos pendientes según la parcela seleccionada
  const actualizarGastosPendientes = (parcelaId: number | 'todas') => {
    let gastosFiltrados;
    
    if (parcelaId === 'todas') {
      // Mostrar gastos de todas las parcelas del usuario
      gastosFiltrados = gastosMock.filter(gasto => 
        parcelasUsuario.some(p => p.id === gasto.parcelaId)
      );
    } else {
      // Mostrar gastos de la parcela específica
      gastosFiltrados = gastosMock.filter(gasto => gasto.parcelaId === parcelaId);
    }
    
    setGastosPendientes(gastosFiltrados);
    
    // Calcular total pendiente
    const total = gastosFiltrados.reduce((sum, gasto) => sum + gasto.monto, 0);
    setTotalPendiente(total);
  };
  
  // Función para iniciar el proceso de pago
  const iniciarPago = (gasto: Gasto) => {
    setGastoAPagar(gasto);
    setMostrarFormaPago(true);
  };
  
  // Función para cancelar el proceso de pago
  const cancelarPago = () => {
    setMostrarFormaPago(false);
    setGastoAPagar(null);
  };

  // Función para mostrar el detalle del gasto
  const mostrarDetalleGasto = (gasto: Gasto) => {
    setGastoDetalle(gasto);
    setMostrarDetalle(true);
  };

  // Función para cerrar el detalle
  const cerrarDetalle = () => {
    setMostrarDetalle(false);
    setGastoDetalle(null);
  };
  
  // Función para iniciar pago con Transbank WebPay
  const pagarConWebPay = () => {
    // En un caso real, aquí se enviaría una solicitud al backend para iniciar la transacción
    alert(`Redirigiendo a WebPay para pagar ${formatearMonto(gastoAPagar?.monto || 0)}`);
    
    // Simulación de pago exitoso
    setTimeout(() => {
      if (gastoAPagar) {
        // Actualizar estado localmente (simulado)
        const nuevosGastos = gastosPendientes.filter(g => g.id !== gastoAPagar.id);
        setGastosPendientes(nuevosGastos);
        
        // Actualizar total pendiente
        const nuevoTotal = nuevosGastos.reduce((sum, gasto) => sum + gasto.monto, 0);
        setTotalPendiente(nuevoTotal);
        
        // Cerrar formulario
        setMostrarFormaPago(false);
        setGastoAPagar(null);
      }
    }, 2000);
  };
  
  // Función para formatear fechas
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  // Función para formatear montos en pesos chilenos
  const formatearMonto = (monto: number) => {
    return monto.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  };
  
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
  
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Gestión de Pagos</h1>
        
        {/* Selector de parcela si el usuario tiene más de una */}
        {parcelasUsuario.length > 1 && (
          <div className={styles.parcelaSelector}>
            <label htmlFor="parcela" className={styles.filterLabel}>
              Parcela:
            </label>
            <select 
              id="parcela" 
              className={styles.filterSelect}
              value={parcelaSeleccionada === 'todas' ? 'todas' : parcelaSeleccionada}
              onChange={(e) => setParcelaSeleccionada(e.target.value === 'todas' ? 'todas' : Number(e.target.value))}
            >
              {parcelasUsuario.map((parcela) => (
                <option key={parcela.id} value={parcela.id}>
                  {parcela.nombre}
                </option>
              ))}
              <option value="todas">Todas mis parcelas</option>
            </select>
          </div>
        )}
      </div>
      
      {/* Panel de resumen */}
      <div className={styles.summaryPanel}>
        <div className={styles.summaryCard}>
          <h3>Total Pendiente</h3>
          <div className={styles.summaryAmount}>
            {formatearMonto(totalPendiente)}
          </div>
          <p className={styles.summaryDetail}>
            {gastosPendientes.length} gasto(s) por pagar
          </p>
        </div>
        
        <div className={styles.summaryCard}>
          <h3>Estado de Pagos</h3>
          <div className={styles.statusIndicators}>
            <div className={`${styles.statusIndicator} ${gastosPendientes.some(g => g.estado === 'Atrasado') ? styles.statusRed : styles.statusGreen}`}>
              {gastosPendientes.some(g => g.estado === 'Atrasado') ? 'Tienes pagos atrasados' : 'Al día'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Lista de gastos pendientes */}
      <div className={styles.sectionTitle}>
        <h2>Gastos Pendientes</h2>
      </div>
      
      {gastosPendientes.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>No tienes gastos pendientes por pagar.</p>
        </div>
      ) : (
        <div className={styles.tableResponsive}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th>Parcela</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {gastosPendientes.map((gasto) => (
                <tr key={gasto.id} className={gasto.estado === 'Atrasado' ? styles.rowAlert : ''}>
                  <td>{gasto.concepto}</td>
                  <td>{formatearMonto(gasto.monto)}</td>
                  <td>{formatearFecha(gasto.fechaVencimiento)}</td>
                  <td>
                    <span className={`${styles.badgeStatus} ${
                      gasto.estado === 'Pendiente' ? styles.statusYellow :
                      gasto.estado === 'Atrasado' ? styles.statusRed :
                      styles.statusGreen
                    }`}>
                      {gasto.estado}
                    </span>
                  </td>
                  <td>{gasto.parcelaNombre}</td>
                  <td>
                    <button 
                      className={styles.buttonPrimary}
                      onClick={() => iniciarPago(gasto)}
                    >
                      Pagar
                    </button>
                    <button 
                      className={styles.buttonOutline}
                      onClick={() => mostrarDetalleGasto(gasto)}
                    >
                      Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Últimos pagos realizados */}
      <div className={styles.sectionTitle}>
        <h2>Últimos Pagos Realizados</h2>
      </div>
      
      <div className={styles.tableResponsive}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Fecha Pago</th>
              <th>Comprobante</th>
              <th>Parcela</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {historialPagos.slice(0, 3).map((pago) => (
              <tr key={pago.id}>
                <td>{pago.concepto}</td>
                <td>{formatearMonto(pago.monto)}</td>
                <td>{formatearFecha(pago.fechaPago)}</td>
                <td>{pago.comprobante}</td>
                <td>{pago.parcelaNombre}</td>
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
      
      {/* Enlace para ver historial completo */}
      <div className={styles.viewAllLink}>
        <a href="/dashboard/historial-pagos" className={styles.link}>
          Ver historial completo →
        </a>
      </div>
      
      {/* Modal para forma de pago con Transbank WebPay */}
      {mostrarFormaPago && gastoAPagar && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Pagar Gasto</h2>
              <button 
                className={styles.closeButton}
                onClick={cancelarPago}
              >
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.paymentSummary}>
                <p className={styles.modalText}><strong>Concepto:</strong> {gastoAPagar.concepto}</p>
                <p className={styles.modalText}><strong>Monto:</strong> {formatearMonto(gastoAPagar.monto)}</p>
                <p className={styles.modalText}><strong>Parcela:</strong> {gastoAPagar.parcelaNombre}</p>
              </div>
              
              <div className={styles.webpayContainer}>
                <div className={styles.webpayLogo}>
                  <img 
                    src="https://www.transbankdevelopers.cl/public/library/img/logo-tbk-de.png" 
                    alt="Transbank WebPay"
                    style={{ maxWidth: '200px', marginBottom: '15px' }}
                  />
                </div>
                
                <p className={styles.modalText}>
                  El pago se realizará a través de WebPay Plus de Transbank, la plataforma de pagos electrónicos más segura de Chile.
                </p>
                
                <div className={styles.paymentMethods}>
                  <div className={styles.paymentMethodIcons}>
                    <img 
                      src="https://www.webpay.cl/gatsby-files/static/4e3027bd5466dd2c1ac3eaae68c7a75b/b48af/logo-credito-visa.png" 
                      alt="Visa"
                      className={styles.paymentIcon}
                    />
                    <img 
                      src="https://www.webpay.cl/gatsby-files/static/b4546aeedb3dc22a67ebf6da49b3c9f1/c5a6a/logo-credito-mastercard.png" 
                      alt="Mastercard"
                      className={styles.paymentIcon}
                    />
                    <img 
                      src="https://www.webpay.cl/gatsby-files/static/96a7c06eeea97f8ceab898338b607426/35c89/logo-credito-magna.png" 
                      alt="Magna"
                      className={styles.paymentIcon}
                    />
                    <img 
                      src="https://www.webpay.cl/gatsby-files/static/f45e5ac8e36fbf4bc5d3969a5de7da3b/41179/logo-debito-cuentarut.png" 
                      alt="CuentaRUT"
                      className={styles.paymentIcon}
                    />
                  </div>
                </div>
                
                <p className={styles.modalText}>
                  Al hacer clic en "Pagar con WebPay", serás redirigido a la plataforma de Transbank para completar el pago de forma segura.
                </p>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.buttonSecondary}
                onClick={cancelarPago}
              >
                Cancelar
              </button>
              
              <button 
                className={styles.buttonWebpay}
                onClick={pagarConWebPay}
              >
                Pagar con WebPay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mostrar detalle de gasto */}
      {mostrarDetalle && gastoDetalle && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Detalle del Gasto</h2>
              <button 
                className={styles.closeButton}
                onClick={cerrarDetalle}
              >
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.detailsContainer}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Concepto:</span>
                  <span className={styles.detailValue}>{gastoDetalle.concepto}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Monto:</span>
                  <span className={styles.detailValue}>{formatearMonto(gastoDetalle.monto)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tipo:</span>
                  <span className={styles.detailValue}>{gastoDetalle.tipo}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Fecha Vencimiento:</span>
                  <span className={styles.detailValue}>{formatearFecha(gastoDetalle.fechaVencimiento)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Estado:</span>
                  <span className={`${styles.detailValue} ${
                    gastoDetalle.estado === 'Pendiente' ? styles.statusYellow :
                    gastoDetalle.estado === 'Atrasado' ? styles.statusRed :
                    styles.statusGreen
                  }`}>
                    {gastoDetalle.estado}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Parcela:</span>
                  <span className={styles.detailValue}>{gastoDetalle.parcelaNombre}</span>
                </div>
              </div>

              <div className={styles.detailDescription}>
                <h3 className={styles.modalSubtitle}>Descripción</h3>
                <p className={styles.modalText}>
                  Este cargo corresponde a {gastoDetalle.tipo.toLowerCase()} establecida por la administración de la comunidad.
                  El pago debe realizarse antes de la fecha de vencimiento para evitar recargos adicionales.
                </p>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.buttonSecondary}
                onClick={cerrarDetalle}
              >
                Cerrar
              </button>
              
              <button 
                className={styles.buttonPrimary}
                onClick={() => {
                  cerrarDetalle();
                  iniciarPago(gastoDetalle);
                }}
              >
                Realizar Pago
              </button>
            </div>
          </div>
        </div>
      )}

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
                            <td className={styles.modalText}>{pagoSeleccionado.tipo || 'Cuota Ordinaria'}</td>
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