# Configuración de Google Maps API para SIGEPA

## Error "InvalidKeyMapError"

Si estás viendo el error `InvalidKeyMapError` o `Google Maps JavaScript API error: InvalidKeyMapError`, significa que la clave de API de Google Maps no está configurada correctamente.

## Solución

### 1. Obtener una clave de API de Google Maps

1. Ve a la [Consola de Google Cloud](https://console.cloud.google.com/).
2. Crea un nuevo proyecto o selecciona uno existente.
3. En el menú lateral, navega a "APIs y servicios" > "Biblioteca".
4. Busca y activa la "Maps JavaScript API".
5. Navega a "APIs y servicios" > "Credenciales".
6. Haz clic en "Crear credenciales" > "Clave de API".
7. Copia la clave generada.

### 2. Configurar la clave en el proyecto

Crea un archivo `.env.local` en la raíz del proyecto (mismo nivel que `package.json`) con el siguiente contenido:

```
VITE_GOOGLE_MAPS_API_KEY=TU_CLAVE_API_AQUÍ
```

Reemplaza `TU_CLAVE_API_AQUÍ` con la clave que generaste en la consola de Google Cloud.

### 3. Reiniciar el servidor de desarrollo

Después de agregar el archivo `.env.local`, detén y reinicia el servidor de desarrollo:

```bash
# Detener el servidor actual (Ctrl+C)
# Y luego reiniciar
npm run dev
```

## Seguridad de la clave de API

Para mayor seguridad, se recomienda:

1. **Restringir la clave de API** por dominio en la consola de Google Cloud para que solo pueda usarse en dominios específicos.
2. **Nunca** incluir la clave directamente en el código fuente.
3. **No** subir el archivo `.env.local` al sistema de control de versiones (ya está en `.gitignore`).

## Acerca de la advertencia de "Google Maps Marker"

Es posible que veas una advertencia sobre `google.maps.Marker` estando obsoleto. Esta es solo una advertencia y no afecta la funcionalidad actual. Google recomienda usar `google.maps.marker.AdvancedMarkerElement` en su lugar, pero según su documentación, `Marker` seguirá siendo compatible por el momento. 