import { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format } from 'date-fns';
import { parse } from 'date-fns';
import { startOfWeek } from 'date-fns';
import { getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import styles from './PaginasComunes.module.css';
import { addDays, addHours, addWeeks } from 'date-fns';

// Configuración del locale para español
const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Interfaz para los eventos
interface Evento {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  tipo: 'pago' | 'reunion' | 'aviso';
  descripcion: string;
}

export default function Calendario() {
  const hoy = new Date();
  
  // Estado para almacenar los eventos
  const [eventos, setEventos] = useState<Evento[]>([
    {
      id: 1,
      title: 'Pago Mensual',
      start: addDays(hoy, 3),
      end: addDays(hoy, 3),
      allDay: true,
      tipo: 'pago',
      descripcion: 'Pago de cuota mensual de mantenimiento'
    },
    {
      id: 2,
      title: 'Reunión de Copropietarios',
      start: addWeeks(hoy, 1),
      end: addHours(addWeeks(hoy, 1), 2),
      allDay: false,
      tipo: 'reunion',
      descripcion: 'Reunión para discutir temas de la comunidad'
    },
    {
      id: 3,
      title: 'Aviso: Corte de Agua',
      start: addDays(hoy, 2),
      end: addHours(addDays(hoy, 2), 5),
      allDay: false,
      tipo: 'aviso',
      descripcion: 'Corte de agua programado para mantenimiento'
    }
  ]);

  // Estado para el modal de detalles
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Función para manejar la selección de un evento
  const handleSelectEvent = useCallback((event: Evento) => {
    setEventoSeleccionado(event);
    setMostrarModal(true);
  }, []);

  // Estilos personalizados para los eventos según el tipo
  const eventStyleGetter = useCallback(
    (event: Evento) => {
      let backgroundColor = '';
      let className = '';
      
      switch (event.tipo) {
        case 'pago':
          backgroundColor = '#dc2626'; // Rojo más oscuro para pagos
          className = 'pago-event';
          break;
        case 'reunion':
          backgroundColor = '#2563eb'; // Azul más oscuro para reuniones
          className = 'reunion-event';
          break;
        case 'aviso':
          backgroundColor = '#d97706'; // Ámbar más oscuro para avisos
          className = 'aviso-event';
          break;
        default:
          backgroundColor = '#4b5563'; // Gris más oscuro por defecto
      }

      return {
        style: {
          backgroundColor,
          borderRadius: '4px',
          opacity: 0.95,
          color: 'white',
          border: 'none',
          display: 'block',
          padding: '2px 5px'
        },
        className: className
      };
    },
    []
  );

  // Traducción de textos del calendario
  const messages = useMemo(
    () => ({
      allDay: 'Todo el día',
      previous: '« Anterior',
      next: 'Siguiente »',
      today: 'Hoy',
      month: 'MES',
      week: 'SEMANA',
      day: 'DÍA',
      agenda: 'AGENDA',
      date: 'Fecha',
      time: 'Hora',
      event: 'Evento',
      noEventsInRange: 'No hay eventos en este período',
      showMore: (total: number) => `+ Ver ${total} más`
    }),
    []
  );

  // Función para cerrar el modal
  const cerrarModal = useCallback(() => {
    setMostrarModal(false);
    setEventoSeleccionado(null);
  }, []);

  // Función para formatear la fecha
  const formatDate = (date: Date) => {
    return format(date, 'PPP', { locale: es });
  };

  // Función para formatear la hora
  const formatTime = (date: Date) => {
    return format(date, 'p', { locale: es });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Calendario</h1>
        <div className={styles.pageActions}>
          {/* Se podría añadir un botón para agregar eventos */}
        </div>
      </div>

      <div className={styles.calendarContainer}>
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          messages={messages}
          popup
          selectable
          culture="es"
        />
      </div>

      {/* Modal para mostrar los detalles del evento */}
      {mostrarModal && eventoSeleccionado && (
        <div className={styles.modalOverlay} onClick={cerrarModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{eventoSeleccionado.title}</h2>
              <button
                className={styles.closeButton}
                onClick={cerrarModal}
                aria-label="Cerrar modal"
              ></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailsContainer}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Fecha:</span>
                  <span className={styles.detailValue}>
                    {formatDate(eventoSeleccionado.start)}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Hora:</span>
                  <span className={styles.detailValue}>
                    {eventoSeleccionado.allDay
                      ? 'Todo el día'
                      : `${formatTime(eventoSeleccionado.start)} - 
                         ${formatTime(eventoSeleccionado.end)}`}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Tipo:</span>
                  <span className={styles.detailValue}>
                    {eventoSeleccionado.tipo.charAt(0).toUpperCase() + 
                     eventoSeleccionado.tipo.slice(1)}
                  </span>
                </div>
              </div>
              <div className={styles.detailDescription}>
                <h3 className={styles.modalSubtitle}>Descripción</h3>
                <p>{eventoSeleccionado.descripcion}</p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.buttonSecondary}
                onClick={cerrarModal}
              >
                Cerrar
              </button>
              {/* Aquí podríamos añadir más acciones, como editar o eliminar */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}