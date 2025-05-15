import { useState, useCallback, useMemo, useLayoutEffect, useEffect } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays, addHours, addWeeks } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import styles from "./Calendario.module.css";

// Interfaz para los eventos
interface Evento {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  tipo: "pago" | "reunion" | "aviso";
  descripcion: string;
}

interface ToolbarProps {
  views: View[];
  view: View;
  onView: (view: View) => void;
  onNavigate: (action: string) => void;
  label: string;
}

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const messages = {
  allDay: "Todo el día",
  previous: "Anterior",
  next: "Siguiente",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "No hay eventos en este rango",
  showMore: (total: number) => `+ Ver más (${total})`,
};

export default function Calendario() {
  const hoy = new Date();

  // Estado para almacenar los eventos
  const [eventos, setEventos] = useState<Evento[]>([
    {
      id: 1,
      title: "Pago Mensual",
      start: addDays(hoy, 3),
      end: addDays(hoy, 3),
      allDay: true,
      tipo: "pago",
      descripcion:
        "Pago de cuota mensual de mantenimiento. Es importante realizar este pago a tiempo para mantener los servicios comunitarios funcionando correctamente.",
    },
    {
      id: 2,
      title: "Reunión de Copropietarios",
      start: addWeeks(hoy, 1),
      end: addHours(addWeeks(hoy, 1), 2),
      allDay: false,
      tipo: "reunion",
      descripcion:
        "Reunión para discutir temas importantes de la comunidad incluyendo los próximos proyectos y mejoras. Su asistencia es fundamental para la toma de decisiones.",
    },
    {
      id: 3,
      title: "Aviso: Corte de Agua",
      start: addDays(hoy, 2),
      end: addHours(addDays(hoy, 2), 5),
      allDay: false,
      tipo: "aviso",
      descripcion:
        "Corte de agua programado para mantenimiento de las tuberías principales. Se recomienda almacenar agua para uso durante este período.",
    },
    {
      id: 4,
      title: "Fecha Límite de Pago",
      start: addDays(hoy, 7),
      end: addDays(hoy, 7),
      allDay: true,
      tipo: "pago",
      descripcion:
        "Último día para realizar el pago sin recargo. Después de esta fecha se aplicará un interés del 5%.",
    },
    {
      id: 5,
      title: "Mantenimiento Áreas Verdes",
      start: addDays(hoy, 5),
      end: addDays(hoy, 5),
      allDay: true,
      tipo: "aviso",
      descripcion:
        "Trabajos de mantenimiento en las áreas verdes comunes. Se recomienda no utilizar estas áreas durante el día.",
    },
  ]);

  // Estado para el modal de detalles
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(
    null,
  );
  const [mostrarModal, setMostrarModal] = useState(false);

  // Función para manejar la selección de un evento
  const handleSelectEvent = useCallback((event: Evento) => {
    setEventoSeleccionado(event);
    setMostrarModal(true);
  }, []);

  // Estilos personalizados para los eventos según el tipo
  const eventStyleGetter = useCallback((event: Evento) => {
    let backgroundColor = "";
    let className = "";

    switch (event.tipo) {
      case "pago":
        backgroundColor = "#dc2626"; // Rojo más oscuro para pagos
        className = "pago-event";
        break;
      case "reunion":
        backgroundColor = "#2563eb"; // Azul más oscuro para reuniones
        className = "reunion-event";
        break;
      case "aviso":
        backgroundColor = "#d97706"; // Ámbar más oscuro para avisos
        className = "aviso-event";
        break;
      default:
        backgroundColor = "#4b5563"; // Gris más oscuro por defecto
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.95,
        color: "white",
        border: "none",
        display: "block",
        padding: "2px 5px",
        fontWeight: "bold",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      },
      className: className,
    };
  }, []);

  // Función para cerrar el modal
  const cerrarModal = useCallback(() => {
    setMostrarModal(false);
    setEventoSeleccionado(null);
  }, []);

  // Función para formatear la fecha
  const formatDate = (date: Date) => {
    return format(date, "PPP", { locale: es });
  };

  // Función para formatear la hora
  const formatTime = (date: Date) => {
    return format(date, "p", { locale: es });
  };

  // Función para determinar el ícono según el tipo de evento
  const getEventIcon = (tipo: string) => {
    switch (tipo) {
      case "pago":
        return (
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
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        );
      case "reunion":
        return (
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
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        );
      case "aviso":
        return (
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
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      default:
        return null;
    }
  };

  const getEventTypeText = (tipo: string) => {
    switch (tipo) {
      case "pago":
        return "Pago";
      case "reunion":
        return "Reunión";
      case "aviso":
        return "Aviso";
      default:
        return "Evento";
    }
  };

  const getEventTypeColor = (tipo: string) => {
    switch (tipo) {
      case "pago":
        return "#dc2626";
      case "reunion":
        return "#2563eb";
      case "aviso":
        return "#d97706";
      default:
        return "#4b5563";
    }
  };

  // Mejora: Usar useLayoutEffect para ajustar el tamaño del calendario
  const [calendarHeight, setCalendarHeight] = useState(600);
  
  useEffect(() => {
    const handleResize = () => {
      // Ajustar altura basada en ancho de pantalla
      if (window.innerWidth <= 576) {
        setCalendarHeight(500);
      } else if (window.innerWidth <= 768) {
        setCalendarHeight(550);
      } else if (window.innerWidth <= 1024) {
        setCalendarHeight(600);
      } else {
        setCalendarHeight(650);
      }
    };
    
    // Ejecutar al montar
    handleResize();
    
    // Agregar listener de resize
    window.addEventListener('resize', handleResize);
    
    // Limpiar listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Calendario de Eventos</h1>
        <div className={styles.pageActions}>
          <div className={styles.filterContainer}>
            <span className={styles.filterLabel}>Leyenda:</span>
            <div className={styles.legendContainer}>
              <div className={styles.legendItem}>
                <span 
                  className={styles.legendDot} 
                  style={{ backgroundColor: "#dc2626" }}
                ></span>
                <span className={styles.legendText}>Pagos</span>
              </div>
              <div className={styles.legendItem}>
                <span 
                  className={styles.legendDot} 
                  style={{ backgroundColor: "#2563eb" }}
                ></span>
                <span className={styles.legendText}>Reuniones</span>
              </div>
              <div className={styles.legendItem}>
                <span 
                  className={styles.legendDot} 
                  style={{ backgroundColor: "#d97706" }}
                ></span>
                <span className={styles.legendText}>Avisos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.calendarContainer}>
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          style={{ height: calendarHeight }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          messages={messages}
          popup
          selectable
          culture="es"
          className="responsive-calendar"
          views={window.innerWidth < 768 ? {month: true, agenda: true} : undefined}
          defaultView={window.innerWidth < 768 ? 'month' : undefined}
          components={{
            toolbar: (props: any) => (
              <div className="rbc-toolbar">
                <span className="rbc-btn-group">
                  <button type="button" onClick={() => props.onNavigate('TODAY')}>
                    {messages.today}
                  </button>
                  <button type="button" onClick={() => props.onNavigate('PREV')}>
                    {messages.previous}
                  </button>
                  <button type="button" onClick={() => props.onNavigate('NEXT')}>
                    {messages.next}
                  </button>
                </span>
                <span className="rbc-toolbar-label">{props.label}</span>
                <span className="rbc-btn-group">
                  {Object.keys(props.views)
                    .filter((name) => props.views[name])
                    .map((name) => {
                      const label = messages[name as keyof typeof messages];
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => props.onView(name)}
                          className={props.view === name ? 'rbc-active' : ''}
                        >
                          {typeof label === 'string' ? label : name}
                        </button>
                      );
                    })}
                </span>
              </div>
            )
          }}
        />
      </div>

      {/* Modal para mostrar los detalles del evento */}
      {mostrarModal && eventoSeleccionado && (
        <div className={styles.modalOverlay} onClick={cerrarModal}>
          <div
            className={`${styles.modal} ${styles.responsiveModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{eventoSeleccionado.title}</h2>
              <button
                className={styles.closeButton}
                onClick={cerrarModal}
                aria-label="Cerrar modal"
              >
                <svg
                  width="20"
                  height="20"
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "15px",
                  background: `rgba(${getEventTypeColor(eventoSeleccionado.tipo)
                    .replace("#", "")
                    .match(/.{2}/g)
                    ?.map((hex) => parseInt(hex, 16))
                    .join(",")}, 0.1)`,
                  padding: "10px",
                  borderRadius: "6px",
                }}
              >
                <div
                  style={{
                    color: "white",
                    backgroundColor: getEventTypeColor(eventoSeleccionado.tipo),
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "12px",
                    flexShrink: 0,
                  }}
                >
                  {getEventIcon(eventoSeleccionado.tipo)}
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    Tipo de evento
                  </div>
                  <div
                    style={{
                      fontWeight: "600",
                      color: getEventTypeColor(eventoSeleccionado.tipo),
                    }}
                  >
                    {getEventTypeText(eventoSeleccionado.tipo)}
                  </div>
                </div>
              </div>
              <div
                className={`${styles.detailsContainer} ${styles.responsiveDetails}`}
              >
                <div
                  className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                >
                  <span className={styles.detailLabel}>Fecha:</span>
                  <span className={styles.detailValue}>
                    {formatDate(eventoSeleccionado.start)}
                  </span>
                </div>
                <div
                  className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                >
                  <span className={styles.detailLabel}>Hora:</span>
                  <span className={styles.detailValue}>
                    {eventoSeleccionado.allDay
                      ? "Todo el día"
                      : `${formatTime(eventoSeleccionado.start)} - 
                         ${formatTime(eventoSeleccionado.end)}`}
                  </span>
                </div>
              </div>
              <div className={styles.detailDescription}>
                <h3 className={styles.modalSubtitle}>Descripción</h3>
                <p>{eventoSeleccionado.descripcion}</p>
              </div>
            </div>
            <div
              className={`${styles.modalFooter} ${styles.responsiveModalFooter}`}
            >
              <button
                className={`${styles.buttonSecondary} ${styles.responsiveButton}`}
                onClick={cerrarModal}
              >
                Cerrar
              </button>
              {eventoSeleccionado.tipo === "pago" && (
                <button
                  className={`${styles.primaryButton} ${styles.responsiveButton}`}
                  onClick={() => {
                    cerrarModal();
                    // Aquí podría ir la navegación a la página de pagos
                    // por ejemplo: navigate('/dashboard/pagos');
                  }}
                >
                  Ir a Pagos
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
