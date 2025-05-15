import { useState, useEffect } from "react";
import styles from "./Perfil.module.css";

// Interfaz para el modelo de parcela
interface Parcela {
  idParcela: number;
  nombre: string;
  direccion: string;
  area: number;
  estado: "Al día" | "Pendiente" | "Atrasado";
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
    nombreCompleto: "",
    email: "",
    rut: "",
    direccion: "",
    comunidad: "",
    rol: "",
  });

  const [formData, setFormData] = useState({
    nombreCompleto: "",
    email: "",
    direccion: "",
    passwordActual: "",
    passwordNuevo: "",
    passwordConfirm: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Estados para controlar la visibilidad de las contraseñas
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [showPasswordNuevo, setShowPasswordNuevo] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Estados para determinar el rol del usuario
  const [isAdmin, setIsAdmin] = useState(false);

  // Estadísticas de la comunidad para administradores
  const [estadisticasComunidad, setEstadisticasComunidad] =
    useState<EstadisticasComunidad>({
      copropietarios: 0,
      parcelas: 0,
      gastosPendientes: 0,
      avisos: 0,
    });

  // Definir la URL base del servidor API (fuera de los métodos)
  const API_BASE_URL = "http://localhost:3000";

  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null,
  );

  // Efecto para el temporizador de redirección
  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0) {
      window.location.href = "/login";
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
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        // Verificar si hay información de autenticación
        if (!token || !userId) {
          console.error("No hay token o ID de usuario en localStorage");
          setMessage({
            type: "error",
            text: "No se pudo encontrar la información de autenticación. Por favor, inicia sesión nuevamente.",
          });
          setIsLoading(false);
          return;
        }

        // Verificar que el ID de usuario sea un número
        const userIdNum = parseInt(userId, 10);
        if (isNaN(userIdNum) || userIdNum <= 0) {
          console.error("ID de usuario inválido:", userId);
          setMessage({
            type: "error",
            text: "El ID de usuario almacenado no es válido. Por favor, inicia sesión nuevamente.",
          });
          setIsLoading(false);
          return;
        }

        console.log(
          `Intentando obtener datos del usuario ${userId} desde ${API_BASE_URL}/api/usuarios/${userId}`,
        );

        // Realizar la solicitud al backend para obtener datos del usuario
        const response = await fetch(`${API_BASE_URL}/api/usuarios/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error(
            "Respuesta de error del servidor:",
            response.status,
            errorData,
          );

          if (response.status === 404) {
            console.error("Usuario no encontrado. ID:", userId);

            // Limpiar la información de autenticación
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userName");
            localStorage.removeItem("userRole");

            throw new Error(
              "Usuario no encontrado. La sesión será cerrada automáticamente.",
            );
          } else if (response.status === 401) {
            // Limpiar la información de autenticación
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userName");
            localStorage.removeItem("userRole");

            throw new Error(
              "Sesión expirada. Por favor, inicie sesión nuevamente.",
            );
          } else {
            throw new Error(
              `Error al obtener datos del usuario (${response.status}).`,
            );
          }
        }

        let data;
        try {
          data = await response.json();
          console.log("Datos del usuario recibidos:", data);
        } catch (e) {
          console.error("Error al parsear la respuesta JSON:", e);
          throw new Error("Error al procesar la respuesta del servidor.");
        }

        if (!data || !data.usuario) {
          console.error("Datos de usuario incompletos:", data);
          throw new Error(
            "La respuesta del servidor no contiene información del usuario.",
          );
        }

        const userData = data.usuario;

        // Actualizar estados
        setUsuario(userData);
        setFormData({
          nombreCompleto: userData.nombreCompleto,
          email: userData.email,
          direccion: userData.direccion || "",
          passwordActual: "",
          passwordNuevo: "",
          passwordConfirm: "",
        });

        // Determinar si es administrador
        setIsAdmin(userData.rol === "Administrador");

        // Si es administrador, cargar estadísticas de la comunidad
        if (userData.rol === "Administrador" && userData.idComunidad) {
          try {
            const estadisticasResponse = await fetch(
              `${API_BASE_URL}/api/comunidades/${userData.idComunidad}/estadisticas`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            if (estadisticasResponse.ok) {
              const estadisticasData = await estadisticasResponse.json();
              console.log(
                "Estadísticas de comunidad recibidas:",
                estadisticasData,
              );

              if (estadisticasData && estadisticasData.estadisticas) {
                setEstadisticasComunidad(estadisticasData.estadisticas);
              }
            } else {
              console.error(
                "Error al obtener estadísticas de la comunidad:",
                estadisticasResponse.status,
              );
            }
          } catch (error) {
            console.error(
              "Error al cargar estadísticas de la comunidad:",
              error,
            );
          }
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);

        // Si el error menciona "sesión será cerrada", redirigir a login después de un retraso
        if (
          error instanceof Error &&
          error.message.includes("sesión será cerrada")
        ) {
          setMessage({
            type: "error",
            text: error.message,
          });

          // Iniciar la redirección
          startRedirect(5);
        } else {
          setMessage({
            type: "error",
            text:
              error instanceof Error
                ? error.message
                : "No se pudieron cargar los datos del perfil.",
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
    if (name === "direccion") {
      console.log(`Actualizando dirección: "${value}"`);
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Manejador para guardar cambios en los datos personales
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({
        type: "error",
        text: "El correo electrónico no es válido.",
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Obtener el token y el ID del usuario desde localStorage
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        throw new Error("No hay token o ID de usuario en localStorage");
      }

      // Mostrar los datos que se enviarán al servidor
      console.log("Datos que se enviarán al servidor:");
      console.log("nombreCompleto:", formData.nombreCompleto);
      console.log("email:", formData.email);
      console.log("direccion:", formData.direccion);

      console.log(
        `Actualizando perfil del usuario ${userId} en ${API_BASE_URL}/api/usuarios/${userId}`,
      );

      // Realizar la solicitud al backend para actualizar datos
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombreCompleto: formData.nombreCompleto,
          email: formData.email,
          direccion: formData.direccion,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(
          "Respuesta de error del servidor al actualizar perfil:",
          response.status,
          errorData,
        );

        if (response.status === 404) {
          throw new Error("Usuario no encontrado.");
        } else if (response.status === 401) {
          throw new Error(
            "Sesión expirada. Por favor, inicie sesión nuevamente.",
          );
        } else if (response.status === 400) {
          throw new Error(
            "Datos inválidos. Verifique la información proporcionada.",
          );
        } else {
          throw new Error(`Error al actualizar perfil (${response.status}).`);
        }
      }

      let data;
      try {
        data = await response.json();
        console.log("Respuesta completa de actualización de perfil:", data);
        console.log("Datos del usuario recibidos del servidor:", data.usuario);
        console.log("Dirección recibida del servidor:", data.usuario.direccion);
      } catch (e) {
        console.error(
          "Error al parsear la respuesta JSON al actualizar perfil:",
          e,
        );
        throw new Error("Error al procesar la respuesta del servidor.");
      }

      if (!data || !data.usuario) {
        console.error("Datos de respuesta incompletos:", data);
        throw new Error(
          "La respuesta del servidor no contiene la información actualizada.",
        );
      }

      // Crear una copia del usuario actualizado asegurándonos de que todos los campos estén definidos
      const usuarioActualizado = {
        ...data.usuario,
        direccion: data.usuario.direccion || "", // Asegurarnos de que direccion nunca sea undefined
      };

      console.log("Estado actual del usuario antes de actualizar:", usuario);

      // Actualizar el estado del usuario con la respuesta del servidor
      setUsuario(usuarioActualizado);

      // El log inmediato después de setUsuario no mostrará el estado actualizado debido a que
      // las actualizaciones de estado en React son asíncronas

      // Actualizar formData para mantener sincronizados los datos
      setFormData({
        ...formData,
        nombreCompleto: usuarioActualizado.nombreCompleto,
        email: usuarioActualizado.email,
        direccion: usuarioActualizado.direccion,
      });

      // Verificar que la actualización se aplicó correctamente usando un efecto secundario
      // para asegurarnos de que el estado se ha actualizado
      setTimeout(() => {
        console.log(
          "Estado del usuario después de actualizar (después de timeout):",
          {
            ...usuario,
            // Mostrar los valores específicos que nos interesan
            nombreCompleto: usuario.nombreCompleto,
            email: usuario.email,
            direccion: usuario.direccion,
          },
        );
      }, 500);

      console.log("Datos actualizados correctamente:", {
        nombre: usuarioActualizado.nombreCompleto,
        email: usuarioActualizado.email,
        direccion: usuarioActualizado.direccion,
      });

      // Actualizar datos en localStorage si cambió el email
      if (formData.email !== usuario.email) {
        localStorage.setItem("userEmail", formData.email);
      }

      // Si cambió el nombre
      if (formData.nombreCompleto !== usuario.nombreCompleto) {
        localStorage.setItem("userName", formData.nombreCompleto);
      }

      setIsEditing(false);
      setMessage({
        type: "success",
        text: "Perfil actualizado correctamente.",
      });

      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Error al actualizar perfil",
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
      setMessage({ type: "error", text: "La contraseña actual no es válida." });
      return;
    }

    // Validar que la nueva contraseña sea segura
    if (formData.passwordNuevo.length < 8) {
      setMessage({
        type: "error",
        text: "La nueva contraseña debe tener al menos 8 caracteres.",
      });
      return;
    }

    // Validar que la contraseña contenga al menos una letra mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(formData.passwordNuevo)) {
      setMessage({
        type: "error",
        text: "La contraseña debe contener al menos una letra mayúscula, una minúscula y un número.",
      });
      return;
    }

    if (formData.passwordNuevo !== formData.passwordConfirm) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Obtener el token y el ID del usuario desde localStorage
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        throw new Error("No hay token o ID de usuario en localStorage");
      }

      console.log(`Cambiando contraseña del usuario ${userId}`);

      // Realizar la solicitud al backend para cambiar contraseña
      const response = await fetch(
        `${API_BASE_URL}/api/usuarios/${userId}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            passwordActual: formData.passwordActual,
            passwordNuevo: formData.passwordNuevo,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error(
          "Respuesta de error al cambiar contraseña:",
          response.status,
          errorData,
        );

        if (response.status === 400) {
          throw new Error("La contraseña actual es incorrecta.");
        } else if (response.status === 401) {
          throw new Error(
            "Sesión expirada. Por favor, inicie sesión nuevamente.",
          );
        } else {
          throw new Error(`Error al cambiar contraseña (${response.status}).`);
        }
      }

      let data;
      try {
        data = await response.json();
        console.log("Respuesta de cambio de contraseña:", data);
      } catch (e) {
        console.error(
          "Error al parsear la respuesta JSON al cambiar contraseña:",
          e,
        );
        throw new Error("Error al procesar la respuesta del servidor.");
      }

      // Limpiar campos de contraseña
      setFormData({
        ...formData,
        passwordActual: "",
        passwordNuevo: "",
        passwordConfirm: "",
      });

      // Restablecer estados de visibilidad
      setShowPasswordActual(false);
      setShowPasswordNuevo(false);
      setShowPasswordConfirm(false);

      setIsChangingPassword(false);
      setMessage({
        type: "success",
        text: "Contraseña actualizada correctamente.",
      });

      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Error al cambiar contraseña",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    console.log("Cancelando edición, restaurando datos originales:", {
      nombreOriginal: usuario.nombreCompleto,
      emailOriginal: usuario.email,
      direccionOriginal: usuario.direccion || "No especificada",
    });

    setFormData({
      ...formData,
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      direccion: usuario.direccion || "",
    });

    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  // Cancelar cambio de contraseña
  const handleCancelPasswordChange = () => {
    setFormData({
      ...formData,
      passwordActual: "",
      passwordNuevo: "",
      passwordConfirm: "",
    });

    // Restablecer estados de visibilidad
    setShowPasswordActual(false);
    setShowPasswordNuevo(false);
    setShowPasswordConfirm(false);

    setIsChangingPassword(false);
    setMessage({ type: "", text: "" });
  };

  // Función para formatear el valor monetario
  const formatMoney = (amount: number): string => {
    return amount.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Función para obtener la clase de estado según el estado de la parcela
  const getEstadoClass = (estado: string): string => {
    switch (estado) {
      case "Al día":
        return styles.estadoAlDia;
      case "Pendiente":
        return styles.estadoPendiente;
      case "Atrasado":
        return styles.estadoAtrasado;
      default:
        return "";
    }
  };

  // Función para formatear un RUT en formato chileno
  const formatRut = (rut: string): string => {
    // Si está vacío o no disponible
    if (!rut) {
      return "No disponible";
    }

    // Si ya tiene un guión, puede estar formateado, pero asegurémonos
    if (rut.includes("-")) {
      // Separar en dos partes: número y dígito verificador
      const [numPart, dvPart] = rut.split("-");

      // Limpiar puntos del número si existen
      const numClean = numPart.replace(/\./g, "");

      // Formatear número con puntos (formato chileno)
      let formattedNum = "";
      let counter = 0;

      for (let i = numClean.length - 1; i >= 0; i--) {
        if (counter === 3) {
          formattedNum = "." + formattedNum;
          counter = 0;
        }
        formattedNum = numClean[i] + formattedNum;
        counter++;
      }

      return `${formattedNum}-${dvPart}`;
    }

    // Si es un hash (muy largo), mostramos "No disponible"
    if (rut.length > 20) {
      return "No disponible";
    }

    // Asumimos que es un número sin formato, aplicamos formato chileno
    try {
      // Obtener el dígito verificador (último carácter)
      const dv = rut.slice(-1);

      // Obtener la parte numérica
      const numPart = rut.slice(0, -1).replace(/\D/g, "");

      // Formatear con puntos (de derecha a izquierda)
      let rutFormateado = "";
      let counter = 0;

      for (let i = numPart.length - 1; i >= 0; i--) {
        if (counter === 3) {
          rutFormateado = "." + rutFormateado;
          counter = 0;
        }
        rutFormateado = numPart[i] + rutFormateado;
        counter++;
      }

      return `${rutFormateado}-${dv}`;
    } catch (error) {
      console.error("Error al formatear RUT:", error);
      return rut || "No disponible"; // Devolver sin cambios o indicar no disponible
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Mi Perfil</h1>
      </div>

      {message.text && (
        <div
          className={`${styles.messageBox} ${message.type === "error" ? styles.errorMessage : styles.successMessage}`}
        >
          {message.text}
          {redirectCountdown !== null && (
            <div className={styles.redirectNotice}>
              <p>
                Serás redirigido al inicio de sesión en {redirectCountdown}{" "}
                segundos...
              </p>
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
              <p>
                Tu sesión ha sido cerrada debido a un problema de autenticación.
              </p>
              <p>
                Serás redirigido a la página de inicio de sesión en{" "}
                <strong>{redirectCountdown}</strong> segundos.
              </p>
              <div className={styles.formActions}>
                <button
                  className={styles.buttonPrimary}
                  onClick={() => (window.location.href = "/login")}
                >
                  Ir a inicio de sesión ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : !usuario.id && message.type === "error" ? (
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
                  onClick={() => (window.location.href = "/login")}
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
                {usuario.nombreCompleto
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
              <div className={styles.profileInfo}>
                <h2 className={styles.profileName}>{usuario.nombreCompleto}</h2>
                <p className={styles.profileRole}>{usuario.rol}</p>
              </div>
            </div>

            <div className={`${styles.profileSection} ${styles.centeredSection}`}>
              <h3 className={styles.sectionTitle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Información Personal
              </h3>

              {isEditing ? (
                <form onSubmit={handleSaveProfile}>
                  <div className={styles.formGroup}>
                    <label
                      htmlFor="nombreCompleto"
                      className={styles.formLabel}
                    >
                      Nombre Completo
                    </label>
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
                    <label htmlFor="email" className={styles.formLabel}>
                      Correo Electrónico
                    </label>
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
                    <label htmlFor="direccion" className={styles.formLabel}>
                      Dirección (opcional)
                    </label>
                    <input
                      type="text"
                      id="direccion"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      className={styles.formInput}
                    />
                  </div>

                  <div
                    className={`${styles.formActions} ${styles.responsiveFormActions} ${styles.centeredFormActions}`}
                  >
                    <button
                      type="button"
                      className={`${styles.buttonSecondary} ${styles.responsiveButton}`}
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`${styles.buttonPrimary} ${styles.responsiveButton}`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className={styles.buttonSpinner}></div>
                          Guardando...
                        </>
                      ) : (
                        "Guardar Cambios"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  className={`${styles.profileDetails} ${styles.responsiveProfileDetails} ${styles.centeredProfileDetails}`}
                >
                  <div
                    className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                  >
                    <span className={styles.detailLabel}>Nombre Completo</span>
                    <span className={styles.detailValue}>
                      {usuario.nombreCompleto}
                    </span>
                  </div>
                  <div
                    className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                  >
                    <span className={styles.detailLabel}>RUT</span>
                    <span className={styles.detailValue}>
                      {formatRut(usuario.rut)}
                    </span>
                  </div>
                  <div
                    className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                  >
                    <span className={styles.detailLabel}>
                      Correo Electrónico
                    </span>
                    <span className={styles.detailValue}>{usuario.email}</span>
                  </div>
                  <div
                    className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                  >
                    <span className={styles.detailLabel}>Dirección</span>
                    <span className={styles.detailValue}>
                      {usuario.direccion || "—"}
                    </span>
                  </div>
                  <div
                    className={`${styles.detailRow} ${styles.responsiveDetailRow}`}
                  >
                    <span className={styles.detailLabel}>Comunidad</span>
                    <span className={styles.detailValue}>
                      {usuario.comunidad}
                    </span>
                  </div>
                  <div
                    className={`${styles.formActions} ${styles.responsiveFormActions} ${styles.centeredFormActions}`}
                  >
                    <button
                      className={`${styles.buttonPrimary} ${styles.responsiveButton}`}
                      onClick={() => setIsEditing(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "8px"}}>
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                      Editar Información
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={`${styles.profileSection} ${styles.centeredSection}`}>
              <h3 className={styles.sectionTitle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Cambiar Contraseña
              </h3>

              {isChangingPassword ? (
                <form onSubmit={handleChangePassword}>
                  <div className={styles.formGroup}>
                    <label
                      htmlFor="passwordActual"
                      className={styles.formLabel}
                    >
                      Contraseña Actual
                    </label>
                    <div className={styles.passwordInputContainer}>
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
                        title={showPasswordActual ? "Ocultar contraseña" : "Mostrar contraseña"}
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
                    <label htmlFor="passwordNuevo" className={styles.formLabel}>
                      Nueva Contraseña
                    </label>
                    <div className={styles.passwordInputContainer}>
                      <input
                        type={showPasswordNuevo ? "text" : "password"}
                        id="passwordNuevo"
                        name="passwordNuevo"
                        value={formData.passwordNuevo}
                        onChange={handleInputChange}
                        className={styles.formInput}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPasswordNuevo(!showPasswordNuevo)}
                        title={showPasswordNuevo ? "Ocultar contraseña" : "Mostrar contraseña"}
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
                    <div className={styles.passwordRequirements}>
                      <p>La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número</p>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label
                      htmlFor="passwordConfirm"
                      className={styles.formLabel}
                    >
                      Confirmar Contraseña
                    </label>
                    <div className={styles.passwordInputContainer}>
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
                        title={showPasswordConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
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

                  <div
                    className={`${styles.formActions} ${styles.responsiveFormActions} ${styles.centeredFormActions}`}
                  >
                    <button
                      type="button"
                      className={`${styles.buttonSecondary} ${styles.responsiveButton}`}
                      onClick={handleCancelPasswordChange}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`${styles.buttonPrimary} ${styles.responsiveButton}`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className={styles.buttonSpinner}></div>
                          Cambiando...
                        </>
                      ) : (
                        "Cambiar Contraseña"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  className={`${styles.formActions} ${styles.responsiveFormActions} ${styles.centeredFormActions}`}
                >
                  <button
                    className={`${styles.buttonSecondary} ${styles.responsiveButton}`}
                    onClick={() => setIsChangingPassword(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "8px"}}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Cambiar Contraseña
                  </button>
                </div>
              )}
            </div>
          </div>

          {usuario.parcelas && usuario.parcelas.length > 0 && (
            <div
              className={`${styles.profileCard} ${styles.responsiveProfileCard}`}
            >
              <div className={styles.profileSection}>
                <h3 className={styles.sectionTitle}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  Mis Parcelas
                </h3>
                <div className={styles.responsiveTableWrapper}>
                  <table
                    className={`${styles.responsiveTable} ${styles.parcelasTable}`}
                  >
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Dirección</th>
                        <th>Área (m²)</th>
                        <th>Estado</th>
                        <th>Valor catastral</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuario.parcelas.map((parcela) => (
                        <tr key={parcela.idParcela}>
                          <td data-label="Nombre">{parcela.nombre}</td>
                          <td data-label="Dirección">{parcela.direccion}</td>
                          <td data-label="Área">{parcela.area} m²</td>
                          <td data-label="Estado">
                            <span
                              className={`${styles.statusBadge} ${getEstadoClass(parcela.estado)}`}
                            >
                              {parcela.estado}
                            </span>
                          </td>
                          <td data-label="Valor Catastral">
                            {formatMoney(parcela.valorCatastral)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {usuario.estadisticas && (
            <div
              className={`${styles.profileCard} ${styles.responsiveProfileCard}`}
            >
              <div className={styles.profileSection}>
                <h3 className={styles.sectionTitle}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="20" x2="12" y2="10"></line>
                    <line x1="18" y1="20" x2="18" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="16"></line>
                  </svg>
                  Resumen Financiero
                </h3>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div
                      className={styles.statIcon}
                      style={{
                        backgroundColor: "rgba(79, 70, 229, 0.1)",
                        color: "#4f46e5",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    </div>
                    <div className={styles.statInfo}>
                      <h4 className={styles.statTitle}>Total de gastos</h4>
                      <p className={styles.statValue}>
                        {formatMoney(usuario.estadisticas.totalGastos)}
                      </p>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div
                      className={styles.statIcon}
                      style={{
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        color: "#10b981",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div className={styles.statInfo}>
                      <h4 className={styles.statTitle}>Pagados</h4>
                      <p className={styles.statValue}>
                        {formatMoney(usuario.estadisticas.gastosPagados)}
                      </p>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div
                      className={styles.statIcon}
                      style={{
                        backgroundColor: "rgba(245, 158, 11, 0.1)",
                        color: "#f59e0b",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <div className={styles.statInfo}>
                      <h4 className={styles.statTitle}>Pendientes</h4>
                      <p className={styles.statValue}>
                        {formatMoney(usuario.estadisticas.gastosPendientes)}
                      </p>
                    </div>
                  </div>
                  <div className={styles.statCard}>
                    <div
                      className={styles.statIcon}
                      style={{
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        color: "#ef4444",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <div className={styles.statInfo}>
                      <h4 className={styles.statTitle}>Atrasados</h4>
                      <p className={styles.statValue}>
                        {formatMoney(usuario.estadisticas.gastosAtrasados)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
