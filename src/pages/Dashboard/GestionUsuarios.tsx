import { useState, useEffect } from 'react';
import styles from './GestionUsuarios.module.css';

// API URL base
const API_BASE_URL = 'http://localhost:3000';

interface Usuario {
  id: number;
  nombreCompleto: string;
  email: string;
  rol: string;
  rut: string;
  direccion?: string;
  fechaCreacion?: string;
  ultimoAcceso?: string;
  estado?: 'Activo' | 'Inactivo';
}

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filtro, setFiltro] = useState('');
  const [filtroPor, setFiltroPor] = useState<'nombre' | 'email' | 'rut'>('nombre');
  const [ordenarPor, setOrdenarPor] = useState<'nombre' | 'email' | 'fechaCreacion'>('nombre');
  const [orden, setOrden] = useState<'asc' | 'desc'>('asc');
  const [idComunidad, setIdComunidad] = useState<number | null>(null);
  const [comunidadNombre, setComunidadNombre] = useState<string>('');
  
  // Estados para el modal de agregar usuario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombreCompleto: '',
    email: '',
    rut: '',
    password: '',
    confirmarPassword: '',
    rol: 'Copropietario',
    direccion: ''
  });
  const [modalError, setModalError] = useState('');
  
  // Estado para mostrar los detalles de un usuario
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  
  // Obtener usuarios de la comunidad del administrador
  useEffect(() => {
    const fetchUsuarios = async () => {
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
        
        // Obtener usuarios de la comunidad
        const usuariosResponse = await fetch(`${API_BASE_URL}/api/usuarios`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!usuariosResponse.ok) {
          throw new Error('Error al obtener la lista de usuarios');
        }
        
        const usuariosData = await usuariosResponse.json();
        
        // Asignar datos de usuarios
        setUsuarios(usuariosData.usuarios);
        
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los usuarios');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsuarios();
  }, []);
  
  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    if (!filtro) return true;
    
    const terminoBusqueda = filtro.toLowerCase();
    
    switch (filtroPor) {
      case 'nombre':
        return usuario.nombreCompleto.toLowerCase().includes(terminoBusqueda);
      case 'email':
        return usuario.email.toLowerCase().includes(terminoBusqueda);
      case 'rut':
        return usuario.rut.toLowerCase().includes(terminoBusqueda);
      default:
        return true;
    }
  });
  
  // Ordenar usuarios
  const usuariosOrdenados = [...usuariosFiltrados].sort((a, b) => {
    let valorA, valorB;
    
    switch (ordenarPor) {
      case 'nombre':
        valorA = a.nombreCompleto;
        valorB = b.nombreCompleto;
        break;
      case 'email':
        valorA = a.email;
        valorB = b.email;
        break;
      case 'fechaCreacion':
        valorA = a.fechaCreacion || '';
        valorB = b.fechaCreacion || '';
        break;
      default:
        valorA = a.nombreCompleto;
        valorB = b.nombreCompleto;
    }
    
    if (orden === 'asc') {
      return valorA.localeCompare(valorB);
    } else {
      return valorB.localeCompare(valorA);
    }
  });
  
  // Manejar cambios en el formulario de nuevo usuario
  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoUsuario({
      ...nuevoUsuario,
      [name]: value
    });
  };
  
  // Agregar un nuevo usuario
  const agregarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    
    // Validar campos
    if (!nuevoUsuario.nombreCompleto || !nuevoUsuario.email || !nuevoUsuario.rut || !nuevoUsuario.password) {
      setModalError('Todos los campos marcados con * son obligatorios');
      return;
    }
    
    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoUsuario.email)) {
      setModalError('El correo electrónico no es válido');
      return;
    }
    
    // Validar contraseña
    if (nuevoUsuario.password.length < 8) {
      setModalError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    // Validar que las contraseñas coincidan
    if (nuevoUsuario.password !== nuevoUsuario.confirmarPassword) {
      setModalError('Las contraseñas no coinciden');
      return;
    }
    
    // Aquí iría la llamada al API para registrar el usuario
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !idComunidad) {
        throw new Error('No hay información de autenticación');
      }
      
      // Crear objeto de datos para enviar al servidor
      const datosUsuario = {
        nombreCompleto: nuevoUsuario.nombreCompleto,
        email: nuevoUsuario.email,
        password: nuevoUsuario.password,
        rut: nuevoUsuario.rut,
        direccion: nuevoUsuario.direccion,
        rol: nuevoUsuario.rol,
        comunidad: comunidadNombre
      };
      
      // En una implementación real, aquí se enviarían los datos al servidor
      console.log('Enviando datos de nuevo usuario:', datosUsuario);
      
      // Simular éxito (en un caso real esto vendría del servidor)
      alert('Usuario creado correctamente');
      
      // Cerrar modal y limpiar formulario
      setMostrarModal(false);
      setNuevoUsuario({
        nombreCompleto: '',
        email: '',
        rut: '',
        password: '',
        confirmarPassword: '',
        rol: 'Copropietario',
        direccion: ''
      });
      
    } catch (err) {
      console.error('Error al crear usuario:', err);
      setModalError(err instanceof Error ? err.message : 'Error al crear el usuario');
    }
  };
  
  // Función para formatear RUT
  const formatearRut = (rut: string) => {
    if (!rut) return '';
    
    // Si ya tiene un guión, puede estar formateado
    if (rut.includes('-')) {
      return rut;
    }
    
    // Intentar dar formato a un RUT sin formato
    try {
      const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');
      const dv = rutLimpio.slice(-1);
      const rutNum = rutLimpio.slice(0, -1);
      
      return `${rutNum}-${dv}`;
    } catch (error) {
      return rut;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Gestión de Usuarios - {comunidadNombre}</h1>
        <div className={styles.pageActions}>
          <button
            className={styles.buttonPrimary}
            onClick={() => setMostrarModal(true)}
          >
            Agregar Usuario
          </button>
        </div>
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button 
            className={styles.buttonPrimary}
            onClick={() => window.location.reload()}
          >
            Intentar nuevamente
          </button>
        </div>
      )}
      
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label htmlFor="filtro" className={styles.filterLabel}>Buscar:</label>
          <input
            type="text"
            id="filtro"
            className={styles.filterInput}
            placeholder="Buscar usuarios..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <label htmlFor="filtroPor" className={styles.filterLabel}>Filtrar por:</label>
          <select
            id="filtroPor"
            className={styles.filterSelect}
            value={filtroPor}
            onChange={(e) => setFiltroPor(e.target.value as 'nombre' | 'email' | 'rut')}
          >
            <option value="nombre">Nombre</option>
            <option value="email">Email</option>
            <option value="rut">RUT</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label htmlFor="ordenarPor" className={styles.filterLabel}>Ordenar por:</label>
          <select
            id="ordenarPor"
            className={styles.filterSelect}
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value as 'nombre' | 'email' | 'fechaCreacion')}
          >
            <option value="nombre">Nombre</option>
            <option value="email">Email</option>
            <option value="fechaCreacion">Fecha de creación</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label htmlFor="orden" className={styles.filterLabel}>Orden:</label>
          <select
            id="orden"
            className={styles.filterSelect}
            value={orden}
            onChange={(e) => setOrden(e.target.value as 'asc' | 'desc')}
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando usuarios...</p>
        </div>
      ) : usuariosOrdenados.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <p>No se encontraron usuarios.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => {
                  setOrdenarPor('nombre');
                  setOrden(orden === 'asc' ? 'desc' : 'asc');
                }} className={styles.sortableHeader}>
                  Nombre
                  {ordenarPor === 'nombre' && (
                    <span className={orden === 'asc' ? styles.sortAsc : styles.sortDesc}>
                      ▲
                    </span>
                  )}
                </th>
                <th onClick={() => {
                  setOrdenarPor('email');
                  setOrden(orden === 'asc' ? 'desc' : 'asc');
                }} className={styles.sortableHeader}>
                  Email
                  {ordenarPor === 'email' && (
                    <span className={orden === 'asc' ? styles.sortAsc : styles.sortDesc}>
                      ▲
                    </span>
                  )}
                </th>
                <th>RUT</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosOrdenados.map(usuario => (
                <tr key={usuario.id} className={styles.tableRow}>
                  <td>{usuario.nombreCompleto}</td>
                  <td>{usuario.email}</td>
                  <td>{formatearRut(usuario.rut)}</td>
                  <td>
                    <span className={`${styles.badge} ${
                      usuario.rol === 'Administrador' ? styles.badgeAdmin : styles.badgeUser
                    }`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className={styles.actionCell}>
                    <button
                      className={styles.actionButton}
                      onClick={() => setUsuarioSeleccionado(usuario)}
                      title="Ver detalles"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </button>
                    <button
                      className={styles.actionButton}
                      title="Editar"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      title="Eliminar"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal para agregar usuario */}
      {mostrarModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Agregar Nuevo Usuario</h2>
              <button
                className={styles.modalClose}
                onClick={() => setMostrarModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={agregarUsuario}>
                {modalError && (
                  <div className={styles.formError}>
                    {modalError}
                  </div>
                )}
                
                <div className={styles.formGroup}>
                  <label htmlFor="nombreCompleto" className={styles.formLabel}>
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="nombreCompleto"
                    name="nombreCompleto"
                    className={styles.formInput}
                    value={nuevoUsuario.nombreCompleto}
                    onChange={handleModalInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={styles.formInput}
                    value={nuevoUsuario.email}
                    onChange={handleModalInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="rut" className={styles.formLabel}>
                    RUT *
                  </label>
                  <input
                    type="text"
                    id="rut"
                    name="rut"
                    className={styles.formInput}
                    value={nuevoUsuario.rut}
                    onChange={handleModalInputChange}
                    placeholder="12.345.678-9"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.formLabel}>
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={styles.formInput}
                    value={nuevoUsuario.password}
                    onChange={handleModalInputChange}
                    required
                  />
                  <p className={styles.inputHelp}>
                    Mínimo 8 caracteres
                  </p>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="confirmarPassword" className={styles.formLabel}>
                    Confirmar Contraseña *
                  </label>
                  <input
                    type="password"
                    id="confirmarPassword"
                    name="confirmarPassword"
                    className={styles.formInput}
                    value={nuevoUsuario.confirmarPassword}
                    onChange={handleModalInputChange}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="rol" className={styles.formLabel}>
                    Rol *
                  </label>
                  <select
                    id="rol"
                    name="rol"
                    className={styles.formInput}
                    value={nuevoUsuario.rol}
                    onChange={handleModalInputChange}
                    required
                  >
                    <option value="Copropietario">Copropietario</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="direccion" className={styles.formLabel}>
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    className={styles.formInput}
                    value={nuevoUsuario.direccion}
                    onChange={handleModalInputChange}
                  />
                </div>
                
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.buttonSecondary}
                    onClick={() => setMostrarModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={styles.buttonPrimary}
                  >
                    Agregar Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de detalles de usuario */}
      {usuarioSeleccionado && (
        <div className={styles.modalOverlay} onClick={() => setUsuarioSeleccionado(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalles del Usuario</h2>
              <button
                className={styles.modalClose}
                onClick={() => setUsuarioSeleccionado(null)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.userDetailsGrid}>
                <div className={styles.userDetailItem}>
                  <span className={styles.userDetailLabel}>Nombre:</span>
                  <span className={styles.userDetailValue}>{usuarioSeleccionado.nombreCompleto}</span>
                </div>
                <div className={styles.userDetailItem}>
                  <span className={styles.userDetailLabel}>Email:</span>
                  <span className={styles.userDetailValue}>{usuarioSeleccionado.email}</span>
                </div>
                <div className={styles.userDetailItem}>
                  <span className={styles.userDetailLabel}>RUT:</span>
                  <span className={styles.userDetailValue}>{formatearRut(usuarioSeleccionado.rut)}</span>
                </div>
                <div className={styles.userDetailItem}>
                  <span className={styles.userDetailLabel}>Rol:</span>
                  <span className={styles.userDetailValue}>
                    <span className={`${styles.badge} ${
                      usuarioSeleccionado.rol === 'Administrador' ? styles.badgeAdmin : styles.badgeUser
                    }`}>
                      {usuarioSeleccionado.rol}
                    </span>
                  </span>
                </div>
                <div className={styles.userDetailItem}>
                  <span className={styles.userDetailLabel}>Dirección:</span>
                  <span className={styles.userDetailValue}>
                    {usuarioSeleccionado.direccion || 'No especificada'}
                  </span>
                </div>
                {usuarioSeleccionado.fechaCreacion && (
                  <div className={styles.userDetailItem}>
                    <span className={styles.userDetailLabel}>Fecha de Registro:</span>
                    <span className={styles.userDetailValue}>{usuarioSeleccionado.fechaCreacion}</span>
                  </div>
                )}
                {usuarioSeleccionado.estado && (
                  <div className={styles.userDetailItem}>
                    <span className={styles.userDetailLabel}>Estado:</span>
                    <span className={styles.userDetailValue}>
                      <span className={`${styles.badge} ${
                        usuarioSeleccionado.estado === 'Activo' ? styles.badgeActive : styles.badgeInactive
                      }`}>
                        {usuarioSeleccionado.estado}
                      </span>
                    </span>
                  </div>
                )}
              </div>
              
              <div className={styles.modalFooter}>
                <button
                  className={styles.buttonSecondary}
                  onClick={() => setUsuarioSeleccionado(null)}
                >
                  Cerrar
                </button>
                <button
                  className={styles.buttonPrimary}
                >
                  Editar Usuario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 