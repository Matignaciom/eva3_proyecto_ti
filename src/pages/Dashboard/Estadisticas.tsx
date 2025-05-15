import { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import styles from './Estadisticas.module.css';

// Registrar los componentes de Chart.js que vamos a utilizar
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Datos de ejemplo para los gráficos
const gastosPorMesData = {
  labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
  datasets: [
    {
      label: 'Pagos realizados',
      data: [120000, 125000, 130000, 80000, 120000, 150000],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
    },
    {
      label: 'Gastos generados',
      data: [120000, 120000, 130000, 150000, 120000, 130000],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.5)',
    },
  ],
};

const distribucionGastosData = {
  labels: ['Cuotas Ordinarias', 'Cuotas Extraordinarias', 'Multas', 'Otros'],
  datasets: [
    {
      data: [65, 20, 10, 5],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(239, 68, 68, 0.7)',
        'rgba(245, 158, 11, 0.7)',
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(245, 158, 11, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const comparativaParcelasData = {
  labels: ['Parcela A-123', 'Parcela D-101'],
  datasets: [
    {
      label: 'Pagos Totales (CLP)',
      data: [870000, 780000],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
      ],
    },
  ],
};

const estadosPagoData = {
  labels: ['Al día', 'Pendientes', 'Atrasados'],
  datasets: [
    {
      data: [85, 10, 5],
      backgroundColor: [
        'rgba(16, 185, 129, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(239, 68, 68, 0.7)',
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

// Componente para la página de Estadísticas
export default function Estadisticas() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('6meses');
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState<number | 'todas'>('todas');
  const [parcelasUsuario, setParcelasUsuario] = useState<{id: number, nombre: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para datos dinámicos
  const [datosGastos, setDatosGastos] = useState(gastosPorMesData);
  const [datosTipoGasto, setDatosTipoGasto] = useState(distribucionGastosData);
  const [datosComparativa, setDatosComparativa] = useState(comparativaParcelasData);
  const [datosEstadoPago, setDatosEstadoPago] = useState(estadosPagoData);
  const [activeTarjeta, setActiveTarjeta] = useState<number | null>(null);
  
  // Efecto para cargar datos iniciales
  useEffect(() => {
    // En un caso real, estos datos se obtendrían con una petición al backend
    
    // Simulando una carga de datos
    setTimeout(() => {
      // Filtrar las parcelas del usuario actual
      const parcelasDelUsuario = [
        { id: 1, nombre: 'Parcela A-123' },
        { id: 4, nombre: 'Parcela D-101' }
      ];
      setParcelasUsuario(parcelasDelUsuario);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Efecto para actualizar datos cuando cambia el periodo o la parcela
  useEffect(() => {
    // En un caso real, aquí haríamos una petición al backend con los filtros
    
    // Simulamos datos diferentes según los filtros
    if (periodoSeleccionado === '3meses') {
      setDatosGastos({
        labels: ['Abril', 'Mayo', 'Junio'],
        datasets: [
          {
            label: 'Pagos realizados',
            data: [80000, 120000, 150000],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
          },
          {
            label: 'Gastos generados',
            data: [150000, 120000, 130000],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
          },
        ],
      });
    } else if (periodoSeleccionado === '6meses') {
      setDatosGastos(gastosPorMesData); // Datos originales
    } else if (periodoSeleccionado === '12meses') {
      setDatosGastos({
        labels: ['Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
        datasets: [
          {
            label: 'Pagos realizados',
            data: [110000, 115000, 120000, 120000, 125000, 135000, 120000, 125000, 130000, 80000, 120000, 150000],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
          },
          {
            label: 'Gastos generados',
            data: [110000, 110000, 120000, 120000, 120000, 125000, 120000, 120000, 130000, 150000, 120000, 130000],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
          },
        ],
      });
    }
    
    // También podríamos actualizar otros gráficos según los filtros
    if (parcelaSeleccionada !== 'todas') {
      // Filtrar datos solo para la parcela seleccionada
      if (parcelaSeleccionada === 1) {
        setDatosTipoGasto({
          ...distribucionGastosData,
          datasets: [{
            ...distribucionGastosData.datasets[0],
            data: [70, 15, 8, 7], // Distribución solo para Parcela A-123
          }]
        });
      } else if (parcelaSeleccionada === 4) {
        setDatosTipoGasto({
          ...distribucionGastosData,
          datasets: [{
            ...distribucionGastosData.datasets[0],
            data: [60, 25, 12, 3], // Distribución solo para Parcela D-101
          }]
        });
      }
    } else {
      setDatosTipoGasto(distribucionGastosData); // Datos originales (todas las parcelas)
    }
    
  }, [periodoSeleccionado, parcelaSeleccionada]);
  
  // Calcular dinámicamente el promedio mensual de gastos
  const promedioMensual = useMemo(() => {
    if (datosGastos.datasets && datosGastos.datasets.length > 0) {
      const gastosGenerados = datosGastos.datasets[1].data;
      const sumatorio = gastosGenerados.reduce((sum, valor) => sum + valor, 0);
      return Math.round(sumatorio / gastosGenerados.length);
    }
    return 125000; // Valor por defecto si no hay datos
  }, [datosGastos]);
  
  // Calcular si hay tendencia al alza, baja o es estable
  const tendenciaGastos = useMemo(() => {
    if (datosGastos.datasets && datosGastos.datasets.length > 0) {
      const gastosGenerados = datosGastos.datasets[1].data;
      if (gastosGenerados.length < 2) return { tipo: 'estable', porcentaje: 0 };
      
      // Comparar los últimos dos meses
      const ultimoMes = gastosGenerados[gastosGenerados.length - 1];
      const penultimoMes = gastosGenerados[gastosGenerados.length - 2];
      
      if (ultimoMes === penultimoMes) return { tipo: 'estable', porcentaje: 0 };
      
      const diferenciaPorcentual = ((ultimoMes - penultimoMes) / penultimoMes) * 100;
      
      if (diferenciaPorcentual > 5) {
        return { tipo: 'alza', porcentaje: Math.abs(Math.round(diferenciaPorcentual)) };
      } else if (diferenciaPorcentual < -5) {
        return { tipo: 'baja', porcentaje: Math.abs(Math.round(diferenciaPorcentual)) };
      } else {
        return { tipo: 'estable', porcentaje: Math.abs(Math.round(diferenciaPorcentual)) };
      }
    }
    return { tipo: 'estable', porcentaje: 0 };
  }, [datosGastos]);
  
  // Calcular el fondo de reserva recomendado
  const fondoReservaRecomendado = useMemo(() => {
    // Recomendamos tener un fondo de reserva equivalente a 3 meses de gastos promedio
    return promedioMensual * 2.5;
  }, [promedioMensual]);
  
  // Calcular el porcentaje de gastos extraordinarios
  const porcentajeExtraordinarios = useMemo(() => {
    if (datosTipoGasto.datasets && datosTipoGasto.datasets.length > 0) {
      const distribucion = datosTipoGasto.datasets[0].data;
      if (distribucion.length >= 2) {
        // Asumiendo que el segundo elemento es 'Cuotas Extraordinarias'
        return distribucion[1];
      }
    }
    return 20; // Valor por defecto
  }, [datosTipoGasto]);
  
  // Calcular el balance entre pagos y gastos
  const balancePagosGastos = useMemo(() => {
    if (datosGastos.datasets && datosGastos.datasets.length >= 2) {
      const totalPagos = datosGastos.datasets[0].data.reduce((sum, valor) => sum + valor, 0);
      const totalGastos = datosGastos.datasets[1].data.reduce((sum, valor) => sum + valor, 0);
      
      const diferencia = totalPagos - totalGastos;
      return {
        estado: diferencia >= 0 ? 'positivo' : 'negativo',
        diferencia: Math.abs(diferencia),
        porcentaje: Math.round((Math.abs(diferencia) / totalGastos) * 100)
      };
    }
    return { estado: 'positivo', diferencia: 0, porcentaje: 0 };
  }, [datosGastos]);
  
  // Opciones para el gráfico de líneas/barras
  const opcionesGraficoLineas = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Evolución de Gastos y Pagos',
      },
    },
  };
  
  // Opciones para los gráficos circulares
  const opcionesGraficoCircular = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };
  
  // Opciones para el gráfico de barras
  const opcionesGraficoBarras = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Comparativa por Parcela',
      },
    },
  };
  
  // Función para formatear valores en pesos chilenos
  const formatearMonto = (valor: number) => {
    return valor.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  };

  // Función para animar tarjetas al hacer hover
  const handleTarjetaHover = (index: number) => {
    setActiveTarjeta(index);
  };

  const handleTarjetaLeave = () => {
    setActiveTarjeta(null);
  };
  
  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando tus estadísticas personalizadas...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <span className={styles.iconResumen}>📊</span> 
          Resumen Financiero
        </h1>
        
        {/* Filtros */}
        <div className={styles.filtersContainer}>
          <div className={styles.filterContainer}>
            <label htmlFor="periodo" className={styles.filterLabel}>
              <span className={styles.iconFilter}>🗓️</span> Período:
            </label>
            <select 
              id="periodo" 
              className={styles.filterSelect}
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
            >
              <option value="3meses">Últimos 3 meses</option>
              <option value="6meses">Últimos 6 meses</option>
              <option value="12meses">Último año</option>
            </select>
          </div>
          
          {parcelasUsuario.length > 1 && (
            <div className={styles.filterContainer}>
              <label htmlFor="parcela" className={styles.filterLabel}>
                <span className={styles.iconFilter}>🏡</span> Parcela:
              </label>
              <select 
                id="parcela" 
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
          )}
        </div>
      </div>
      
      {/* Panel de resumen */}
      <div className={styles.summaryPanel}>
        <div 
          className={`${styles.summaryCard} ${activeTarjeta === 0 ? styles.activeCard : ''}`} 
          onMouseEnter={() => handleTarjetaHover(0)}
          onMouseLeave={handleTarjetaLeave}
        >
          <div className={styles.summaryIcon}>💰</div>
          <h3>Total Pagado</h3>
          <div className={styles.summaryAmount}>
            {formatearMonto(datosGastos.datasets[0].data.reduce((sum, valor) => sum + valor, 0))}
          </div>
          <p className={styles.summaryDetail}>
            {periodoSeleccionado === '3meses' ? 'Últimos 3 meses' : 
             periodoSeleccionado === '6meses' ? 'Últimos 6 meses' : 'Último año'}
          </p>
        </div>
        
        <div 
          className={`${styles.summaryCard} ${activeTarjeta === 1 ? styles.activeCard : ''}`}
          onMouseEnter={() => handleTarjetaHover(1)}
          onMouseLeave={handleTarjetaLeave}
        >
          <div className={styles.summaryIcon}>📝</div>
          <h3>Total Generado</h3>
          <div className={styles.summaryAmount}>
            {formatearMonto(datosGastos.datasets[1].data.reduce((sum, valor) => sum + valor, 0))}
          </div>
          <p className={styles.summaryDetail}>
            {datosGastos.labels.length} periodos
          </p>
        </div>
        
        <div 
          className={`${styles.summaryCard} ${activeTarjeta === 2 ? styles.activeCard : ''}`}
          onMouseEnter={() => handleTarjetaHover(2)}
          onMouseLeave={handleTarjetaLeave}
        >
          <div className={styles.summaryIcon}>
            {balancePagosGastos.estado === 'positivo' ? '✅' : '⚠️'}
          </div>
          <h3>Balance</h3>
          <div className={`${styles.statusIndicator} ${balancePagosGastos.estado === 'positivo' ? styles.statusGreen : styles.statusRed}`}>
            {balancePagosGastos.estado === 'positivo' ? 'Superávit' : 'Déficit'} {balancePagosGastos.porcentaje}%
          </div>
          <p className={styles.summaryDetail}>
            {formatearMonto(balancePagosGastos.diferencia)}
          </p>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className={styles.chartsGrid}>
        {/* Gráfico de evolución de gastos */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <span className={styles.chartIcon}>📈</span> Evolución de Gastos y Pagos
          </h3>
          <div className={styles.chartContainer}>
            <Line 
              options={opcionesGraficoLineas} 
              data={datosGastos} 
            />
          </div>
        </div>
        
        {/* Gráfico de distribución por tipo */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <span className={styles.chartIcon}>🍩</span> Distribución por Tipo de Gasto
          </h3>
          <div className={styles.chartContainer}>
            <Doughnut 
              options={opcionesGraficoCircular} 
              data={datosTipoGasto} 
            />
          </div>
        </div>
        
        {/* Gráfico comparativo por parcela */}
        {parcelasUsuario.length > 1 && parcelaSeleccionada === 'todas' && (
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              <span className={styles.chartIcon}>🏘️</span> Comparativa por Parcela
            </h3>
            <div className={styles.chartContainer}>
              <Bar 
                options={opcionesGraficoBarras} 
                data={datosComparativa} 
              />
            </div>
          </div>
        )}
        
        {/* Gráfico de estado de pagos */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            <span className={styles.chartIcon}>🔄</span> Estado de Pagos
          </h3>
          <div className={styles.chartContainer}>
            <Pie 
              options={opcionesGraficoCircular} 
              data={datosEstadoPago} 
            />
          </div>
        </div>
      </div>
      
      {/* Sección de análisis */}
      <div className={styles.analysisSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.iconAnalisis}>🔍</span> Análisis Personalizado
        </h2>
        
        <div className={styles.analysisPanels}>
          <div className={styles.analysisCard}>
            <h3 className={styles.cardTitle}>
              <span className={styles.iconCard}>📊</span> Tu Resumen
            </h3>
            <p className={styles.analysisText}>
              Durante el período seleccionado, tu gasto promedio mensual ha sido de <strong>{formatearMonto(promedioMensual)}</strong>. 
              Se observa una tendencia 
              {tendenciaGastos.tipo === 'estable' ? (
                <span className={styles.positiveChange}> estable</span>
              ) : tendenciaGastos.tipo === 'alza' ? (
                <span className={styles.negativeChange}> al alza ({tendenciaGastos.porcentaje}%)</span>
              ) : (
                <span className={styles.positiveChange}> a la baja ({tendenciaGastos.porcentaje}%)</span>
              )} en tus gastos.
            </p>
            {balancePagosGastos.estado === 'positivo' && balancePagosGastos.diferencia > 0 && (
              <p className={styles.analysisText}>
                Tu balance muestra un <span className={styles.positiveChange}>superávit del {balancePagosGastos.porcentaje}%</span>, ¡lo que indica una excelente gestión de tus finanzas!
              </p>
            )}
            {balancePagosGastos.estado === 'negativo' && balancePagosGastos.diferencia > 0 && (
              <p className={styles.analysisText}>
                Tu balance muestra un <span className={styles.negativeChange}>déficit del {balancePagosGastos.porcentaje}%</span>. Te sugerimos revisar tus pagos pendientes.
              </p>
            )}
          </div>
          
          <div className={styles.analysisCard}>
            <h3 className={styles.cardTitle}>
              <span className={styles.iconCard}>💡</span> Recomendaciones para ti
            </h3>
            <ul className={styles.recommendationList}>
              <li className={styles.recommendationItem}>
                <span className={styles.recommendationIcon}>💰</span>
                Mantén un fondo de reserva de al menos <strong>{formatearMonto(fondoReservaRecomendado)}</strong> para gastos imprevistos.
              </li>
              <li className={styles.recommendationItem}>
                <span className={styles.recommendationIcon}>📊</span>
                Los gastos extraordinarios representan un <strong>{porcentajeExtraordinarios}%</strong> del total, {porcentajeExtraordinarios > 25 ? 'lo cual está por encima del rango recomendado.' : 'lo cual está dentro del rango esperado.'}
              </li>
              {tendenciaGastos.tipo === 'alza' && tendenciaGastos.porcentaje > 10 && (
                <li className={styles.recommendationItem}>
                  <span className={styles.recommendationIcon}>📈</span>
                  Se observa un <strong>aumento significativo</strong> en tus gastos recientes. Recomendamos analizar las causas de este incremento.
                </li>
              )}
              {balancePagosGastos.estado === 'negativo' && balancePagosGastos.porcentaje > 15 && (
                <li className={styles.recommendationItem}>
                  <span className={styles.recommendationIcon}>⏰</span>
                  Considera programar tus pagos pendientes para evitar recargos por mora.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Descarga de informes */}
      <div className={styles.downloadOptions}>
        <button 
          className={styles.buttonPrimary}
          onClick={() => alert('Descargando informe en PDF...')}
        >
          <span className={styles.buttonIcon}>📑</span> Descargar PDF
        </button>
        <button 
          className={styles.buttonOutline}
          onClick={() => alert('Exportando datos a Excel...')}
        >
          <span className={styles.buttonIcon}>📊</span> Exportar a Excel
        </button>
      </div>
    </div>
  );
} 