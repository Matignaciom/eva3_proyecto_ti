import { useState, useEffect } from "react";
import styles from "./Pagos.module.css";
import ComprobanteModal from "../../components/ComprobanteModal";

// Tipos para los gastos/pagos
interface Gasto {
  id: number;
  concepto: string;
  monto: number;
  fechaVencimiento: string;
  estado: "Pendiente" | "Pagado" | "Atrasado";
  tipo: "Cuota Ordinaria" | "Cuota Extraordinaria" | "Multa" | "Otro";
  parcelaId: number;
  parcelaNombre: string;
}

// Datos de ejemplo para gastos pendientes
const gastosMock: Gasto[] = [
  {
    id: 1,
    concepto: "Cuota de Mantención - Septiembre 2023",
    monto: 120000,
    fechaVencimiento: "2023-09-15",
    estado: "Pendiente",
    tipo: "Cuota Ordinaria",
    parcelaId: 1,
    parcelaNombre: "Parcela A-123",
  },
  {
    id: 2,
    concepto: "Reparación Camino Común",
    monto: 45000,
    fechaVencimiento: "2023-09-20",
    estado: "Pendiente",
    tipo: "Cuota Extraordinaria",
    parcelaId: 1,
    parcelaNombre: "Parcela A-123",
  },
  {
    id: 3,
    concepto: "Cuota de Mantención - Septiembre 2023",
    monto: 110000,
    fechaVencimiento: "2023-09-15",
    estado: "Pendiente",
    tipo: "Cuota Ordinaria",
    parcelaId: 4,
    parcelaNombre: "Parcela D-101",
  },
  {
    id: 4,
    concepto: "Multa por retraso en pago - Agosto 2023",
    monto: 15000,
    fechaVencimiento: "2023-09-10",
    estado: "Atrasado",
    tipo: "Multa",
    parcelaId: 4,
    parcelaNombre: "Parcela D-101",
  },
];

// Datos de ejemplo para historial de pagos
const historialPagosMock = [
  {
    id: 101,
    concepto: "Cuota de Mantención - Agosto 2023",
    monto: 120000,
    fechaPago: "2023-08-12",
    comprobante: "TR-123456",
    parcelaId: 1,
    parcelaNombre: "Parcela A-123",
  },
  {
    id: 102,
    concepto: "Cuota de Mantención - Agosto 2023",
    monto: 110000,
    fechaPago: "2023-08-14",
    comprobante: "TR-123489",
    parcelaId: 4,
    parcelaNombre: "Parcela D-101",
  },
  {
    id: 103,
    concepto: "Instalación Sistema de Riego Común",
    monto: 85000,
    fechaPago: "2023-07-25",
    comprobante: "TR-122001",
    parcelaId: 1,
    parcelaNombre: "Parcela A-123",
  },
];

// Componente para la página de Pagos
export default function Pagos() {
  // ID del usuario actual (en un caso real, vendría de la autenticación)
  const currentUserId = 1; // Simulando que es Juan Pérez

  // Estados para la página
  const [gastosPendientes, setGastosPendientes] = useState<Gasto[]>([]);
  const [historialPagos, setHistorialPagos] = useState<any[]>([]);
  const [parcelasUsuario, setParcelasUsuario] = useState<
    { id: number; nombre: string }[]
  >([]);
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState<
    number | "todas"
  >(1);
  const [mostrarFormaPago, setMostrarFormaPago] = useState(false);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [gastoAPagar, setGastoAPagar] = useState<Gasto | null>(null);
  const [gastoDetalle, setGastoDetalle] = useState<Gasto | null>(null);
  const [metodoPago, setMetodoPago] = useState("webpay");
  const [totalPendiente, setTotalPendiente] = useState(0);

  // Estados para visor de comprobante
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

    // Inicialmente seleccionar 'todas' o la primera parcela
    setParcelaSeleccionada(
      parcelasDelUsuario.length > 0 ? parcelasDelUsuario[0].id : "todas",
    );

    // Actualizar gastos pendientes según la parcela seleccionada
    actualizarGastosPendientes(
      parcelasDelUsuario.length > 0 ? parcelasDelUsuario[0].id : "todas",
    );

    // Actualizar historial de pagos
    setHistorialPagos(historialPagosMock);
  }, []);

  // Efecto para actualizar gastos cuando cambia la parcela seleccionada
  useEffect(() => {
    actualizarGastosPendientes(parcelaSeleccionada);
  }, [parcelaSeleccionada]);

  // Función para actualizar gastos pendientes según la parcela seleccionada
  const actualizarGastosPendientes = (parcelaId: number | "todas") => {
    let gastosFiltrados;

    if (parcelaId === "todas") {
      // Mostrar gastos de todas las parcelas del usuario
      gastosFiltrados = gastosMock.filter((gasto) =>
        parcelasUsuario.some((p) => p.id === gasto.parcelaId),
      );
    } else {
      // Mostrar gastos de la parcela específica
      gastosFiltrados = gastosMock.filter(
        (gasto) => gasto.parcelaId === parcelaId,
      );
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
    alert(
      `Redirigiendo a WebPay para pagar ${formatearMonto(gastoAPagar?.monto || 0)}`,
    );

    // Simulación de pago exitoso
    setTimeout(() => {
      if (gastoAPagar) {
        // Actualizar estado localmente (simulado)
        const nuevosGastos = gastosPendientes.filter(
          (g) => g.id !== gastoAPagar.id,
        );
        setGastosPendientes(nuevosGastos);

        // Actualizar total pendiente
        const nuevoTotal = nuevosGastos.reduce(
          (sum, gasto) => sum + gasto.monto,
          0,
        );
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

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeaderWrapper}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Gestión de Pagos</h1>

          {/* Selector de parcela si el usuario tiene más de una */}
          {parcelasUsuario.length > 1 && (
            <div
              className={`${styles.parcelaSelector} ${styles.responsiveSelector}`}
            >
              <label htmlFor="parcela" className={styles.filterLabel}>
                Parcela:
              </label>
              <select
                id="parcela"
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
      </div>

      {/* Panel de resumen responsivo */}
      <div className={`${styles.summaryPanel} ${styles.responsiveSummary}`}>
        <div className={`${styles.summaryCard} ${styles.cardWithIcon}`}>
          <div className={styles.summaryIcon}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
            </svg>
          </div>
          <div>
            <h3>Total Pendiente</h3>
            <div className={styles.summaryAmount}>
              {formatearMonto(totalPendiente)}
            </div>
            <p className={styles.summaryDetail}>
              {gastosPendientes.length} gasto(s) por pagar
            </p>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.cardWithIcon}`}>
          <div className={styles.summaryIcon}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div>
            <h3>Estado de Pagos</h3>
            <div className={styles.statusIndicators}>
              <div
                className={`${styles.statusIndicator} ${gastosPendientes.some((g) => g.estado === "Atrasado") ? styles.statusRed : styles.statusGreen}`}
              >
                {gastosPendientes.some((g) => g.estado === "Atrasado")
                  ? "Tienes pagos atrasados"
                  : "Al día"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de gastos pendientes con diseño responsivo */}
      <div className={styles.sectionContainer}>
        <div className={styles.sectionTitle}>
          <h2>Gastos Pendientes</h2>
          {gastosPendientes.length > 0 && (
            <div className={styles.sectionSubtitle}>
              Aquí se muestran todos tus gastos pendientes de pago
            </div>
          )}
        </div>

        {gastosPendientes.length === 0 ? (
          <div className={styles.emptyState}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b7280"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
            <p>¡Genial! No tienes gastos pendientes por pagar.</p>
            <span className={styles.emptyStateSubtext}>Todos tus pagos están al día</span>
          </div>
        ) : (
          <div className={`${styles.cardContainer} ${styles.tableResponsive} ${styles.responsiveTable}`}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Monto</th>
                  <th>Vencimiento</th>
                  <th className={styles.hiddenOnMobile}>Estado</th>
                  <th className={styles.hiddenOnMobile}>Parcela</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {gastosPendientes.map((gasto) => (
                  <tr
                    key={gasto.id}
                    className={`${gasto.estado === "Atrasado" ? styles.rowAlert : ""} ${styles.responsiveRow}`}
                  >
                    <td data-label="Concepto">{gasto.concepto}</td>
                    <td data-label="Monto">{formatearMonto(gasto.monto)}</td>
                    <td data-label="Vencimiento">
                      {formatearFecha(gasto.fechaVencimiento)}
                    </td>
                    <td data-label="Estado" className={styles.hiddenOnMobile}>
                      <span
                        className={`${styles.badgeStatus} ${
                          gasto.estado === "Pendiente"
                            ? styles.statusYellow
                            : gasto.estado === "Atrasado"
                              ? styles.statusRed
                              : styles.statusGreen
                        }`}
                      >
                        {gasto.estado}
                      </span>
                    </td>
                    <td data-label="Parcela" className={styles.hiddenOnMobile}>
                      {gasto.parcelaNombre}
                    </td>
                    <td data-label="Acciones">
                      <div className={styles.actionButtons}>
                        <button
                          className={`${styles.buttonPrimary} ${styles.responsiveButton}`}
                          onClick={() => iniciarPago(gasto)}
                        >
                          Pagar
                        </button>
                        <button
                          className={`${styles.buttonOutline} ${styles.responsiveButton}`}
                          onClick={() => mostrarDetalleGasto(gasto)}
                        >
                          Detalle
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Últimos pagos realizados con diseño responsivo */}
      <div className={styles.sectionContainer}>
        <div className={styles.sectionTitle}>
          <h2>Últimos Pagos Realizados</h2>
          <div className={styles.sectionSubtitle}>
            Historial de tus pagos más recientes
          </div>
        </div>

        <div className={`${styles.cardContainer} ${styles.tableResponsive} ${styles.responsiveTable}`}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Fecha Pago</th>
                <th className={styles.hiddenOnMobile}>Comprobante</th>
                <th className={styles.hiddenOnMobile}>Parcela</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {historialPagos.slice(0, 3).map((pago) => (
                <tr key={pago.id} className={styles.responsiveRow}>
                  <td data-label="Concepto">{pago.concepto}</td>
                  <td data-label="Monto">{formatearMonto(pago.monto)}</td>
                  <td data-label="Fecha Pago">
                    {formatearFecha(pago.fechaPago)}
                  </td>
                  <td data-label="Comprobante" className={styles.hiddenOnMobile}>
                    {pago.comprobante}
                  </td>
                  <td data-label="Parcela" className={styles.hiddenOnMobile}>
                    {pago.parcelaNombre}
                  </td>
                  <td data-label="Acciones">
                    <button
                      className={`${styles.buttonOutline} ${styles.responsiveButton}`}
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
                        className={styles.buttonIcon}
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Ver comprobante
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enlace para ver historial completo */}
      <div className={`${styles.viewAllLink} ${styles.responsiveLink}`}>
        <a href="/dashboard/historial-pagos" className={styles.link}>
          Ver historial completo 
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={styles.linkIcon}
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>

      {/* Modal de comprobante reemplazado por componente reutilizable */}
      {mostrarComprobante && pagoSeleccionado && (
        <ComprobanteModal
          isOpen={mostrarComprobante}
          onClose={cerrarComprobante}
          pago={pagoSeleccionado}
          styles={styles}
        />
      )}

      {/* Modal para forma de pago con Transbank WebPay */}
      {mostrarFormaPago && gastoAPagar && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.responsiveModal}`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Realizar Pago</h2>
              <button
                className={styles.closeButton}
                onClick={cancelarPago}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div
                className={`${styles.paymentSummary} ${styles.responsivePaymentSummary}`}
              >
                <div className={styles.paymentDetail}>
                  <span className={styles.detailLabel}>Concepto:</span>
                  <span className={styles.detailValue}>{gastoAPagar.concepto}</span>
                </div>
                <div className={styles.paymentDetail}>
                  <span className={styles.detailLabel}>Monto:</span> 
                  <span className={styles.detailValue}>{formatearMonto(gastoAPagar.monto)}</span>
                </div>
                <div className={styles.paymentDetail}>
                  <span className={styles.detailLabel}>Parcela:</span>
                  <span className={styles.detailValue}>{gastoAPagar.parcelaNombre}</span>
                </div>
              </div>

              <div
                className={`${styles.webpayContainer} ${styles.responsiveWebpay}`}
              >
                <div className={styles.webpayLogo}>
                  <img
                    src="https://www.transbankdevelopers.cl/public/library/img/logo-tbk-de.png"
                    alt="Transbank WebPay"
                    style={{ maxWidth: "200px", marginBottom: "15px" }}
                  />
                </div>

                <p className={styles.modalText}>
                  El pago se realizará a través de WebPay Plus de Transbank, la
                  plataforma de pagos electrónicos más segura de Chile.
                </p>

                <div className={styles.paymentMethods}>
                  <div
                    className={`${styles.paymentMethodIcons} ${styles.responsivePaymentIcons}`}
                  >
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

                <div className={styles.securityNote}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <p>
                    Al hacer clic en "Pagar con WebPay", serás redirigido a la
                    plataforma de Transbank para completar el pago de forma
                    segura.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`${styles.modalFooter} ${styles.responsiveModalFooter}`}
            >
              <button
                className={`${styles.buttonSecondary} ${styles.responsiveButton}`}
                onClick={cancelarPago}
              >
                Cancelar
              </button>

              <button
                className={`${styles.buttonWebpay} ${styles.responsiveButton}`}
                onClick={pagarConWebPay}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={styles.buttonIcon}
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                Pagar con WebPay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para mostrar detalle de gasto */}
      {mostrarDetalle && gastoDetalle && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.responsiveModal}`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Detalle del Gasto</h2>
              <button
                className={styles.closeButton}
                onClick={cerrarDetalle}
              ></button>
            </div>

            <div className={styles.modalBody}>
              <div
                className={`${styles.detailsContainer} ${styles.responsiveDetails}`}
              >
                <div
                  className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                >
                  <span className={styles.detailLabel}>Concepto:</span>
                  <span className={styles.detailValue}>
                    {gastoDetalle.concepto}
                  </span>
                </div>
                <div
                  className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                >
                  <span className={styles.detailLabel}>Monto:</span>
                  <span className={styles.detailValue}>
                    {formatearMonto(gastoDetalle.monto)}
                  </span>
                </div>
                <div
                  className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                >
                  <span className={styles.detailLabel}>Tipo:</span>
                  <span className={styles.detailValue}>
                    {gastoDetalle.tipo}
                  </span>
                </div>
                <div
                  className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                >
                  <span className={styles.detailLabel}>Fecha Vencimiento:</span>
                  <span className={styles.detailValue}>
                    {formatearFecha(gastoDetalle.fechaVencimiento)}
                  </span>
                </div>
                <div
                  className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                >
                  <span className={styles.detailLabel}>Estado:</span>
                  <span
                    className={`${styles.detailValue} ${
                      gastoDetalle.estado === "Pendiente"
                        ? styles.statusYellow
                        : gastoDetalle.estado === "Atrasado"
                          ? styles.statusRed
                          : styles.statusGreen
                    }`}
                  >
                    {gastoDetalle.estado}
                  </span>
                </div>
                <div
                  className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                >
                  <span className={styles.detailLabel}>Parcela:</span>
                  <span className={styles.detailValue}>
                    {gastoDetalle.parcelaNombre}
                  </span>
                </div>
              </div>

              <div className={styles.detailDescription}>
                <h3 className={styles.modalSubtitle}>Descripción</h3>
                <p className={styles.modalText}>
                  Este cargo corresponde a {gastoDetalle.tipo.toLowerCase()}{" "}
                  establecida por la administración de la comunidad. El pago
                  debe realizarse antes de la fecha de vencimiento para evitar
                  recargos adicionales.
                </p>
              </div>
            </div>

            <div
              className={`${styles.modalFooter} ${styles.responsiveModalFooter}`}
            >
              <button
                className={`${styles.buttonSecondary} ${styles.responsiveButton}`}
                onClick={cerrarDetalle}
              >
                Cerrar
              </button>

              <button
                className={`${styles.buttonPrimary} ${styles.responsiveButton}`}
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
    </div>
  );
}
