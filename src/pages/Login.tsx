import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './Login.module.css';
import SEO from '../components/SEO';

export default function Login() {
  const [email, setEmail] = useState(''); // Eliminado valor predeterminado
  const [password, setPassword] = useState(''); // Eliminado valor predeterminado
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailInfo, setShowEmailInfo] = useState(false);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showStatusMessage, setShowStatusMessage] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar si hay un mensaje en el estado de navegación
  useEffect(() => {
    if (location.state && location.state.message) {
      setSuccess(location.state.message);
      
      // Limpiar el mensaje después de 5 segundos
      const timeoutId = setTimeout(() => {
        setSuccess('');
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [location]);

  // Verificar estado del servidor al cargar el componente sin mostrar mensaje
  useEffect(() => {
    checkServerStatus(false);
  }, []);
  
  // Efecto para ocultar el mensaje de servidor conectado después de 3 segundos
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (showStatusMessage) {
      timeoutId = window.setTimeout(() => {
        setShowStatusMessage(false);
      }, 3000); // El toast se oculta con animación después de 3s
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showStatusMessage]);

  // Función para verificar el estado del servidor
  const checkServerStatus = async (showMessage = true) => {
    try {
      setServerStatus('checking');
      if (showMessage) {
        setShowStatusMessage(true);
      }
      
      const response = await fetch('/api/comunidades', { 
        method: 'GET',
        // Añadir un timeout para no esperar demasiado
        signal: AbortSignal.timeout(5000),
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch((error) => {
        console.error('Error al conectar con el servidor:', error);
        return null;
      });
      
      if (response && response.ok) {
        setServerStatus('online');
        if (showMessage) {
          setShowStatusMessage(true);
        }
      } else {
        console.error('Error al conectar con el servidor');
        setServerStatus('offline');
        setShowStatusMessage(true); // Siempre mostramos el mensaje de error
      }
    } catch (err) {
      console.error('Error al verificar el servidor:', err);
      setServerStatus('offline');
      setShowStatusMessage(true); // Siempre mostramos el mensaje de error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Iniciando solicitud de login...');
      console.log('URL:', '/api/auth/login');
      console.log('Credenciales:', { email, password });
      
      // Realizar la solicitud al backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
        // Eliminamos credentials: 'include' para evitar problemas CORS
      });
      
      console.log('Respuesta del servidor:', response.status, response.statusText);
      
      const data = await response.json();
      
      console.log('Datos de respuesta:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Credenciales incorrectas');
      }
      
      console.log('Login exitoso:', data);
      
      // Guardar el token en localStorage
      localStorage.setItem('token', data.token);
      
      // Guardar información del usuario
      localStorage.setItem('userRole', data.user.rol);
      localStorage.setItem('userName', data.user.nombreCompleto);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userId', data.user.id.toString());
      
      // Redirigir según el rol
      if (data.user.rol === 'Administrador') {
        navigate('/dashboard/admin');
      } else if (data.user.rol === 'Copropietario') {
        navigate('/dashboard/copropietario');
      } else {
        // Si hay otros roles, manejarlos aquí
        navigate('/dashboard');
      }
      
    } catch (err: any) {
      console.error('Error completo:', err);
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      console.error('Error al iniciar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Iniciar Sesión | SIGEPA" 
        description="Inicia sesión en SIGEPA para acceder a la gestión de pagos de tu comunidad o condominio." 
        keywords="login SIGEPA, iniciar sesión, acceso, gestión pagos"
        canonicalUrl="https://sigepa.com/login"
      />
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <h1 className={styles.logoText}>SIGEPA</h1>
            <p className={styles.logoSubtitle}>Sistema de Gestión de Pagos</p>
          </div>
          
          <button 
            type="button" 
            className={`${styles.refreshButton} ${serverStatus === 'checking' ? styles.refreshButtonSpinning : ''}`}
            onClick={() => checkServerStatus(true)}
            disabled={loading}
            aria-label="Verificar conexión con el servidor"
            title="Verificar estado del servidor"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
              <path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span className={styles.refreshLabel}>Actualizar</span>
          </button>
        </div>
        
        <h2 className={styles.title}>Iniciar Sesión</h2>
        
        {/* Notificación tipo Toast para el estado del servidor */}
        {showStatusMessage && (
          <div className={`${styles.serverToast} ${
            serverStatus === 'online' 
              ? styles.statusOnlineToast 
              : serverStatus === 'offline' 
                ? styles.statusOfflineToast 
                : styles.statusCheckingToast
          }`}>
            {serverStatus === 'checking' && (
              <>
                <span className={`${styles.toastIcon} ${styles.spinnerIcon}`}>⟳</span> 
                Verificando conexión al servidor...
              </>
            )}
            {serverStatus === 'online' && (
              <>
                <span className={styles.toastIcon}>✅</span> 
                Servidor conectado
              </>
            )}
            {serverStatus === 'offline' && (
              <>
                <span className={styles.toastIcon}>❌</span> 
                Servidor no disponible - Contacta al administrador
              </>
            )}
          </div>
        )}
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <h2>Correo electrónico</h2>
            <div className={styles.inputGroup}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ej: correo@gmail.com"
                required
                disabled={loading || serverStatus === 'offline'}
              />
              <button 
                type="button" 
                className={styles.infoButton} 
                title="Información del correo electrónico"
                onClick={() => setShowEmailInfo(!showEmailInfo)}
                aria-label="Mostrar información sobre el correo electrónico"
              >
                <span>i</span>
              </button>
              {showEmailInfo && (
                <div className={styles.tooltip}>
                  Ingresa el correo electrónico con el que te registraste en el sistema.
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.formHeader}>
            <h2>Contraseña</h2>
            <div className={styles.inputGroup}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
                disabled={loading || serverStatus === 'offline'}
              />
              <button 
                type="button" 
                className={styles.visibilityButton}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
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
              <button 
                type="button" 
                className={styles.infoButton}
                onClick={() => setShowPasswordInfo(!showPasswordInfo)}
                style={{ right: '40px' }}
                title="Información de la contraseña"
                aria-label="Mostrar información sobre la contraseña"
              >
                <span>i</span>
              </button>
              {showPasswordInfo && (
                <div className={styles.tooltip} style={{ right: '40px' }}>
                  La contraseña debe tener al menos 8 caracteres.
                </div>
              )}
            </div>
            <div className={styles.forgotPassword}>
              <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={styles.loginButton} 
              disabled={loading || serverStatus === 'offline'}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
            
            <Link to="/registro" className={styles.registerButton}>
              Registrarte
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}