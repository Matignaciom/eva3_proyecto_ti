import { useState, useEffect } from "react";
import styles from "./HistorialPagos.module.css";
import ComprobanteModal from "../../components/ComprobanteModal";

// Datos de ejemplo para historial de pagos más completo
const historialPagosMockCompleto = [
  {
    id: 101,
    concepto: "Cuota de Mantención - Agosto 2023",
    monto: 120000,
    fechaPago: "2023-08-12",
    comprobante: "TR-123456",
    parcelaId: 1,
    parcelaNombre: "Parcela A-123",
    tipo: "Cuota Ordinaria",
    metodoPago: "WebPay",
  },
  {
    id: 102,
    concepto: "Cuota de Mantención - Agosto 2023",
    monto: 110000,
    fechaPago: "2023-08-14",
    comprobante: "TR-123489",
    parcelaId: 4,
    parcelaNombre: "Parcela D-101",
    tipo: "Cuota Ordinaria",
    metodoPago: "WebPay",
  },
  {
    id: 103,
    concepto: "Instalación Sistema de Riego Común",
    monto: 85000,
    fechaPago: "2023-07-25",
    comprobante: "TR-122001",
    parcelaId: 1,
    parcelaNombre: "Parcela A-123",
    tipo: "Cuota Extraordinaria",
    metodoPago: "WebPay",
  },
  {
    id: 104,
    concepto: "Cuota de Mantención - Julio 2023",
    monto: 120000,
    fechaPago: "2023-07-10",
    comprobante: "TR-121345",
    parcelaId: 1,
    parcelaNombre: "Parcela A-123",
    tipo: "Cuota Ordinaria",
    metodoPago: "WebPay",
  },
  {
    id: 105,
    concepto: "Cuota de Mantención - Julio 2023",
    monto: 110000,
    fechaPago: "2023-07-12",
    comprobante: "TR-121398",
    parcelaId: 4,
    parcelaNombre: "Parcela D-101",
    tipo: "Cuota Ordinaria",
    metodoPago: "WebPay",
  },
  {
    id: 106,
    concepto: "Multa por Pago Atrasado - Junio 2023",
    monto: 15000,
    fechaPago: "2023-07-01",
    comprobante: "TR-120567",
    parcelaId: 4,
    parcelaNombre: "Parcela D-101",
    tipo: "Multa",
    metodoPago: "WebPay",
  },
  {
    id: 107,
    concepto: "Cuota de Mantención - Junio 2023",
    monto: 110000,
    fechaPago: "2023-06-20",
    comprobante: "TR-119854",
    parcelaId: 4,
    parcelaNombre: "Parcela D-101",
    tipo: "Cuota Ordinaria",
    metodoPago: "WebPay",
  },
  {
    id: 108,
    concepto: "Cuota de Mantención - Junio 2023",
    monto: 120000,
    fechaPago: "2023-06-10",
    comprobante: "TR-119321",
    parcelaId: 1,
    parcelaNombre: "Parcela A-123",
    tipo: "Cuota Ordinaria",
    metodoPago: "WebPay",
  },
];

export default function HistorialPagos() {
  // ID del usuario actual (en un caso real, vendría de la autenticación)
  const currentUserId = 1; // Simulando que es Juan Pérez

  // Estados para la página
  const [historialCompleto, setHistorialCompleto] = useState<any[]>([]);
  const [parcelasUsuario, setParcelasUsuario] = useState<
    { id: number; nombre: string }[]
  >([]);
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState<
    number | "todas"
  >("todas");
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [mostrarComprobante, setMostrarComprobante] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState<any | null>(null);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    // En un caso real, estos datos se obtendrían con una petición al backend

    // Filtrar las parcelas del usuario actual
    const parcelasDelUsuario = [
      { id: 1, nombre: "Parcela A-123" },
      { id: 4, nombre: "Parcela D-101" },
    ];
    setParcelasUsuario(parcelasDelUsuario);

    // Actualizar historial de pagos
    setHistorialCompleto(historialPagosMockCompleto);
  }, []);

  // Función para mostrar el comprobante
  const verComprobante = (pago: any) => {
    setPagoSeleccionado(pago);
    setMostrarComprobante(true);
  };

  // Función para cerrar el modal de comprobante
  const cerrarComprobante = () => {
    setMostrarComprobante(false);
    setPagoSeleccionado(null);
  };

  // Función para filtrar pagos según filtros seleccionados
  const filtrarHistorial = () => {
    let pagosFiltrados = [...historialPagosMockCompleto];

    // Filtrar por parcela
    if (parcelaSeleccionada !== "todas") {
      pagosFiltrados = pagosFiltrados.filter(
        (pago) => pago.parcelaId === parcelaSeleccionada,
      );
    }

    // Filtrar por tipo
    if (filtroTipo !== "todos") {
      pagosFiltrados = pagosFiltrados.filter(
        (pago) => pago.tipo === filtroTipo,
      );
    }

    // Filtrar por periodo
    if (filtroPeriodo !== "todos") {
      const fechaActual = new Date();

      switch (filtroPeriodo) {
        case "ultimoMes":
          // Último mes
          const mesAnterior = new Date(fechaActual);
          mesAnterior.setMonth(mesAnterior.getMonth() - 1);
          pagosFiltrados = pagosFiltrados.filter(
            (pago) => new Date(pago.fechaPago) >= mesAnterior,
          );
          break;
        case "ultimos3Meses":
          // Últimos 3 meses
          const hace3Meses = new Date(fechaActual);
          hace3Meses.setMonth(hace3Meses.getMonth() - 3);
          pagosFiltrados = pagosFiltrados.filter(
            (pago) => new Date(pago.fechaPago) >= hace3Meses,
          );
          break;
        case "ultimos6Meses":
          // Últimos 6 meses
          const hace6Meses = new Date(fechaActual);
          hace6Meses.setMonth(hace6Meses.getMonth() - 6);
          pagosFiltrados = pagosFiltrados.filter(
            (pago) => new Date(pago.fechaPago) >= hace6Meses,
          );
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
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Función para formatear montos en pesos chilenos
  const formatearMonto = (monto: number) => {
    return monto.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
    });
  };

  // Calcular total pagado según filtros actuales
  const totalPagado = pagosFiltrados.reduce((sum, pago) => sum + pago.monto, 0);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Historial de Pagos</h1>
        <div className={styles.pageActions}>
          <button className={styles.actionButton}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Buscar pagos
          </button>
          <button className={styles.actionButton}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <line x1="21" y1="10" x2="3" y2="10"></line>
              <line x1="21" y1="6" x2="3" y2="6"></line>
              <line x1="21" y1="14" x2="3" y2="14"></line>
              <line x1="21" y1="18" x2="3" y2="18"></line>
            </svg>
            Filtros avanzados
          </button>
        </div>
      </div>

      {/* Filtros mejorados para responsividad */}
      <div className={`${styles.filtersPanel} ${styles.responsiveFilters}`}>
        <div className={styles.filterContainer}>
          <label htmlFor="parcelaFilter" className={styles.filterLabel}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Parcela:
          </label>
          <select
            id="parcelaFilter"
            className={styles.filterSelect}
            value={
              parcelaSeleccionada === "todas" ? "todas" : parcelaSeleccionada
            }
            onChange={(e) =>
              setParcelaSeleccionada(
                e.target.value === "todas" ? "todas" : Number(e.target.value),
              )
            }
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
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

      {/* Panel de resumen responsivo */}
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
        
        <div className={styles.summaryCard}>
          <h3>Último Pago</h3>
          <div className={styles.summaryAmount}>
            {pagosFiltrados.length > 0 
              ? formatearFecha(pagosFiltrados[0].fechaPago)
              : "Sin pagos"}
          </div>
          <p className={styles.summaryDetail}>
            {pagosFiltrados.length > 0 
              ? pagosFiltrados[0].concepto
              : "No hay pagos registrados"}
          </p>
        </div>
      </div>

      {/* Tabla de historial con mejoras responsivas */}
      <div className={styles.sectionTitle}>
        <h2>Detalle de Pagos</h2>
      </div>

      {pagosFiltrados.length === 0 ? (
        <div className={styles.emptyState}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>No se encontraron pagos para los filtros seleccionados.</p>
          <button 
            className={styles.buttonOutline}
            onClick={() => {
              setParcelaSeleccionada("todas");
              setFiltroPeriodo("todos");
              setFiltroTipo("todos");
            }}
            style={{ marginTop: '16px' }}
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className={`${styles.tableResponsive} ${styles.responsiveTable}`}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Concepto</th>
                <th className={styles.hiddenOnMobile}>Tipo</th>
                <th className={styles.hiddenOnMobile}>Parcela</th>
                <th>Monto</th>
                <th className={styles.hiddenOnMobile}>Método</th>
                <th className={styles.hiddenOnMobile}>Comprobante</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.map((pago) => (
                <tr key={pago.id} className={styles.responsiveRow}>
                  <td data-label="Fecha">{formatearFecha(pago.fechaPago)}</td>
                  <td data-label="Concepto">{pago.concepto}</td>
                  <td data-label="Tipo" className={styles.hiddenOnMobile}>
                    <span className={`${styles.badgeStatus} ${
                      pago.tipo === "Cuota Ordinaria" 
                        ? styles.statusGreen 
                        : pago.tipo === "Cuota Extraordinaria" 
                          ? styles.statusYellow 
                          : styles.statusRed
                    }`}>
                      {pago.tipo}
                    </span>
                  </td>
                  <td data-label="Parcela" className={styles.hiddenOnMobile}>
                    {pago.parcelaNombre}
                  </td>
                  <td data-label="Monto">{formatearMonto(pago.monto)}</td>
                  <td data-label="Método" className={styles.hiddenOnMobile}>
                    {pago.metodoPago}
                  </td>
                  <td
                    data-label="Comprobante"
                    className={styles.hiddenOnMobile}
                  >
                    {pago.comprobante}
                  </td>
                  <td data-label="Acciones">
                    <button
                      className={styles.buttonOutline}
                      onClick={() => verComprobante(pago)}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        style={{ marginRight: '6px' }}
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Ver comprobante
                    </button>
                    <div className={styles.visibleOnMobile}>
                      {/* Se eliminan las líneas de información de tipo y parcela */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Opción para descargar en formato responsivo */}
      <div className={styles.downloadOptions}>
        <button
          className={`${styles.buttonPrimary} ${styles.responsiveButton}`}
          onClick={() => alert("Descargando historial en PDF...")}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ marginRight: '8px' }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Descargar PDF
        </button>
        <button
          className={`${styles.buttonOutline} ${styles.responsiveButton}`}
          onClick={() => alert("Descargando historial en Excel...")}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ marginRight: '8px' }}
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Exportar a Excel
        </button>
      </div>

      {/* Modal de comprobante con el componente reutilizable */}
      {mostrarComprobante && pagoSeleccionado && (
        <ComprobanteModal 
          isOpen={mostrarComprobante}
          onClose={cerrarComprobante}
          pago={pagoSeleccionado}
          styles={styles}
        />
      )}
    </div>
  );
}
