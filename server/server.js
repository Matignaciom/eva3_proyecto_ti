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
  host: '127.0.0.1',
  port: 3307,
  user: 'root',
  password: 'matias123',
  database: 'sigepa_db_schema',
  connectionLimit: 10
});

// Verificar conexión a la base de datos
db.getConnection()
  .then(connection => {
    console.log('✅ Conexión a la base de datos MySQL establecida correctamente');
    console.log('✅ Base de datos: sigepa_db_schema');
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
      `INSERT INTO Usuario (nombreCompleto, email, contrasena, rol, rut, idComunidad) 
       VALUES (?, ?, SHA2(?, 256), ?, SHA2(?, 256), ?)`,
      [nombreCompleto, email, password, rol, rutWithoutFormat, idComunidad]
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
}); 