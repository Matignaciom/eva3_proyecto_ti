import { useState, useEffect } from 'react';
import styles from './PaginasComunes.module.css';

// Interfaz para el modelo de usuario
interface Usuario {
  id: number;
  nombreCompleto: string;
  email: string;
  rut: string;
  direccion: string;
  comunidad: string;
  rol: string;
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
  
  // Determinar si el usuario es administrador (en una aplicación real esto vendría de un contexto de autenticación)
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Efecto para obtener los datos del usuario al cargar la página
  useEffect(() => {
    // En un caso real, obtendríamos estos datos del backend
    // Simulando una solicitud a la API
    setIsLoading(true);
    
    // Aquí simulamos la obtención del rol del usuario
    // En una aplicación real, esto vendría del contexto de autenticación o del backend
    const userRole = localStorage.getItem('userRole') || 'Copropietario';
    const isUserAdmin = userRole === 'Administrador';
    setIsAdmin(isUserAdmin);
    
    setTimeout(() => {
      // Datos simulados del usuario según su rol
      const userData: Usuario = {
        id: 1,
        nombreCompleto: 'Juan Pérez',
        email: 'juan.perez@example.com',
        rut: '12.345.678-9',
        direccion: 'Av. Principal 123, Santiago',
        comunidad: 'SIGEPA Parcelas',
        rol: isUserAdmin ? 'Administrador' : 'Copropietario'
      };
      
      setUsuario(userData);
      setFormData({
        nombreCompleto: userData.nombreCompleto,
        email: userData.email,
        direccion: userData.direccion || '',
        passwordActual: '',
        passwordNuevo: '',
        passwordConfirm: ''
      });
      
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Manejador para cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Manejador para guardar cambios en los datos personales
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({ type: 'error', text: 'El correo electrónico no es válido.' });
      return;
    }
    
    // En un caso real, enviaríamos estos datos al backend
    setIsLoading(true);
    
    // Simulando un guardado exitoso
    setTimeout(() => {
      setUsuario({
        ...usuario,
        nombreCompleto: formData.nombreCompleto,
        email: formData.email,
        direccion: formData.direccion
      });
      
      setIsEditing(false);
      setIsLoading(false);
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente.' });
      
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    }, 1500);
  };
  
  // Manejador para cambiar la contraseña
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar contraseñas
    if (formData.passwordActual.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña actual no es válida.' });
      return;
    }
    
    if (formData.passwordNuevo.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    
    if (formData.passwordNuevo !== formData.passwordConfirm) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    
    // En un caso real, enviaríamos estos datos al backend
    setIsLoading(true);
    
    // Simulando un cambio de contraseña exitoso
    setTimeout(() => {
      setFormData({
        ...formData,
        passwordActual: '',
        passwordNuevo: '',
        passwordConfirm: ''
      });
      
      setIsChangingPassword(false);
      setIsLoading(false);
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' });
      
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    }, 1500);
  };
  
  // Cancelar edición
  const handleCancelEdit = () => {
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
  
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Mi Perfil</h1>
      </div>
      
      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando información...</p>
        </div>
      ) : (
        <div className={styles.profileContainer}>
          {message.text && (
            <div className={`${styles.messageBox} ${message.type === 'error' ? styles.errorMessage : styles.successMessage}`}>
              {message.text}
            </div>
          )}
          
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
                    <span className={styles.detailValue}>{usuario.rut}</span>
                    <span className={styles.detailNote}>(No modificable)</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Dirección</span>
                    <span className={styles.detailValue}>{usuario.direccion || 'No especificada'}</span>
                  </div>
                  
                  {isAdmin ? (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Administra</span>
                      <span className={styles.detailValue}>{usuario.comunidad}</span>
                    </div>
                  ) : (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Comunidad</span>
                      <span className={styles.detailValue}>{usuario.comunidad}</span>
                      <span className={styles.detailNote}>(Gestionado por Administrador)</span>
                    </div>
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
            
            {isAdmin && (
              <div className={styles.profileSection}>
                <h3 className={styles.sectionTitle}>Información de Administrador</h3>
                <div className={styles.profileDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Cargo</span>
                    <span className={styles.detailValue}>Administrador del Sistema</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Permisos</span>
                    <span className={styles.detailValue}>Gestión completa del sistema</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Fecha de nombramiento</span>
                    <span className={styles.detailValue}>01/01/2023</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 