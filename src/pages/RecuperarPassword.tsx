import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './RecuperarPassword.module.css';

export default function RecuperarPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
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

    // Simulación de envío de correo de recuperación
    // En una implementación real, aquí iría la lógica para enviar el correo
    setSubmitted(true);
    setError('');
    setSuccess('Hemos enviado un correo electrónico con instrucciones para restablecer tu contraseña.');
    
    // Opcional: limpiar el formulario
    // setEmail('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <h1 className={styles.logoText}>SIGEPA</h1>
        <p className={styles.logoSubtitle}>Sistema de Gestión de Pagos</p>
      </div>
      
      <h2 className={styles.title}>Recuperar Contraseña</h2>
      
      <p className={styles.description}>
        Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
      </p>
      
      {success && <div className={styles.successMessage}>{success}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}
      
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
              disabled={submitted}
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
          {!submitted ? (
            <button type="submit" className={styles.submitButton}>
              Enviar Instrucciones
            </button>
          ) : (
            <button 
              type="button" 
              className={styles.submitButton}
              onClick={() => {
                setSubmitted(false);
                setSuccess('');
              }}
            >
              Enviar Nuevamente
            </button>
          )}
          
          <Link to="/login" className={styles.cancelButton}>
            Volver a Iniciar Sesión
          </Link>
        </div>
      </form>
    </div>
  );
} 