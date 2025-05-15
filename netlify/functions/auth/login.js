const pool = require('../db');
const crypto = require('crypto');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Método no permitido' })
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    // Validar que se proporcionaron las credenciales
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Email y contraseña son requeridos'
        })
      };
    }

    // Hash de la contraseña para comparar
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    // Consultar usuario
    const [users] = await pool.query(
      'SELECT idUsuario, nombreCompleto, email, rol, idComunidad FROM Usuario WHERE email = ? AND contrasena = ?',
      [email, hashedPassword]
    );

    if (users.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          message: 'Credenciales inválidas'
        })
      };
    }

    const user = users[0];

    // Generar token JWT (en producción usar una librería como jsonwebtoken)
    const token = crypto.randomBytes(32).toString('hex');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Login exitoso',
        user: {
          id: user.idUsuario,
          nombre: user.nombreCompleto,
          email: user.email,
          rol: user.rol,
          idComunidad: user.idComunidad
        },
        token
      })
    };
  } catch (error) {
    console.error('Error en login:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Error en el servidor',
        error: error.message
      })
    };
  }
}; 