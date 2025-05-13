import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Register.module.css';

interface Comunidad {
  idComunidad: number;
  nombre: string;
}

export default function Register() {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rut, setRut] = useState('');
  const [comunidad, setComunidad] = useState('');
  const [rol, setRol] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showStatusMessage, setShowStatusMessage] = useState(false);
  
  const navigate = useNavigate();

  // Función para verificar el estado del servidor y cargar comunidades
  const checkServerAndLoadComunidades = async (showStatusMessage = false) => {
    try {
      setServerStatus('checking');
      if (showStatusMessage) {
        setShowStatusMessage(true);
      }
      
      // Verificar si el servidor está en línea
      const serverResponse = await fetch('/', {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      
      if (serverResponse.ok) {
        setServerStatus('online');
        if (showStatusMessage) {
          setShowStatusMessage(true);
        }
        
        // Si el servidor está en línea, cargar las comunidades
        const comunidadesResponse = await fetch('/api/comunidades');
        
        if (comunidadesResponse.ok) {
          const data = await comunidadesResponse.json();
          setComunidades(data.comunidades);
        } else {
          console.error('Error al cargar comunidades:', await comunidadesResponse.text());
        }
      } else {
        setServerStatus('offline');
        setShowStatusMessage(true); // Siempre mostrar en caso de error
      }
    } catch (error) {
      console.error('Error al verificar servidor o cargar comunidades:', error);
      setServerStatus('offline');
      setShowStatusMessage(true); // Siempre mostrar en caso de error
    }
  };

  // Verificar estado del servidor y cargar comunidades al iniciar
  useEffect(() => {
    checkServerAndLoadComunidades(false); // No mostrar mensaje al cargar la página
  }, []);
  
  // Efecto para ocultar la notificación de estado del servidor después de 3 segundos
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

  const roles = [
    "Administrador",
    "Copropietario"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!rol) {
      setError('Debes seleccionar un rol');
      return;
    }

    if (!comunidad) {
      setError('Debes seleccionar una comunidad');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Realizar la solicitud al backend
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombreCompleto,
          email,
          password,
          rut,
          comunidad,
          rol
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }
      
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
      } else {
        navigate('/dashboard/copropietario');
      }
      
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
      console.error('Error al registrar:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatRut = (value: string) => {
    // Eliminar caracteres no numéricos excepto K/k
    value = value.replace(/[^\dkK]/g, '');
    
    // Si el valor está vacío, retornar
    if (!value) return '';
    
    // Si la longitud es menor o igual a 1, retornar el valor sin formato
    if (value.length <= 1) return value;
    
    // Separar el dígito verificador
    let cuerpo = value.slice(0, -1);
    let dv = value.slice(-1).toUpperCase();
    
    // Formatear el cuerpo
    cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Retornar el RUT formateado
    return `${cuerpo}-${dv}`;
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedRut = formatRut(e.target.value);
    setRut(formattedRut);
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <h1 className={styles.logoText}>SIGEPA</h1>
        <p className={styles.logoSubtitle}>Sistema de Gestión de Pagos</p>
        
        <button 
          type="button" 
          className={`${styles.refreshButton} ${serverStatus === 'checking' ? styles.refreshButtonSpinning : ''}`}
          onClick={() => checkServerAndLoadComunidades(true)}
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
      
      <h2 className={styles.title}>Registro de Usuario</h2>
      
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
      
      <form onSubmit={handleSubmit} className={serverStatus === 'offline' ? styles.disabledForm : ''}>
        <div className={styles.formHeader}>
          <h2>Nombre Completo</h2>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              placeholder="Ej: Juan Pérez Rodríguez"
              required
              disabled={loading || serverStatus === 'offline'}
            />
            <button type="button" className={styles.infoButton} title="Tu nombre y apellidos completos">
              <span>i</span>
            </button>
          </div>
        </div>

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
            <button type="button" className={styles.infoButton} title="Tu correo electrónico para iniciar sesión">
              <span>i</span>
            </button>
          </div>
        </div>
        
        <div className={styles.twoColumns}>
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
            </div>
          </div>

          <div className={styles.formHeader}>
            <h2>Confirmar Contraseña</h2>
            <div className={styles.inputGroup}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma tu contraseña"
                required
                disabled={loading || serverStatus === 'offline'}
              />
              <button 
                type="button" 
                className={styles.visibilityButton}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirmPassword ? (
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
        </div>

        <div className={styles.twoColumns}>
          <div className={styles.formHeader}>
            <h2>RUT</h2>
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={rut}
                onChange={handleRutChange}
                placeholder="Ej: 12.345.678-9"
                required
                disabled={loading || serverStatus === 'offline'}
              />
              <button type="button" className={styles.infoButton} title="Tu RUT con puntos y guión">
                <span>i</span>
              </button>
            </div>
          </div>

          <div className={styles.formHeader}>
            <h2>Rol</h2>
            <div className={styles.inputGroup}>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                required
                disabled={loading || serverStatus === 'offline'}
              >
                <option value="" disabled>Selecciona un rol</option>
                {roles.map((rolOption) => (
                  <option key={rolOption} value={rolOption}>
                    {rolOption}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formHeader}>
          <h2>Comunidad</h2>
          <div className={styles.inputGroup}>
            <select
              value={comunidad}
              onChange={(e) => setComunidad(e.target.value)}
              required
              disabled={loading || serverStatus === 'offline' || comunidades.length === 0}
            >
              <option value="" disabled>
                {comunidades.length === 0 ? 'Cargando comunidades...' : 'Selecciona una comunidad'}
              </option>
              {comunidades.map((comunidadOption) => (
                <option key={comunidadOption.idComunidad} value={comunidadOption.nombre}>
                  {comunidadOption.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button 
            type="submit" 
            className={styles.registerButton}
            disabled={loading || serverStatus === 'offline'}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
          
          <Link to="/login" className={styles.loginButton}>
            Volver a Iniciar Sesión
          </Link>
        </div>
      </form>
    </div>
  );
}