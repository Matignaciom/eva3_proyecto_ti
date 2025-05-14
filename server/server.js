/**
 * Script para iniciar el servidor Express para SIGEPA
 */

import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Intenta cargar variables de entorno
try {
  dotenv.config();
  console.log('Variables de entorno cargadas');
} catch (error) {
  console.log('No se pudieron cargar las variables de entorno:', error.message);
}

// Configuración básica
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sigepa_jwt_secret_key';

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Permitir ambos orígenes
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuración de la base de datos
const db = mysql.createPool({
  host: 'sigepa-db-id.cfy6uk6aipzc.us-east-1.rds.amazonaws.com',
  port: 3306,
  user: 'admin',
  password: '#SnKKerV!tH4gRf',
  database: 'sigepa_db',
  connectionLimit: 10
});

// Verificar conexión a la base de datos
db.getConnection()
  .then(connection => {
    console.log('✅ Conexión a la base de datos MySQL establecida correctamente');
    console.log('✅ Base de datos: sigepa_db');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error de conexión a la base de datos:', err);
  });

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
  // Obtener el token del encabezado Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
  }
  
  // El formato del token debe ser "Bearer <token>"
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Formato de token incorrecto' });
  }
  
  try {
    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Guardar la información del usuario en el objeto de solicitud
    req.usuario = decoded;
    
    // Continuar con la ejecución
    next();
  } catch (error) {
    console.error('Error al verificar token:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de SIGEPA funcionando correctamente' });
});

// Ruta para obtener las comunidades
app.get('/api/comunidades', async (req, res) => {
  try {
    const [comunidades] = await db.query('SELECT idComunidad, nombre FROM Comunidad ORDER BY nombre');
    
    console.log('Comunidades obtenidas:', comunidades.length);
    
    res.json({ comunidades });
  } catch (error) {
    console.error('Error al obtener comunidades:', error);
    res.status(500).json({ message: 'Error al obtener comunidades', error: error.message });
  }
});

// Ruta para verificar los usuarios (protegida con token)
app.get('/api/debug/usuarios', verificarToken, async (req, res) => {
  try {
    // Solo administradores pueden ver la lista de usuarios
    if (req.usuario.rol !== 'Administrador') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    
    const [usuarios] = await db.query('SELECT idUsuario, nombreCompleto, email, rol FROM Usuario LIMIT 10');
    console.log('Usuarios encontrados:', usuarios.length);
    res.json({ usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
});

// Ruta para probar la verificación de contraseña
app.post('/api/debug/verificar-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Verificando contraseña para:', email);
    
    // Verificar usuario
    const [usuarios] = await db.query('SELECT * FROM Usuario WHERE email = ?', [email]);
    
    if (usuarios.length === 0) {
      return res.json({ exists: false, message: 'Usuario no encontrado' });
    }
    
    // Verificar contraseña con SHA2
    const [passwordMatch] = await db.query(
      'SELECT * FROM Usuario WHERE email = ? AND contrasena = SHA2(?, 256)',
      [email, password]
    );
    
    res.json({
      exists: true,
      passwordMatch: passwordMatch.length > 0,
      usuario: {
        id: usuarios[0].idUsuario,
        nombre: usuarios[0].nombreCompleto,
        email: usuarios[0].email,
        rol: usuarios[0].rol
      }
    });
    
  } catch (error) {
    console.error('Error al verificar contraseña:', error);
    res.status(500).json({ message: 'Error al verificar contraseña', error: error.message });
  }
});

// Ruta de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Intento de login para:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
    }
    
    // Verificar usuario
    const [usuarios] = await db.query('SELECT * FROM Usuario WHERE email = ?', [email]);
    
    if (usuarios.length === 0) {
      console.log('Usuario no encontrado:', email);
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    
    const usuario = usuarios[0];
    
    // Verificar contraseña
    const [passwordMatch] = await db.query(
      'SELECT * FROM Usuario WHERE email = ? AND contrasena = SHA2(?, 256)',
      [email, password]
    );
    
    if (passwordMatch.length === 0) {
      console.log('Contraseña incorrecta para:', email);
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    
    console.log('Login exitoso para:', email);
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.idUsuario,
        email: usuario.email,
        rol: usuario.rol
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Enviar respuesta
    res.json({
      token,
      user: {
        id: usuario.idUsuario,
        email: usuario.email,
        nombreCompleto: usuario.nombreCompleto,
        rol: usuario.rol
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
  }
});

// Ruta de registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombreCompleto, email, password, rut, comunidad, rol } = req.body;
    console.log('Intento de registro para:', email);

    // Validar campos requeridos
    if (!nombreCompleto || !email || !password || !rut || !comunidad || !rol) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    // Verificar si el correo ya existe
    const [emailExists] = await db.query('SELECT idUsuario FROM Usuario WHERE email = ?', [email]);
    
    if (emailExists.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }
    
    // Obtener el ID de la comunidad
    const [comunidadFound] = await db.query('SELECT idComunidad FROM Comunidad WHERE nombre = ?', [comunidad]);
    
    if (comunidadFound.length === 0) {
      return res.status(400).json({ message: 'La comunidad seleccionada no existe' });
    }
    
    const idComunidad = comunidadFound[0].idComunidad;
    
    // Formatear el RUT para almacenarlo (eliminar puntos y guión)
    const rutWithoutFormat = rut.replace(/\./g, '').replace(/-/g, '');
    
    // Insertar el nuevo usuario
    const [result] = await db.query(
      `INSERT INTO Usuario (nombreCompleto, email, contrasena, rol, rut, rut_original, idComunidad) 
       VALUES (?, ?, SHA2(?, 256), ?, SHA2(?, 256), ?, ?)`,
      [nombreCompleto, email, password, rol, rutWithoutFormat, rut, idComunidad]
    );
    
    // Obtener el ID del usuario insertado
    const idUsuario = result.insertId;
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: idUsuario,
        email,
        rol
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Registro exitoso para:', email);
    
    // Enviar respuesta
    res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      user: {
        id: idUsuario,
        email,
        nombreCompleto,
        rol
      }
    });
    
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
  }
});

// Ruta para verificar token (útil para frontend)
app.get('/api/auth/verificar', verificarToken, (req, res) => {
  res.json({
    auth: true,
    user: {
      id: req.usuario.id,
      email: req.usuario.email,
      rol: req.usuario.rol
    }
  });
});

// Ruta para obtener datos de un usuario por ID
app.get('/api/usuarios/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el usuario autenticado es el mismo que se solicita o es un admin
    if (req.usuario.id != id && req.usuario.rol !== 'Administrador') {
      return res.status(403).json({ message: 'No tienes permiso para acceder a esta información' });
    }
    
    // Consultar datos del usuario
    const [usuarios] = await db.query(
      `SELECT u.idUsuario as id, u.nombreCompleto, u.email, u.rol, 
              c.idComunidad, c.nombre as comunidad, u.rut_original as rut, u.direccion
       FROM Usuario u
       JOIN Comunidad c ON u.idComunidad = c.idComunidad
       WHERE u.idUsuario = ?`,
      [id]
    );
    
    if (usuarios.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const usuario = usuarios[0];
    
    // Si el usuario es un copropietario, obtener sus parcelas
    if (usuario.rol === 'Copropietario') {
      const [parcelas] = await db.query(
        `SELECT idParcela, nombre, direccion, area, estado, 
                DATE_FORMAT(fechaAdquisicion, '%d/%m/%Y') as fechaAdquisicion,
                valorCatastral
         FROM Parcela 
         WHERE idUsuario = ?`,
        [id]
      );
      
      usuario.parcelas = parcelas;
      
      // Obtener estadísticas de pagos
      const [estadisticas] = await db.query(
        `SELECT 
          COUNT(DISTINCT gp.idGasto) as totalGastos,
          SUM(CASE WHEN gp.estado = 'Pagado' THEN 1 ELSE 0 END) as gastosPagados,
          SUM(CASE WHEN gp.estado = 'Pendiente' THEN 1 ELSE 0 END) as gastosPendientes,
          SUM(CASE WHEN gp.estado = 'Atrasado' THEN 1 ELSE 0 END) as gastosAtrasados
         FROM Parcela p
         LEFT JOIN GastoParcela gp ON p.idParcela = gp.idParcela
         WHERE p.idUsuario = ?
         GROUP BY p.idUsuario`,
        [id]
      );
      
      usuario.estadisticas = estadisticas.length > 0 ? estadisticas[0] : {
        totalGastos: 0,
        gastosPagados: 0,
        gastosPendientes: 0,
        gastosAtrasados: 0
      };
    }
    
    // Enviar respuesta
    res.json({ usuario });
    
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
  }
});

// Ruta para actualizar datos de perfil
app.put('/api/usuarios/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreCompleto, email, direccion } = req.body;
    
    console.log('Solicitud de actualización de perfil recibida:');
    console.log('ID:', id);
    console.log('Nombre completo:', nombreCompleto);
    console.log('Email:', email);
    console.log('Dirección:', direccion);
    
    // Verificar si el usuario autenticado es el mismo que se actualiza
    if (req.usuario.id != id) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar este usuario' });
    }
    
    // Validar campos requeridos
    if (!nombreCompleto || !email) {
      return res.status(400).json({ message: 'El nombre y correo son obligatorios' });
    }
    
    // Verificar si el correo ya está en uso por otro usuario
    const [emailExists] = await db.query(
      'SELECT idUsuario FROM Usuario WHERE email = ? AND idUsuario != ?',
      [email, id]
    );
    
    if (emailExists.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está en uso por otro usuario' });
    }
    
    // Antes de actualizar, obtener los datos actuales del usuario
    const [usuariosAntes] = await db.query(
      'SELECT nombreCompleto, email, direccion FROM Usuario WHERE idUsuario = ?',
      [id]
    );
    
    const usuarioAntes = usuariosAntes[0];
    console.log('Usuario antes de actualizar:', usuarioAntes);
    
    // Actualizar datos del usuario
    console.log(`Ejecutando UPDATE Usuario SET nombreCompleto = '${nombreCompleto}', email = '${email}', direccion = ${direccion !== undefined ? `'${direccion}'` : 'null'} WHERE idUsuario = ${id}`);
    
    await db.query(
      'UPDATE Usuario SET nombreCompleto = ?, email = ?, direccion = ? WHERE idUsuario = ?',
      [nombreCompleto, email, direccion || null, id]
    );
    
    // Consultar datos actualizados
    const [usuarios] = await db.query(
      `SELECT u.idUsuario as id, u.nombreCompleto, u.email, u.rol, 
              c.idComunidad, c.nombre as comunidad, u.rut_original as rut, u.direccion
       FROM Usuario u
       JOIN Comunidad c ON u.idComunidad = c.idComunidad
       WHERE u.idUsuario = ?`,
      [id]
    );
    
    const usuario = usuarios[0];
    console.log('Usuario después de actualizar:', usuario);
    
    // Enviar respuesta
    res.json({ 
      message: 'Perfil actualizado correctamente',
      usuario 
    });
    
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
  }
});

// Ruta para actualizar contraseña
app.put('/api/usuarios/:id/password', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { passwordActual, passwordNuevo } = req.body;
    
    // Verificar si el usuario autenticado es el mismo que se actualiza
    if (req.usuario.id != id) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar este usuario' });
    }
    
    // Validar campos requeridos
    if (!passwordActual || !passwordNuevo) {
      return res.status(400).json({ message: 'La contraseña actual y nueva son obligatorias' });
    }
    
    // Verificar contraseña actual
    const [passwordMatch] = await db.query(
      'SELECT idUsuario FROM Usuario WHERE idUsuario = ? AND contrasena = SHA2(?, 256)',
      [id, passwordActual]
    );
    
    if (passwordMatch.length === 0) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
    }
    
    // Actualizar contraseña
    await db.query(
      'UPDATE Usuario SET contrasena = SHA2(?, 256) WHERE idUsuario = ?',
      [passwordNuevo, id]
    );
    
    // Enviar respuesta
    res.json({ message: 'Contraseña actualizada correctamente' });
    
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
  }
});

// Ruta para obtener estadísticas de una comunidad (solo para administradores)
app.get('/api/comunidades/:id/estadisticas', verificarToken, async (req, res) => {
  try {
    const { id } = req.params; // ID de la comunidad
    
    // Verificar si el usuario es administrador
    if (req.usuario.rol !== 'Administrador') {
      return res.status(403).json({ message: 'No tienes permiso para acceder a esta información' });
    }
    
    // Verificar si el administrador pertenece a la comunidad solicitada
    const [admin] = await db.query(
      'SELECT idComunidad FROM Usuario WHERE idUsuario = ? AND rol = "Administrador"',
      [req.usuario.id]
    );
    
    if (admin.length === 0 || admin[0].idComunidad != id) {
      return res.status(403).json({ message: 'No tienes permiso para acceder a esta comunidad' });
    }
    
    // Obtener cantidad de copropietarios en la comunidad
    const [copropietariosCount] = await db.query(
      'SELECT COUNT(*) as total FROM Usuario WHERE idComunidad = ? AND rol = "Copropietario"',
      [id]
    );
    
    // Obtener cantidad de parcelas en la comunidad
    const [parcelasCount] = await db.query(
      'SELECT COUNT(*) as total FROM Parcela WHERE idComunidad = ?',
      [id]
    );
    
    // Obtener cantidad de gastos pendientes de la comunidad
    const [gastosPendientes] = await db.query(
      `SELECT COUNT(*) as total FROM GastoComun 
       WHERE idComunidad = ? AND estado = 'Pendiente' OR estado = 'Activo'`,
      [id]
    );
    
    // Obtener cantidad de notificaciones/avisos en la comunidad
    const [avisosCount] = await db.query(
      `SELECT COUNT(*) as total FROM Aviso 
       WHERE idComunidad = ? AND fechaExpiracion >= CURRENT_DATE()`,
      [id]
    );
    
    res.json({
      estadisticas: {
        copropietarios: copropietariosCount[0].total,
        parcelas: parcelasCount[0].total,
        gastosPendientes: gastosPendientes[0].total,
        avisos: avisosCount[0].total
      }
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas de la comunidad:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
  }
});

// Ruta para obtener todas las parcelas (filtradas por comunidad para administradores)
app.get('/api/parcelas', verificarToken, async (req, res) => {
  try {
    // Obtener el ID de la comunidad del usuario que hace la solicitud
    const [usuario] = await db.query(
      'SELECT idComunidad, rol FROM Usuario WHERE idUsuario = ?',
      [req.usuario.id]
    );
    
    if (usuario.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const { idComunidad, rol } = usuario[0];
    
    let query = '';
    let params = [];
    
    if (rol === 'Administrador') {
      // Si es administrador, obtener todas las parcelas de su comunidad
      query = `
        SELECT p.idParcela, p.nombre, p.direccion, p.area, p.estado, 
               DATE_FORMAT(p.fechaAdquisicion, '%d/%m/%Y') as fechaAdquisicion,
               p.valorCatastral, p.idUsuario,
               u.nombreCompleto as propietario
        FROM Parcela p
        JOIN Usuario u ON p.idUsuario = u.idUsuario
        WHERE p.idComunidad = ?
      `;
      params = [idComunidad];
    } else {
      // Si es copropietario, obtener solo sus parcelas
      query = `
        SELECT p.idParcela, p.nombre, p.direccion, p.area, p.estado, 
               DATE_FORMAT(p.fechaAdquisicion, '%d/%m/%Y') as fechaAdquisicion,
               p.valorCatastral, p.idUsuario,
               u.nombreCompleto as propietario
        FROM Parcela p
        JOIN Usuario u ON p.idUsuario = u.idUsuario
        WHERE p.idUsuario = ?
      `;
      params = [req.usuario.id];
    }
    
    const [parcelas] = await db.query(query, params);
    
    res.json({ parcelas });
  } catch (error) {
    console.error('Error al obtener parcelas:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
  }
});

// Añadir una nueva tabla para almacenar los RUTs en formato legible
(async () => {
  try {
    // Verificar si la columna rut_original existe
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'sigepa_db' 
      AND TABLE_NAME = 'Usuario' 
      AND COLUMN_NAME = 'rut_original'
    `);
    
    // Si la columna no existe, agregarla
    if (columns.length === 0) {
      console.log('La columna "rut_original" no existe en la tabla Usuario. Agregando...');
      
      await db.query(`
        ALTER TABLE Usuario
        ADD COLUMN rut_original VARCHAR(20) NULL
      `);
      
      console.log('Columna "rut_original" agregada correctamente a la tabla Usuario');
      
      // Actualizar los usuarios existentes con RUTs de ejemplo
      // Nota: En un entorno real, esto debería hacerse de otra manera
      // Esta es solo una solución temporal para desarrollo
      const [usuarios] = await db.query('SELECT idUsuario, email FROM Usuario');
      
      for (const usuario of usuarios) {
        // Generar un RUT ficticio formateado para usuarios existentes
        const randomNum = Math.floor(10000000 + Math.random() * 90000000);
        const dv = Math.floor(Math.random() * 10); // Dígito verificador de 0 a 9
        const rutFormateado = `${randomNum}-${dv}`;
        
        await db.query(
          'UPDATE Usuario SET rut_original = ? WHERE idUsuario = ?',
          [rutFormateado, usuario.idUsuario]
        );
        console.log(`RUT ficticio asignado a usuario ${usuario.email}: ${rutFormateado}`);
      }
    } else {
      console.log('La columna "rut_original" ya existe en la tabla Usuario');
    }
  } catch (error) {
    console.error('Error al verificar/agregar la columna rut_original:', error);
  }
})();

// Verificar si la columna 'direccion' existe en la tabla Usuario y agregarla si no existe
(async () => {
  try {
    // Verificar si la columna direccion existe
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'sigepa_db' 
      AND TABLE_NAME = 'Usuario' 
      AND COLUMN_NAME = 'direccion'
    `);
    
    // Si la columna no existe, agregarla
    if (columns.length === 0) {
      console.log('La columna "direccion" no existe en la tabla Usuario. Agregando...');
      
      await db.query(`
        ALTER TABLE Usuario
        ADD COLUMN direccion VARCHAR(255) NULL
      `);
      
      console.log('Columna "direccion" agregada correctamente a la tabla Usuario');
    } else {
      console.log('La columna "direccion" ya existe en la tabla Usuario');
    }
  } catch (error) {
    console.error('Error al verificar/agregar la columna direccion:', error);
  }
})();

// Ruta para obtener usuarios (filtrados por comunidad para administradores)
app.get('/api/usuarios', verificarToken, async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (req.usuario.rol !== 'Administrador') {
      return res.status(403).json({ message: 'No tienes permiso para acceder a esta información' });
    }
    
    // Obtener el ID de la comunidad del administrador
    const [admin] = await db.query(
      'SELECT idComunidad FROM Usuario WHERE idUsuario = ? AND rol = "Administrador"',
      [req.usuario.id]
    );
    
    if (admin.length === 0) {
      return res.status(403).json({ message: 'No se encontró información del administrador' });
    }
    
    const idComunidad = admin[0].idComunidad;
    
    // Obtener todos los usuarios de la comunidad del administrador
    const [usuarios] = await db.query(
      `SELECT u.idUsuario as id, u.nombreCompleto, u.email, u.rol, 
              u.rut_original as rut, u.direccion
       FROM Usuario u
       WHERE u.idComunidad = ?
       ORDER BY u.rol, u.nombreCompleto`,
      [idComunidad]
    );
    
    res.json({ usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
  }
});

// Ruta para obtener gastos comunes (filtrados por comunidad para administradores)
app.get('/api/gastos-comunes', verificarToken, async (req, res) => {
  try {
    // Obtener el ID de la comunidad del usuario que hace la solicitud
    const [usuario] = await db.query(
      'SELECT idComunidad, rol FROM Usuario WHERE idUsuario = ?',
      [req.usuario.id]
    );
    
    if (usuario.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const { idComunidad, rol } = usuario[0];
    
    // Verificar si el usuario es administrador
    if (rol !== 'Administrador') {
      return res.status(403).json({ message: 'No tienes permiso para acceder a esta información' });
    }
    
    // Obtener todos los gastos comunes de la comunidad del administrador
    const [gastos] = await db.query(
      `SELECT gc.idGasto, gc.concepto, gc.montoTotal, 
              DATE_FORMAT(gc.fechaVencimiento, '%d/%m/%Y') as fechaVencimiento,
              gc.tipo, gc.estado
       FROM GastoComun gc
       WHERE gc.idComunidad = ?
       ORDER BY gc.fechaVencimiento DESC`,
      [idComunidad]
    );
    
    res.json({ gastos });
  } catch (error) {
    console.error('Error al obtener gastos comunes:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
  }
});

// Ruta para obtener avisos (filtrados por comunidad)
app.get('/api/avisos', verificarToken, async (req, res) => {
  try {
    // Obtener el ID de la comunidad del usuario que hace la solicitud
    const [usuario] = await db.query(
      'SELECT idComunidad FROM Usuario WHERE idUsuario = ?',
      [req.usuario.id]
    );
    
    if (usuario.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const idComunidad = usuario[0].idComunidad;
    
    // Obtener todos los avisos vigentes de la comunidad
    const [avisos] = await db.query(
      `SELECT a.idAviso, a.titulo, a.contenido, 
              DATE_FORMAT(a.fechaPublicacion, '%d/%m/%Y') as fechaPublicacion,
              DATE_FORMAT(a.fechaExpiracion, '%d/%m/%Y') as fechaExpiracion,
              a.prioridad
       FROM Aviso a
       WHERE a.idComunidad = ? AND a.fechaExpiracion >= CURRENT_DATE()
       ORDER BY a.prioridad DESC, a.fechaPublicacion DESC`,
      [idComunidad]
    );
    
    res.json({ avisos });
  } catch (error) {
    console.error('Error al obtener avisos:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
}); 