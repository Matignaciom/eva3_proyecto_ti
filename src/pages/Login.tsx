import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailInfo, setShowEmailInfo] = useState(false);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      // Realizar la solicitud al backend
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
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
      setError(err.message || 'Error al iniciar sesión');
      console.error('Error al iniciar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <h1 className={styles.logoText}>SIGEPA</h1>
        <p className={styles.logoSubtitle}>Sistema de Gestión de Pagos</p>
      </div>
      
      <h2 className={styles.title}>Iniciar Sesión</h2>
      
      {error && <div className={styles.error}>{error}</div>}
      
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
              disabled={loading}
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
              disabled={loading}
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
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
          
          <Link to="/registro" className={styles.registerButton}>
            Registrarte
          </Link>
        </div>
      </form>
    </div>
  );
}