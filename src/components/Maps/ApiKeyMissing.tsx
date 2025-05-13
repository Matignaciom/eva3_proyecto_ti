import React from 'react';
import styles from './MapaGeoespacial.module.css';

const ApiKeyMissing: React.FC = () => {
  return (
    <div className={styles.apiKeyMissing}>
      <h2>Configuración de Google Maps API requerida</h2>
      <p>Para utilizar la funcionalidad de mapas, necesitas configurar una clave de API de Google Maps.</p>
      
      <h3>Pasos para obtener y configurar una clave de API:</h3>
      <ol>
        <li>Ve a la <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Consola de Google Cloud</a></li>
        <li>Crea un nuevo proyecto o selecciona uno existente</li>
        <li>Activa la API de Google Maps JavaScript API para tu proyecto</li>
        <li>Crea una clave de API en la sección "Credenciales"</li>
        <li>Restringe la clave API por dominio para mayor seguridad</li>
        <li>Crea un archivo <code>.env.local</code> en la raíz del proyecto</li>
        <li>Agrega la siguiente línea al archivo: <pre>VITE_GOOGLE_MAPS_API_KEY=TU_CLAVE_API_AQUÍ</pre></li>
        <li>Reinicia el servidor de desarrollo</li>
      </ol>
      
      <div className={styles.apiKeyNote}>
        <strong>Nota importante:</strong> Nunca compartas tu clave de API directamente en el código fuente.
        Siempre utiliza variables de entorno para mantener seguras tus claves.
      </div>
    </div>
  );
};

export default ApiKeyMissing; 