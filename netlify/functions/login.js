const mysql = require('serverless-mysql')({
  config: {
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD
  }
});

const crypto = require('crypto');

exports.handler = async (event, context) => {
  // Solo permitir método POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Método no permitido' })
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    // Validar datos de entrada
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email y contraseña son requeridos' })
      };
    }

    // Hash de la contraseña
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    // Buscar usuario en la base de datos
    const user = await mysql.query(
      'SELECT idUsuario, nombreCompleto, email, rol, idComunidad FROM Usuario WHERE email = ? AND contrasena = ?',
      [email, hashedPassword]
    );

    if (!user || user.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Credenciales incorrectas' })
      };
    }

    // Generar token JWT (en producción usar una librería como jsonwebtoken)
    const token = crypto.randomBytes(32).toString('hex');

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        user: {
          id: user[0].idUsuario,
          nombreCompleto: user[0].nombreCompleto,
          email: user[0].email,
          rol: user[0].rol,
          idComunidad: user[0].idComunidad
        }
      })
    };

  } catch (error) {
    console.error('Error en login:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error interno del servidor' })
    };
  }
}; 