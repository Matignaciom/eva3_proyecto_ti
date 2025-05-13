import { useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import ApiKeyMissing from './ApiKeyMissing';
import styles from './MapaGeoespacial.module.css';

// Centro predeterminado para el mapa (ejemplo: Santiago, Chile)
const defaultCenter = {
  lat: -33.4489,
  lng: -70.6693
};

// Opciones del mapa
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
};

// Datos de ejemplo más completos para las parcelas
const parcelasMock = [
  { 
    id: 1, 
    position: { lat: -33.4400, lng: -70.6600 }, 
    title: 'Parcela A-123', 
    estado: 'Al día',
    propietario: 'Juan Pérez',
    propietarioId: 1,
    superficie: '5000 m²',
    direccion: 'Camino Los Pinos 567'
  },
  { 
    id: 2, 
    position: { lat: -33.4450, lng: -70.6650 }, 
    title: 'Parcela B-456', 
    estado: 'Pendiente',
    propietario: 'María González',
    propietarioId: 2,
    superficie: '4200 m²',
    direccion: 'Camino Las Flores 123'
  },
  { 
    id: 3, 
    position: { lat: -33.4550, lng: -70.6700 }, 
    title: 'Parcela C-789', 
    estado: 'Atrasado',
    propietario: 'Pedro Sánchez',
    propietarioId: 3,
    superficie: '3800 m²',
    direccion: 'Camino El Bosque 456'
  },
  { 
    id: 4, 
    position: { lat: -33.4480, lng: -70.6720 }, 
    title: 'Parcela D-101', 
    estado: 'Al día',
    propietario: 'Juan Pérez',
    propietarioId: 1,
    superficie: '3200 m²',
    direccion: 'Camino El Roble 789'
  },
  { 
    id: 5, 
    position: { lat: -33.4520, lng: -70.6550 }, 
    title: 'Parcela E-202', 
    estado: 'Pendiente',
    propietario: 'Ana Martínez',
    propietarioId: 4,
    superficie: '4800 m²',
    direccion: 'Camino Los Cipreses 234'
  }
];

interface MapaGeoespacialProps {
  // Propiedad para mostrar solo parcelas específicas
  parcelaId?: number;           // Filtrar por ID de parcela específica
  propietarioId?: number;       // Filtrar por propietario específico
  filtroEstado?: string;        // Filtrar por estado (Al día, Pendiente, Atrasado)
  mostrarTodas?: boolean;       // Mostrar todas las parcelas (para administrador)
  // Altura personalizable del mapa
  height?: string;
  // Callback para cuando se selecciona una parcela
  onSelectParcela?: (parcela: any) => void;
}

export default function MapaGeoespacial({ 
  parcelaId, 
  propietarioId, 
  filtroEstado,
  mostrarTodas = false,
  height = '500px',
  onSelectParcela
}: MapaGeoespacialProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedParcela, setSelectedParcela] = useState<any | null>(null);
  const [filteredParcelas, setFilteredParcelas] = useState<any[]>([]);
  const [apiKeyError, setApiKeyError] = useState<boolean>(false);
  
  // Efecto para filtrar parcelas según los criterios proporcionados
  useEffect(() => {
    let result = [...parcelasMock];
    
    // Si no se debe mostrar todas, aplicar filtros
    if (!mostrarTodas) {
      // Filtrar por ID de parcela específica (mayor prioridad)
      if (parcelaId !== undefined) {
        result = result.filter(parcela => parcela.id === parcelaId);
      } 
      // Filtrar por propietario
      else if (propietarioId !== undefined) {
        result = result.filter(parcela => parcela.propietarioId === propietarioId);
      }
    }
    
    // Filtrar por estado (si se especifica)
    if (filtroEstado && filtroEstado !== 'todos') {
      let estadoFiltro = '';
      switch(filtroEstado) {
        case 'alDia':
          estadoFiltro = 'Al día';
          break;
        case 'pendiente':
          estadoFiltro = 'Pendiente';
          break;
        case 'atrasado':
          estadoFiltro = 'Atrasado';
          break;
      }
      
      if (estadoFiltro) {
        result = result.filter(parcela => parcela.estado === estadoFiltro);
      }
    }
    
    setFilteredParcelas(result);
  }, [parcelaId, propietarioId, filtroEstado, mostrarTodas]);

  // Cargar la API de Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '', // Usar variable de entorno si está disponible
  });

  // Verificar si hay un error de clave de API
  useEffect(() => {
    if (loadError) {
      console.error("Error cargando Google Maps API:", loadError);
      setApiKeyError(true);
    }
  }, [loadError]);

  // Guardar referencia al mapa cuando se carga
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // Limpiar referencia al mapa cuando se desmonta
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Función para ajustar el mapa a los límites de las parcelas mostradas
  const fitMapToParcelas = useCallback(() => {
    if (map && filteredParcelas.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      filteredParcelas.forEach(parcela => {
        bounds.extend(parcela.position);
      });
      map.fitBounds(bounds);
      
      // Si solo hay una parcela, ajustar el zoom adecuadamente
      if (filteredParcelas.length === 1) {
        // Dar un poco de espacio alrededor del marcador
        map.setZoom(15);
      }
    }
  }, [map, filteredParcelas]);

  // Ajustar mapa cuando cambian las parcelas filtradas
  useEffect(() => {
    if (isLoaded && filteredParcelas.length > 0) {
      // Dar tiempo para que el mapa se cargue completamente
      const timer = setTimeout(() => {
        fitMapToParcelas();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, filteredParcelas, fitMapToParcelas]);

  // Manejar clic en un marcador
  const handleMarkerClick = (parcela: any) => {
    setSelectedParcela(parcela);
    if (onSelectParcela) {
      onSelectParcela(parcela);
    }
  };

  // Si hay un error de clave de API, mostrar instrucciones
  if (apiKeyError) {
    return <ApiKeyMissing />;
  }

  // Renderizar un mensaje de carga mientras la API se está cargando
  if (!isLoaded) {
    return <div className={styles.loading}>Cargando mapa...</div>;
  }

  // Mostrar mensaje si no hay parcelas para mostrar
  if (filteredParcelas.length === 0) {
    return (
      <div className={styles.noParcelas}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <p>No hay parcelas que coincidan con los criterios seleccionados.</p>
      </div>
    );
  }

  return (
    <div className={styles.mapContainer} style={{ height }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={defaultCenter}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* Marcadores para cada parcela */}
        {filteredParcelas.map(parcela => (
          <Marker
            key={parcela.id}
            position={parcela.position}
            title={parcela.title}
            onClick={() => handleMarkerClick(parcela)}
            // Diferentes iconos según el estado de la parcela
            icon={{
              url: parcela.estado === 'Al día' 
                ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                : parcela.estado === 'Pendiente'
                ? 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new window.google.maps.Size(40, 40)
            }}
          />
        ))}

        {/* Ventana de información al hacer clic en un marcador */}
        {selectedParcela && (
          <InfoWindow
            position={selectedParcela.position}
            onCloseClick={() => setSelectedParcela(null)}
          >
            <div className={styles.infoWindow}>
              <h3>{selectedParcela.title}</h3>
              <p><strong>Estado:</strong> <span className={
                selectedParcela.estado === 'Al día' 
                  ? styles.estadoAlDia
                  : selectedParcela.estado === 'Pendiente'
                  ? styles.estadoPendiente
                  : styles.estadoAtrasado
              }>{selectedParcela.estado}</span></p>
              <p><strong>Propietario:</strong> {selectedParcela.propietario}</p>
              <p><strong>Superficie:</strong> {selectedParcela.superficie}</p>
              <p><strong>Dirección:</strong> {selectedParcela.direccion}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
} 