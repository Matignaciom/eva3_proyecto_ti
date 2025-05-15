import { useState } from "react";

interface ComprobanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  pago: {
    id: number;
    concepto: string;
    monto: number;
    fechaPago: string;
    comprobante: string;
    parcelaNombre: string;
    tipo?: string;
  };
  styles: any; // Pasamos los estilos desde el componente padre
}

export default function ComprobanteModal({
  isOpen,
  onClose,
  pago,
  styles,
}: ComprobanteModalProps) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Funciones para manipular el zoom
  const zoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel((prevZoom) => prevZoom + 20);
    }
  };

  const zoomOut = () => {
    if (zoomLevel > 60) {
      setZoomLevel((prevZoom) => prevZoom - 20);
    }
  };

  // Función para cambiar a modo pantalla completa
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Función para cerrar el modal
  const cerrarComprobante = () => {
    onClose();
    setIsFullscreen(false);
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

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.modalOverlay} ${isFullscreen ? styles.fullscreenModal : ""}`}
    >
      <div
        className={`${styles.modal} ${styles.responsiveModal} ${
          isFullscreen ? styles.fullscreenContent : ""
        }`}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Comprobante de Pago</h2>
          <div className={styles.modalControls}>
            <button
              className={styles.controlButton}
              onClick={zoomOut}
              title="Reducir"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#333333" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
            <span className={styles.zoomText}>{zoomLevel}%</span>
            <button
              className={styles.controlButton}
              onClick={zoomIn}
              title="Ampliar"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#333333" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
            <button
              className={styles.controlButton}
              onClick={toggleFullscreen}
              title={
                isFullscreen
                  ? "Salir de pantalla completa"
                  : "Pantalla completa"
              }
            >
              {isFullscreen ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#333333" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#333333" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="14 4 20 4 20 10" />
                  <polyline points="4 14 4 20 10 20" />
                  <line x1="14" y1="10" x2="20" y2="4" />
                  <line x1="4" y1="20" x2="10" y2="14" />
                </svg>
              )}
            </button>
            <button
              className={styles.closeButton}
              onClick={cerrarComprobante}
              aria-label="Cerrar modal"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#333333" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.documentViewport}>
            <div
              className={styles.documentScroller}
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              <div
                className={`${styles.comprobanteContainer} ${styles.responsiveComprobante}`}
              >
                {/* Encabezado del documento */}
                <div className={styles.documentHeader}>
                  <img
                    src="https://www.transbankdevelopers.cl/public/library/img/logo-tbk-de.png"
                    alt="Transbank WebPay"
                    className={styles.documentLogo}
                  />
                  <div className={styles.documentTitle}>
                    <h2>Comprobante de Pago</h2>
                    <p className={styles.documentSmall}>
                      Documento electrónico - No válido como boleta
                    </p>
                  </div>
                </div>

                {/* Información del comprobante */}
                <div className={styles.comprobanteHeader}>
                  <div className={styles.comprobanteCompany}>
                    <h3 className={styles.modalSubtitle}>
                      Comunidad SIGEPA
                    </h3>
                    <p className={styles.modalText}>RUT: 12.345.678-9</p>
                    <p className={styles.modalText}>
                      Dirección: Av. Principal 123, Santiago
                    </p>
                  </div>
                  <div className={styles.comprobanteNumber}>
                    <h3 className={styles.modalSubtitle}>Comprobante</h3>
                    <p className={styles.modalText}>
                      # {pago.comprobante}
                    </p>
                    <p className={styles.modalText}>
                      Fecha: {formatearFecha(pago.fechaPago)}
                    </p>
                  </div>
                </div>

                <div className={styles.documentSection}>
                  <h4 className={styles.sectionTitle}>Datos del Pago</h4>
                  <div className={styles.comprobanteMeta}>
                    <div
                      className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                    >
                      <span className={styles.detailLabel}>
                        Fecha de Pago:
                      </span>
                      <span className={styles.detailValue}>
                        {formatearFecha(pago.fechaPago)}
                      </span>
                    </div>
                    <div
                      className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                    >
                      <span className={styles.detailLabel}>
                        Método de Pago:
                      </span>
                      <span className={styles.detailValue}>
                        <img
                          src="https://www.transbankdevelopers.cl/public/library/img/logo-tbk-de.png"
                          alt="Transbank WebPay"
                          style={{
                            height: "20px",
                            marginRight: "5px",
                            verticalAlign: "middle",
                          }}
                        />
                        WebPay
                      </span>
                    </div>
                    <div
                      className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                    >
                      <span className={styles.detailLabel}>
                        Propietario:
                      </span>
                      <span className={styles.detailValue}>Juan Pérez</span>
                    </div>
                    <div
                      className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                    >
                      <span className={styles.detailLabel}>Parcela:</span>
                      <span className={styles.detailValue}>
                        {pago.parcelaNombre}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.documentSection}>
                  <h4 className={styles.sectionTitle}>Detalle del Pago</h4>
                  <div className={styles.responsiveTableWrapper}>
                    <table
                      className={`${styles.comprobanteTable} ${styles.responsiveComprobanteTable}`}
                    >
                      <thead>
                        <tr>
                          <th className={styles.modalText}>Concepto</th>
                          <th className={styles.modalText}>Tipo</th>
                          <th className={styles.modalText}>Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td
                            className={styles.modalText}
                            data-label="Concepto"
                          >
                            {pago.concepto}
                          </td>
                          <td
                            className={styles.modalText}
                            data-label="Tipo"
                          >
                            <span className={`${styles.badgeStatus} ${
                              pago.tipo === "Cuota Ordinaria" 
                                ? styles.statusGreen 
                                : pago.tipo === "Cuota Extraordinaria" 
                                  ? styles.statusYellow 
                                  : styles.statusRed
                            }`}>
                              {pago.tipo || "Cuota Ordinaria"}
                            </span>
                          </td>
                          <td
                            className={styles.modalText}
                            data-label="Monto"
                          >
                            {formatearMonto(pago.monto)}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={2} className={styles.modalText}>
                            <strong>Total</strong>
                          </td>
                          <td className={styles.modalText}>
                            <strong>
                              {formatearMonto(pago.monto)}
                            </strong>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className={styles.documentFooter}>
                  <div className={styles.qrCode}>
                    <div className={styles.qrPlaceholder}>QR</div>
                    <p className={styles.documentSmall}>
                      Código de verificación
                    </p>
                  </div>

                  <div className={styles.comprobanteFoot}>
                    <p className={styles.documentSmall}>
                      Este comprobante es un documento válido para acreditar
                      el pago realizado.
                    </p>
                    <p className={styles.documentSmall}>
                      Transacción procesada por Transbank.
                    </p>
                    <p className={styles.documentSmall}>
                      Para cualquier consulta, contactar a
                      administracion@sigepa.cl
                    </p>
                  </div>

                  <div className={styles.stampContainer}>
                    <div className={styles.stampBox}>
                      <p className={styles.stampText}>
                        Transacción Aprobada
                      </p>
                      <p className={styles.stampDate}>
                        {formatearFecha(pago.fechaPago)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`${styles.modalFooter} ${styles.responsiveModalFooter}`}
        >
          <button
            className={`${styles.buttonSecondary} ${styles.responsiveButton}`}
            onClick={cerrarComprobante}
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Cerrar
          </button>

          <button
            className={`${styles.buttonPrimary} ${styles.responsiveButton}`}
            onClick={() =>
              alert(
                `Descargando comprobante ${pago.comprobante} en PDF...`,
              )
            }
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
} 