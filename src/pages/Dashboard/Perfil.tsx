import { useState, useEffect } from 'react';
import styles from './PaginasComunes.module.css';

// Interfaz para el modelo de parcela
interface Parcela {
  idParcela: number;
  nombre: string;
  direccion: string;
  area: number;
  estado: 'Al día' | 'Pendiente' | 'Atrasado';
  fechaAdquisicion: string;
  valorCatastral: number;
}

// Interfaz para estadísticas de pago
interface Estadisticas {
  totalGastos: number;
  gastosPagados: number;
  gastosPendientes: number;
  gastosAtrasados: number;
}

// Interfaz para el modelo de usuario
interface Usuario {
  id: number;
  nombreCompleto: string;
  email: string;
  rut: string;
  direccion?: string;
  comunidad: string;
  idComunidad?: number;
  rol: string;
  parcelas?: Parcela[];
  estadisticas?: Estadisticas;
}

// Interfaz para estadísticas de comunidad
interface EstadisticasComunidad {
  copropietarios: number;
  parcelas: number;
  gastosPendientes: number;
  avisos: number;
}

export default function Perfil() {
  // Estados para los datos del formulario
  const [usuario, setUsuario] = useState<Usuario>({
    id: 1,
    nombreCompleto: '',
    email: '',
    rut: '',
    direccion: '',
    comunidad: '',
    rol: ''
  });
  
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    direccion: '',
    passwordActual: '',
    passwordNuevo: '',
    passwordConfirm: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Estados para controlar la visibilidad de las contraseñas
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [showPasswordNuevo, setShowPasswordNuevo] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  // Estados para determinar el rol del usuario
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Estadísticas de la comunidad para administradores
  const [estadisticasComunidad, setEstadisticasComunidad] = useState<EstadisticasComunidad>({
    copropietarios: 0,
    parcelas: 0,
    gastosPendientes: 0,
    avisos: 0
  });
  
  // Definir la URL base del servidor API (fuera de los métodos)
  const API_BASE_URL = 'http://localhost:3000';
  
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  
  // Efecto para el temporizador de redirección
  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0) {
      window.location.href = '/login';
    }
  }, [redirectCountdown]);
  
  // Iniciar redirección
  const startRedirect = (seconds: number = 3) => {
    setRedirectCountdown(seconds);
  };
  
  // Efecto para obtener los datos del usuario al cargar la página
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      
      try {
        // Obtener el token y el ID del usuario desde localStorage
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        // Verificar si hay información de autenticación
        if (!token || !userId) {
          console.error('No hay token o ID de usuario en localStorage');
          setMessage({ 
            type: 'error', 
            text: 'No se pudo encontrar la información de autenticación. Por favor, inicia sesión nuevamente.'
          });
          setIsLoading(false);
          return;
        }
        
        // Verificar que el ID de usuario sea un número
        const userIdNum = parseInt(userId, 10);
        if (isNaN(userIdNum) || userIdNum <= 0) {
          console.error('ID de usuario inválido:', userId);
          setMessage({ 
            type: 'error', 
            text: 'El ID de usuario almacenado no es válido. Por favor, inicia sesión nuevamente.'
          });
          setIsLoading(false);
          return;
        }
        
        console.log(`Intentando obtener datos del usuario ${userId} desde ${API_BASE_URL}/api/usuarios/${userId}`);
        
        // Realizar la solicitud al backend para obtener datos del usuario
        const response = await fetch(`${API_BASE_URL}/api/usuarios/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Respuesta de error del servidor:', response.status, errorData);
          
          if (response.status === 404) {
            console.error('Usuario no encontrado. ID:', userId);
            
            // Limpiar la información de autenticación
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            
            throw new Error('Usuario no encontrado. La sesión será cerrada automáticamente.');
          } else if (response.status === 401) {
            // Limpiar la información de autenticación
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            
            throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
          } else {
            throw new Error(`Error al obtener datos del usuario (${response.status}).`);
          }
        }
        
        let data;
        try {
          data = await response.json();
          console.log('Datos del usuario recibidos:', data);
        } catch (e) {
          console.error('Error al parsear la respuesta JSON:', e);
          throw new Error('Error al procesar la respuesta del servidor.');
        }
        
        if (!data || !data.usuario) {
          console.error('Datos de usuario incompletos:', data);
          throw new Error('La respuesta del servidor no contiene información del usuario.');
        }
        
        const userData = data.usuario;
        
        // Actualizar estados
        setUsuario(userData);
        setFormData({
          nombreCompleto: userData.nombreCompleto,
          email: userData.email,
          direccion: userData.direccion || '',
          passwordActual: '',
          passwordNuevo: '',
          passwordConfirm: ''
        });
        
        // Determinar si es administrador
        setIsAdmin(userData.rol === 'Administrador');
        
        // Si es administrador, cargar estadísticas de la comunidad
        if (userData.rol === 'Administrador' && userData.idComunidad) {
          try {
            const estadisticasResponse = await fetch(`${API_BASE_URL}/api/comunidades/${userData.idComunidad}/estadisticas`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (estadisticasResponse.ok) {
              const estadisticasData = await estadisticasResponse.json();
              console.log('Estadísticas de comunidad recibidas:', estadisticasData);
              
              if (estadisticasData && estadisticasData.estadisticas) {
                setEstadisticasComunidad(estadisticasData.estadisticas);
              }
            } else {
              console.error('Error al obtener estadísticas de la comunidad:', estadisticasResponse.status);
            }
          } catch (error) {
            console.error('Error al cargar estadísticas de la comunidad:', error);
          }
        }
        
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        
        // Si el error menciona "sesión será cerrada", redirigir a login después de un retraso
        if (error instanceof Error && error.message.includes('sesión será cerrada')) {
          setMessage({ 
            type: 'error', 
            text: error.message
          });
          
          // Iniciar la redirección
          startRedirect(5);
        } else {
          setMessage({ 
            type: 'error', 
            text: error instanceof Error ? error.message : 'No se pudieron cargar los datos del perfil.'
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Manejador para cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Log para debugging
    if (name === 'direccion') {
      console.log(`Actualizando dirección: "${value}"`);
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Manejador para guardar cambios en los datos personales
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({ type: 'error', text: 'El correo electrónico no es válido.' });
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Obtener el token y el ID del usuario desde localStorage
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        throw new Error('No hay token o ID de usuario en localStorage');
      }
      
      // Mostrar los datos que se enviarán al servidor
      console.log('Datos que se enviarán al servidor:');
      console.log('nombreCompleto:', formData.nombreCompleto);
      console.log('email:', formData.email);
      console.log('direccion:', formData.direccion);
      
      console.log(`Actualizando perfil del usuario ${userId} en ${API_BASE_URL}/api/usuarios/${userId}`);
      
      // Realizar la solicitud al backend para actualizar datos
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombreCompleto: formData.nombreCompleto,
          email: formData.email,
          direccion: formData.direccion
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Respuesta de error del servidor al actualizar perfil:', response.status, errorData);
        
        if (response.status === 404) {
          throw new Error('Usuario no encontrado.');
        } else if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        } else if (response.status === 400) {
          throw new Error('Datos inválidos. Verifique la información proporcionada.');
        } else {
          throw new Error(`Error al actualizar perfil (${response.status}).`);
        }
      }
      
      let data;
      try {
        data = await response.json();
        console.log('Respuesta completa de actualización de perfil:', data);
        console.log('Datos del usuario recibidos del servidor:', data.usuario);
        console.log('Dirección recibida del servidor:', data.usuario.direccion);
      } catch (e) {
        console.error('Error al parsear la respuesta JSON al actualizar perfil:', e);
        throw new Error('Error al procesar la respuesta del servidor.');
      }
      
      if (!data || !data.usuario) {
        console.error('Datos de respuesta incompletos:', data);
        throw new Error('La respuesta del servidor no contiene la información actualizada.');
      }
      
      // Crear una copia del usuario actualizado asegurándonos de que todos los campos estén definidos
      const usuarioActualizado = {
        ...data.usuario,
        direccion: data.usuario.direccion || '' // Asegurarnos de que direccion nunca sea undefined
      };
      
      console.log('Estado actual del usuario antes de actualizar:', usuario);
      
      // Actualizar el estado del usuario con la respuesta del servidor
      setUsuario(usuarioActualizado);
      
      // El log inmediato después de setUsuario no mostrará el estado actualizado debido a que
      // las actualizaciones de estado en React son asíncronas
      
      // Actualizar formData para mantener sincronizados los datos
      setFormData({
        ...formData,
        nombreCompleto: usuarioActualizado.nombreCompleto,
        email: usuarioActualizado.email,
        direccion: usuarioActualizado.direccion
      });
      
      // Verificar que la actualización se aplicó correctamente usando un efecto secundario
      // para asegurarnos de que el estado se ha actualizado
      setTimeout(() => {
        console.log('Estado del usuario después de actualizar (después de timeout):', {
          ...usuario,
          // Mostrar los valores específicos que nos interesan
          nombreCompleto: usuario.nombreCompleto,
          email: usuario.email,
          direccion: usuario.direccion
        });
      }, 500);
      
      console.log('Datos actualizados correctamente:', {
        nombre: usuarioActualizado.nombreCompleto,
        email: usuarioActualizado.email,
        direccion: usuarioActualizado.direccion
      });
      
      // Actualizar datos en localStorage si cambió el email
      if (formData.email !== usuario.email) {
        localStorage.setItem('userEmail', formData.email);
      }
      
      // Si cambió el nombre
      if (formData.nombreCompleto !== usuario.nombreCompleto) {
        localStorage.setItem('userName', formData.nombreCompleto);
      }
      
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
      
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al actualizar perfil'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Manejador para cambiar la contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar contraseñas con reglas más estrictas
    if (formData.passwordActual.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña actual no es válida.' });
      return;
    }
    
    // Validar que la nueva contraseña sea segura
    if (formData.passwordNuevo.length < 8) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    
    // Validar que la contraseña contenga al menos una letra mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(formData.passwordNuevo)) {
      setMessage({ 
        type: 'error', 
        text: 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número.' 
      });
      return;
    }
    
    if (formData.passwordNuevo !== formData.passwordConfirm) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Obtener el token y el ID del usuario desde localStorage
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        throw new Error('No hay token o ID de usuario en localStorage');
      }
      
      console.log(`Cambiando contraseña del usuario ${userId}`);
      
      // Realizar la solicitud al backend para cambiar contraseña
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          passwordActual: formData.passwordActual,
          passwordNuevo: formData.passwordNuevo
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Respuesta de error al cambiar contraseña:', response.status, errorData);
        
        if (response.status === 400) {
          throw new Error('La contraseña actual es incorrecta.');
        } else if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        } else {
          throw new Error(`Error al cambiar contraseña (${response.status}).`);
        }
      }
      
      let data;
      try {
        data = await response.json();
        console.log('Respuesta de cambio de contraseña:', data);
      } catch (e) {
        console.error('Error al parsear la respuesta JSON al cambiar contraseña:', e);
        throw new Error('Error al procesar la respuesta del servidor.');
      }
      
      // Limpiar campos de contraseña
      setFormData({
        ...formData,
        passwordActual: '',
        passwordNuevo: '',
        passwordConfirm: ''
      });
      
      // Restablecer estados de visibilidad
      setShowPasswordActual(false);
      setShowPasswordNuevo(false);
      setShowPasswordConfirm(false);
      
      setIsChangingPassword(false);
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' });
      
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error al cambiar contraseña'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancelar edición
  const handleCancelEdit = () => {
    console.log('Cancelando edición, restaurando datos originales:', {
      nombreOriginal: usuario.nombreCompleto,
      emailOriginal: usuario.email,
      direccionOriginal: usuario.direccion || 'No especificada'
    });
    
    setFormData({
      ...formData,
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      direccion: usuario.direccion || ''
    });
    
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };
  
  // Cancelar cambio de contraseña
  const handleCancelPasswordChange = () => {
    setFormData({
      ...formData,
      passwordActual: '',
      passwordNuevo: '',
      passwordConfirm: ''
    });
    
    // Restablecer estados de visibilidad
    setShowPasswordActual(false);
    setShowPasswordNuevo(false);
    setShowPasswordConfirm(false);
    
    setIsChangingPassword(false);
    setMessage({ type: '', text: '' });
  };
  
  // Función para formatear el valor monetario
  const formatMoney = (amount: number): string => {
    return amount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };
  
  // Función para obtener la clase de estado según el estado de la parcela
  const getEstadoClass = (estado: string): string => {
    switch (estado) {
      case 'Al día':
        return styles.estadoAlDia;
      case 'Pendiente':
        return styles.estadoPendiente;
      case 'Atrasado':
        return styles.estadoAtrasado;
      default:
        return '';
    }
  };
  
  // Función para formatear un RUT en formato chileno
  const formatRut = (rut: string): string => {
    // Si está vacío o no disponible
    if (!rut) {
      return 'No disponible';
    }
    
    // Si ya tiene un guión, puede estar formateado, pero asegurémonos
    if (rut.includes('-')) {
      // Separar en dos partes: número y dígito verificador
      const [numPart, dvPart] = rut.split('-');
      
      // Limpiar puntos del número si existen
      const numClean = numPart.replace(/\./g, '');
      
      // Formatear número con puntos (formato chileno)
      let formattedNum = '';
      let counter = 0;
      
      for (let i = numClean.length - 1; i >= 0; i--) {
        if (counter === 3) {
          formattedNum = '.' + formattedNum;
          counter = 0;
        }
        formattedNum = numClean[i] + formattedNum;
        counter++;
      }
      
      return `${formattedNum}-${dvPart}`;
    }
    
    // Si es un hash (muy largo), mostramos "No disponible"
    if (rut.length > 20) {
      return 'No disponible';
    }
    
    // Asumimos que es un número sin formato, aplicamos formato chileno
    try {
      // Obtener el dígito verificador (último carácter)
      const dv = rut.slice(-1);
      
      // Obtener la parte numérica
      const numPart = rut.slice(0, -1).replace(/\D/g, '');
      
      // Formatear con puntos (de derecha a izquierda)
      let rutFormateado = '';
      let counter = 0;
      
      for (let i = numPart.length - 1; i >= 0; i--) {
        if (counter === 3) {
          rutFormateado = '.' + rutFormateado;
          counter = 0;
        }
        rutFormateado = numPart[i] + rutFormateado;
        counter++;
      }
      
      return `${rutFormateado}-${dv}`;
    } catch (error) {
      console.error('Error al formatear RUT:', error);
      return rut || 'No disponible'; // Devolver sin cambios o indicar no disponible
    }
  };
  
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Mi Perfil</h1>
      </div>
      
      {message.text && (
        <div className={`${styles.messageBox} ${message.type === 'error' ? styles.errorMessage : styles.successMessage}`}>
          {message.text}
          {redirectCountdown !== null && (
            <div className={styles.redirectNotice}>
              <p>Serás redirigido al inicio de sesión en {redirectCountdown} segundos...</p>
            </div>
          )}
        </div>
      )}
      
      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando información...</p>
        </div>
      ) : redirectCountdown !== null ? (
        <div className={styles.errorState}>
          <div className={styles.profileCard}>
            <div className={styles.profileSection}>
              <h3 className={styles.sectionTitle}>Sesión finalizada</h3>
              <p>Tu sesión ha sido cerrada debido a un problema de autenticación.</p>
              <p>Serás redirigido a la página de inicio de sesión en <strong>{redirectCountdown}</strong> segundos.</p>
              <div className={styles.formActions}>
                <button 
                  className={styles.buttonPrimary}
                  onClick={() => window.location.href = '/login'}
                >
                  Ir a inicio de sesión ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : !usuario.id && message.type === 'error' ? (
        <div className={styles.errorState}>
          <div className={styles.profileCard}>
            <div className={styles.profileSection}>
              <h3 className={styles.sectionTitle}>Error al cargar el perfil</h3>
              <p>No se pudo cargar la información de tu perfil. Por favor:</p>
              <ul>
                <li>Verifica tu conexión a internet</li>
                <li>Comprueba que el servidor esté en funcionamiento</li>
                <li>Intenta cerrar sesión y volver a iniciar sesión</li>
              </ul>
              <div className={styles.formActions}>
                <button 
                  className={styles.buttonPrimary}
                  onClick={() => window.location.reload()}
                >
                  Intentar nuevamente
                </button>
                <button 
                  className={styles.buttonSecondary}
                  onClick={() => window.location.href = '/login'}
                >
                  Ir a inicio de sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.profileContainer}>
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.profileAvatar}>
                {usuario.nombreCompleto.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className={styles.profileInfo}>
                <h2 className={styles.profileName}>{usuario.nombreCompleto}</h2>
                <p className={styles.profileRole}>{usuario.rol}</p>
              </div>
            </div>
            
            <div className={styles.profileSection}>
              <h3 className={styles.sectionTitle}>Información Personal</h3>
              
              {isEditing ? (
                <form onSubmit={handleSaveProfile}>
                  <div className={styles.formGroup}>
                    <label htmlFor="nombreCompleto" className={styles.formLabel}>Nombre Completo</label>
                    <input
                      type="text"
                      id="nombreCompleto"
                      name="nombreCompleto"
                      value={formData.nombreCompleto}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.formLabel}>Correo Electrónico</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="direccion" className={styles.formLabel}>Dirección (opcional)</label>
                    <input
                      type="text"
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      className={styles.formInput}
                    />
                  </div>
                  
                  <div className={styles.formActions}>
                    <button 
                      type="button" 
                      className={styles.buttonSecondary}
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className={styles.buttonPrimary}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.profileDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Nombre Completo</span>
                    <span className={styles.detailValue}>{usuario.nombreCompleto}</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Correo Electrónico</span>
                    <span className={styles.detailValue}>{usuario.email}</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>RUT</span>
                    <span className={styles.detailValue}>{formatRut(usuario.rut || '')}</span>
                    <span className={styles.detailNote}>(No modificable)</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Dirección</span>
                    <span className={styles.detailValue}>
                      {usuario.direccion ? usuario.direccion : 'No especificada'}
                    </span>
                  </div>
                  
                  {isAdmin ? (
                    <>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Cargo</span>
                        <span className={styles.detailValue}>Administrador del Sistema</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Comunidad que Administra</span>
                        <span className={styles.detailValue}>{usuario.comunidad}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Comunidad</span>
                        <span className={styles.detailValue}>{usuario.comunidad}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Estado</span>
                        <span className={styles.detailValue}>Miembro Activo</span>
                      </div>
                    </>
                  )}
                  
                  <div className={styles.formActions}>
                    <button 
                      className={styles.buttonPrimary}
                      onClick={() => setIsEditing(true)}
                    >
                      Editar Perfil
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className={styles.profileSection}>
              <h3 className={styles.sectionTitle}>Seguridad</h3>
              
              {isChangingPassword ? (
                <form onSubmit={handleChangePassword}>
                  <div className={styles.formGroup}>
                    <label htmlFor="passwordActual" className={styles.formLabel}>Contraseña Actual</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type={showPasswordActual ? "text" : "password"}
                        id="passwordActual"
                        name="passwordActual"
                        value={formData.passwordActual}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        required
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPasswordActual(!showPasswordActual)}
                        aria-label={showPasswordActual ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPasswordActual ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 10s3.5-5 8-5 8 5 8 5-3.5 5-8 5-8-5-8-5z" />
                            <circle cx="10" cy="10" r="2" />
                            <path d="M2 10s3.5-5 8-5 8 5 8 5-3.5 5-8 5-8-5-8-5z" />
                            <line x1="2" y1="2" x2="18" y2="18" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 10s3.5-5 8-5 8 5 8 5-3.5 5-8 5-8-5-8-5z" />
                            <circle cx="10" cy="10" r="2" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="passwordNuevo" className={styles.formLabel}>Nueva Contraseña</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type={showPasswordNuevo ? "text" : "password"}
                        id="passwordNuevo"
                        name="passwordNuevo"
                        value={formData.passwordNuevo}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        required
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPasswordNuevo(!showPasswordNuevo)}
                        aria-label={showPasswordNuevo ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPasswordNuevo ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 10s3.5-5 8-5 8 5 8 5-3.5 5-8 5-8-5-8-5z" />
                            <circle cx="10" cy="10" r="2" />
                            <path d="M2 10s3.5-5 8-5 8 5 8 5-3.5 5-8 5-8-5-8-5z" />
                            <line x1="2" y1="2" x2="18" y2="18" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 10s3.5-5 8-5 8 5 8 5-3.5 5-8 5-8-5-8-5z" />
                            <circle cx="10" cy="10" r="2" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="passwordConfirm" className={styles.formLabel}>Confirmar Contraseña</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type={showPasswordConfirm ? "text" : "password"}
                        id="passwordConfirm"
                        name="passwordConfirm"
                        value={formData.passwordConfirm}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        required
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        aria-label={showPasswordConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPasswordConfirm ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 10s3.5-5 8-5 8 5 8 5-3.5 5-8 5-8-5-8-5z" />
                            <circle cx="10" cy="10" r="2" />
                            <path d="M2 10s3.5-5 8-5 8 5 8 5-3.5 5-8 5-8-5-8-5z" />
                            <line x1="2" y1="2" x2="18" y2="18" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 10s3.5-5 8-5 8 5 8 5-3.5 5-8 5-8-5-8-5z" />
                            <circle cx="10" cy="10" r="2" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.formActions}>
                    <button 
                      type="button" 
                      className={styles.buttonSecondary}
                      onClick={handleCancelPasswordChange}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className={styles.buttonPrimary}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Guardando...' : 'Cambiar Contraseña'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className={styles.passwordSection}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Contraseña</span>
                    <span className={styles.detailValue}>••••••••</span>
                  </div>
                  
                  <div className={styles.formActions}>
                    <button 
                      className={styles.buttonOutline}
                      onClick={() => setIsChangingPassword(true)}
                    >
                      Cambiar Contraseña
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {!isAdmin && usuario.parcelas && usuario.parcelas.length > 0 && (
              <div className={styles.profileSection}>
                <h3 className={styles.sectionTitle}>Mis Parcelas</h3>
                <div className={styles.parcelasContainer}>
                  {usuario.parcelas.map(parcela => (
                    <div key={parcela.idParcela} className={styles.parcelaCard}>
                      <div className={styles.parcelaHeader}>
                        <h4 className={styles.parcelaNombre}>{parcela.nombre}</h4>
                        <span className={`${styles.parcelaEstado} ${getEstadoClass(parcela.estado)}`}>
                          {parcela.estado}
                        </span>
                      </div>
                      
                      <div className={styles.parcelaDetails}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Dirección</span>
                          <span className={styles.detailValue}>{parcela.direccion}</span>
                        </div>
                        
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Área</span>
                          <span className={styles.detailValue}>{parcela.area} hectáreas</span>
                        </div>
                        
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Fecha de Adquisición</span>
                          <span className={styles.detailValue}>{parcela.fechaAdquisicion}</span>
                        </div>
                        
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Valor Catastral</span>
                          <span className={styles.detailValue}>{formatMoney(parcela.valorCatastral)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!isAdmin && (
              <div className={styles.profileSection}>
                <h3 className={styles.sectionTitle}>Resumen de Gastos</h3>
                {usuario.estadisticas ? (
                  <div className={styles.estadisticasContainer}>
                    <div className={styles.estadisticaCard}>
                      <div className={styles.estadisticaValor}>{usuario.estadisticas.totalGastos || 0}</div>
                      <div className={styles.estadisticaLabel}>Total de gastos</div>
                    </div>
                    
                    <div className={`${styles.estadisticaCard} ${styles.pagados}`}>
                      <div className={styles.estadisticaValor}>{usuario.estadisticas.gastosPagados || 0}</div>
                      <div className={styles.estadisticaLabel}>Pagados</div>
                    </div>
                    
                    <div className={`${styles.estadisticaCard} ${styles.pendientes}`}>
                      <div className={styles.estadisticaValor}>{usuario.estadisticas.gastosPendientes || 0}</div>
                      <div className={styles.estadisticaLabel}>Pendientes</div>
                    </div>
                    
                    <div className={`${styles.estadisticaCard} ${styles.atrasados}`}>
                      <div className={styles.estadisticaValor}>{usuario.estadisticas.gastosAtrasados || 0}</div>
                      <div className={styles.estadisticaLabel}>Atrasados</div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <p>No hay información de gastos disponible.</p>
                    <p>Los gastos aparecerán aquí una vez que se registren en el sistema.</p>
                  </div>
                )}
              </div>
            )}
            
            {isAdmin && (
              <>
                <div className={styles.profileSection}>
                  <h3 className={styles.sectionTitle}>Información de Administrador</h3>
                  <div className={styles.profileDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Cargo</span>
                      <span className={styles.detailValue}>Administrador del Sistema</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Comunidad que administra</span>
                      <span className={styles.detailValue}>{usuario.comunidad}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Responsabilidades</span>
                      <span className={styles.detailValue}>Gestión de usuarios, parcelas y gastos comunitarios</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Permisos</span>
                      <span className={styles.detailValue}>Gestión completa de la comunidad</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Contacto de soporte</span>
                      <span className={styles.detailValue}>soporte@sigepa.cl</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.profileSection}>
                  <h3 className={styles.sectionTitle}>Resumen de la Comunidad {usuario.comunidad}</h3>
                  <div className={styles.estadisticasContainer}>
                    <div className={styles.estadisticaCard}>
                      <div className={styles.estadisticaValor}>{estadisticasComunidad.copropietarios}</div>
                      <div className={styles.estadisticaLabel}>Copropietarios</div>
                    </div>
                    
                    <div className={`${styles.estadisticaCard} ${styles.pagados}`}>
                      <div className={styles.estadisticaValor}>{estadisticasComunidad.parcelas}</div>
                      <div className={styles.estadisticaLabel}>Parcelas</div>
                    </div>
                    
                    <div className={`${styles.estadisticaCard} ${styles.pendientes}`}>
                      <div className={styles.estadisticaValor}>{estadisticasComunidad.gastosPendientes}</div>
                      <div className={styles.estadisticaLabel}>Gastos Pendientes</div>
                    </div>
                    
                    <div className={`${styles.estadisticaCard} ${styles.atrasados}`}>
                      <div className={styles.estadisticaValor}>{estadisticasComunidad.avisos}</div>
                      <div className={styles.estadisticaLabel}>Notificaciones</div>
                    </div>
                  </div>
                </div>
                
                <div className={styles.profileSection}>
                  <h3 className={styles.sectionTitle}>Accesos Rápidos</h3>
                  <div className={styles.quickAccessGrid}>
                    <div className={styles.quickAccessCard} onClick={() => window.location.href = '/dashboard/admin/usuarios'}>
                      <div className={styles.quickAccessIcon}>👥</div>
                      <div className={styles.quickAccessLabel}>Gestionar Usuarios</div>
                    </div>
                    <div className={styles.quickAccessCard} onClick={() => window.location.href = '/dashboard/admin/parcelas'}>
                      <div className={styles.quickAccessIcon}>🏞️</div>
                      <div className={styles.quickAccessLabel}>Administrar Parcelas</div>
                    </div>
                    <div className={styles.quickAccessCard} onClick={() => window.location.href = '/dashboard/admin/gastos'}>
                      <div className={styles.quickAccessIcon}>💰</div>
                      <div className={styles.quickAccessLabel}>Gestionar Gastos</div>
                    </div>
                    <div className={styles.quickAccessCard} onClick={() => window.location.href = '/dashboard/admin/reportes'}>
                      <div className={styles.quickAccessIcon}>📊</div>
                      <div className={styles.quickAccessLabel}>Ver Reportes</div>
                    </div>
                  </div>
                  
                  <div className={styles.formActions} style={{ marginTop: '20px' }}>
                    <button 
                      className={`${styles.buttonPrimary}`}
                      onClick={() => window.location.href = '/dashboard/admin'}
                    >
                      Panel de Administración
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 