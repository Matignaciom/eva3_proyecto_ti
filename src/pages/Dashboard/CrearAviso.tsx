import { useState, useEffect } from 'react';
import styles from './CrearAviso.module.css';

// API URL base
const API_BASE_URL = 'http://localhost:3000';

export default function CrearAviso() {
  // Estado para el formulario
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    fechaExpiracion: '',
    prioridad: 'normal',
    destinatarios: 'todos' // 'todos' o 'seleccionados'
  });
  
  // Estado para gestionar usuarios disponibles
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState<number[]>([]);
  const [idComunidad, setIdComunidad] = useState<number | null>(null);
  const [comunidadNombre, setComunidadNombre] = useState<string>('');
  
  // Estados de la interfaz
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Obtener datos de la comunidad del administrador
  useEffect(() => {
    const fetchDatos = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
          throw new Error('No hay información de autenticación');
        }
        
        // Obtener datos del usuario para saber su comunidad
        const userResponse = await fetch(`${API_BASE_URL}/api/usuarios/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!userResponse.ok) {
          throw new Error('Error al obtener datos del usuario');
        }
        
        const userData = await userResponse.json();
        
        if (!userData.usuario || !userData.usuario.idComunidad) {
          throw new Error('No se pudo obtener la comunidad del usuario');
        }
        
        const comunidadId = userData.usuario.idComunidad;
        setIdComunidad(comunidadId);
        setComunidadNombre(userData.usuario.comunidad || 'Comunidad');
        
        // Obtener usuarios de la comunidad (solo copropietarios)
        const usuariosResponse = await fetch(`${API_BASE_URL}/api/usuarios`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (usuariosResponse.ok) {
          const usuariosData = await usuariosResponse.json();
          if (usuariosData && usuariosData.usuarios) {
            // Filtrar solo los copropietarios
            const copropietarios = usuariosData.usuarios.filter(
              (user: any) => user.rol === 'Copropietario'
            );
            setUsuarios(copropietarios);
          }
        }
        
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDatos();
  }, []);
  
  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Si se cambia a destinatarios "todos", limpiar la selección
    if (name === 'destinatarios' && value === 'todos') {
      setUsuariosSeleccionados([]);
    }
  };
  
  // Manejar selección/deselección de usuarios
  const toggleUsuarioSeleccionado = (userId: number) => {
    if (usuariosSeleccionados.includes(userId)) {
      setUsuariosSeleccionados(usuariosSeleccionados.filter(id => id !== userId));
    } else {
      setUsuariosSeleccionados([...usuariosSeleccionados, userId]);
    }
  };
  
  // Manejar selección de todos los usuarios
  const seleccionarTodos = () => {
    setUsuariosSeleccionados(usuarios.map(user => user.id));
  };
  
  // Manejar deselección de todos los usuarios
  const deseleccionarTodos = () => {
    setUsuariosSeleccionados([]);
  };
  
  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validar campos obligatorios
    if (!formData.titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }
    
    if (!formData.contenido.trim()) {
      setError('El contenido del aviso es obligatorio');
      return;
    }
    
    if (!formData.fechaExpiracion) {
      setError('La fecha de expiración es obligatoria');
      return;
    }
    
    // Validar que si se seleccionaron destinatarios específicos, haya al menos uno
    if (formData.destinatarios === 'seleccionados' && usuariosSeleccionados.length === 0) {
      setError('Debe seleccionar al menos un destinatario');
      return;
    }
    
    // Validar fecha (no anterior a hoy)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Resetear la hora para comparar solo fechas
    const fechaSeleccionada = new Date(formData.fechaExpiracion);
    
    if (fechaSeleccionada < hoy) {
      setError('La fecha de expiración no puede ser anterior a hoy');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !idComunidad) {
        throw new Error('No hay información de autenticación');
      }
      
      // Construir objeto de datos para enviar
      const avisoData = {
        titulo: formData.titulo,
        contenido: formData.contenido,
        fechaExpiracion: formData.fechaExpiracion,
        prioridad: formData.prioridad,
        idComunidad,
        destinatarios: formData.destinatarios === 'todos' ? 'todos' : usuariosSeleccionados
      };
      
      console.log('Enviando aviso:', avisoData);
      
      // En una implementación real, aquí iría la llamada al API
      // const response = await fetch(`${API_BASE_URL}/api/avisos`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(avisoData)
      // });
      
      // Simulamos una respuesta exitosa
      setTimeout(() => {
        setSuccess('El aviso ha sido publicado correctamente');
        
        // Limpiar formulario
        setFormData({
          titulo: '',
          contenido: '',
          fechaExpiracion: '',
          prioridad: 'normal',
          destinatarios: 'todos'
        });
        
        setUsuariosSeleccionados([]);
        setIsSubmitting(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error al publicar aviso:', err);
      setError(err instanceof Error ? err.message : 'Error al publicar el aviso');
      setIsSubmitting(false);
    }
  };
  
  // Obtener la fecha mínima (hoy) para el campo de fecha
  const getFechaMinima = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  };
  
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Crear Aviso para {comunidadNombre}</h1>
      </div>
      
      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando datos...</p>
        </div>
      ) : (
        <div className={styles.formContainer}>
          {error && (
            <div className={styles.errorMessage}>
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className={styles.successMessage}>
              <p>{success}</p>
              <button 
                className={styles.buttonPrimary}
                onClick={() => window.location.href = '/dashboard/admin/avisos'}
              >
                Ver Todos los Avisos
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>Información del Aviso</h2>
              
              <div className={styles.formGroup}>
                <label htmlFor="titulo" className={styles.formLabel}>
                  Título <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  className={styles.formInput}
                  value={formData.titulo}
                  onChange={handleInputChange}
                  placeholder="Título del aviso"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="contenido" className={styles.formLabel}>
                  Contenido <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="contenido"
                  name="contenido"
                  className={styles.formTextarea}
                  value={formData.contenido}
                  onChange={handleInputChange}
                  placeholder="Escriba el contenido del aviso"
                  rows={6}
                  required
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="fechaExpiracion" className={styles.formLabel}>
                    Fecha de Expiración <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    id="fechaExpiracion"
                    name="fechaExpiracion"
                    className={styles.formInput}
                    value={formData.fechaExpiracion}
                    onChange={handleInputChange}
                    min={getFechaMinima()}
                    required
                  />
                  <p className={styles.inputHelp}>Fecha en que el aviso dejará de ser visible</p>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="prioridad" className={styles.formLabel}>
                    Prioridad <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="prioridad"
                    name="prioridad"
                    className={styles.formInput}
                    value={formData.prioridad}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="baja">Baja</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className={styles.formSection}>
              <h2 className={styles.formSectionTitle}>Destinatarios</h2>
              
              <div className={styles.formGroup}>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="destinatarios"
                      value="todos"
                      checked={formData.destinatarios === 'todos'}
                      onChange={handleInputChange}
                    />
                    <span>Todos los copropietarios</span>
                  </label>
                  
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="destinatarios"
                      value="seleccionados"
                      checked={formData.destinatarios === 'seleccionados'}
                      onChange={handleInputChange}
                    />
                    <span>Seleccionar destinatarios específicos</span>
                  </label>
                </div>
              </div>
              
              {formData.destinatarios === 'seleccionados' && (
                <div className={styles.formGroup}>
                  <div className={styles.userSelectionHeader}>
                    <p className={styles.selectLabel}>Seleccione los destinatarios:</p>
                    <div className={styles.selectActions}>
                      <button
                        type="button"
                        className={styles.buttonLink}
                        onClick={seleccionarTodos}
                      >
                        Seleccionar todos
                      </button>
                      <button
                        type="button"
                        className={styles.buttonLink}
                        onClick={deseleccionarTodos}
                      >
                        Deseleccionar todos
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.userSelectionGrid}>
                    {usuarios.length === 0 ? (
                      <p className={styles.emptyMessage}>No hay copropietarios disponibles</p>
                    ) : (
                      usuarios.map(usuario => (
                        <div 
                          key={usuario.id} 
                          className={`${styles.userCard} ${
                            usuariosSeleccionados.includes(usuario.id) ? styles.userCardSelected : ''
                          }`}
                          onClick={() => toggleUsuarioSeleccionado(usuario.id)}
                        >
                          <div className={styles.userAvatar}>
                            {usuario.nombreCompleto.substring(0, 2).toUpperCase()}
                          </div>
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>{usuario.nombreCompleto}</span>
                            <span className={styles.userEmail}>{usuario.email}</span>
                          </div>
                          <div className={styles.userCheckbox}>
                            <input
                              type="checkbox"
                              checked={usuariosSeleccionados.includes(usuario.id)}
                              onChange={() => {}} // El cambio se maneja en el onClick del div
                              onClick={e => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <p className={styles.inputHelp}>
                    {usuariosSeleccionados.length} usuario(s) seleccionado(s)
                  </p>
                </div>
              )}
            </div>
            
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={() => window.history.back()}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.buttonPrimary}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Publicando...' : 'Publicar Aviso'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 