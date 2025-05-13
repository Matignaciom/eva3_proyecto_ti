import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './RecuperarPassword.module.css';

export default function RecuperarPassword() {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: Código, 3: Nueva contraseña
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulamos una verificación de correo
      // En una implementación real, se enviaría una solicitud al servidor
      // para verificar que el correo existe y enviar un código
      
      // Simulamos una demora
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Avanzar al siguiente paso
      setStep(2);
    } catch (err) {
      setError('Ocurrió un error al procesar tu solicitud. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError('Por favor, ingresa el código de verificación');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulamos una verificación del código
      // En una implementación real, se enviaría el código al servidor para verificarlo
      
      // Simulamos una demora
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Para propósitos de demostración, cualquier código es válido
      setStep(3);
    } catch (err) {
      setError('Código de verificación incorrecto. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword) {
      setError('Por favor, ingresa tu nueva contraseña');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulamos un cambio de contraseña
      // En una implementación real, se enviaría la nueva contraseña al servidor
      
      // Simulamos una demora
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirigir al login con un mensaje de éxito
      navigate('/login', { state: { message: 'Contraseña actualizada correctamente' } });
    } catch (err) {
      setError('Ocurrió un error al actualizar tu contraseña. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleEmailSubmit}>
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
                  title="Ingresa el correo asociado a tu cuenta"
                >
                  <span>i</span>
                </button>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Enviar Código de Verificación'}
              </button>
              
              <Link to="/login" className={styles.cancelButton}>
                Volver a Iniciar Sesión
              </Link>
            </div>
          </form>
        );
      
      case 2:
        return (
          <form onSubmit={handleVerificationSubmit}>
            <div className={styles.formHeader}>
              <h2>Código de Verificación</h2>
              <p className={styles.codeInfo}>
                Hemos enviado un código de verificación a <strong>{email}</strong>
                <br/>(Para esta demo, puedes ingresar cualquier código)
              </p>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Ingresa el código recibido"
                  required
                  disabled={loading}
                  className={styles.codeInput}
                  maxLength={6}
                />
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Verificar Código'}
              </button>
              
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={() => setStep(1)}
              >
                Volver
              </button>
            </div>
          </form>
        );
      
      case 3:
        return (
          <form onSubmit={handlePasswordSubmit}>
            <div className={styles.formHeader}>
              <h2>Nueva Contraseña</h2>
              <div className={styles.inputGroup}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa tu nueva contraseña"
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
              </div>
            </div>

            <div className={styles.formHeader}>
              <h2>Confirmar Contraseña</h2>
              <div className={styles.inputGroup}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  required
                  disabled={loading}
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

            <div className={styles.buttonGroup}>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
              
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={() => setStep(2)}
              >
                Volver
              </button>
            </div>
          </form>
        );
      
      default:
        return null;
    }
  };

  // Obtener título según el paso actual
  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Recuperar Contraseña';
      case 2:
        return 'Verificar Código';
      case 3:
        return 'Nueva Contraseña';
      default:
        return 'Recuperar Contraseña';
    }
  };

  // Obtener descripción según el paso actual
  const getStepDescription = () => {
    switch (step) {
      case 1:
        return 'Ingresa tu correo electrónico y te enviaremos un código de verificación.';
      case 2:
        return 'Ingresa el código de verificación que te hemos enviado a tu correo electrónico.';
      case 3:
        return 'Ingresa y confirma tu nueva contraseña.';
      default:
        return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <h1 className={styles.logoText}>SIGEPA</h1>
        <p className={styles.logoSubtitle}>Sistema de Gestión de Pagos</p>
      </div>
      
      <h2 className={styles.title}>{getStepTitle()}</h2>
      
      <p className={styles.description}>
        {getStepDescription()}
      </p>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      {/* Indicador de pasos */}
      <div className={styles.stepsIndicator}>
        <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>
          <div className={styles.stepNumber}>1</div>
          <span className={styles.stepLabel}>Correo</span>
        </div>
        <div className={styles.stepConnector}></div>
        <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>
          <div className={styles.stepNumber}>2</div>
          <span className={styles.stepLabel}>Código</span>
        </div>
        <div className={styles.stepConnector}></div>
        <div className={`${styles.step} ${step >= 3 ? styles.stepActive : ''}`}>
          <div className={styles.stepNumber}>3</div>
          <span className={styles.stepLabel}>Contraseña</span>
        </div>
      </div>
      
      {renderStep()}
    </div>
  );
} 