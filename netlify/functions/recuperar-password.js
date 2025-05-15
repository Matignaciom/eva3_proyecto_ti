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
    const { email, verificationCode, newPassword } = JSON.parse(event.body);

    // Si solo se envía email, es la primera fase (enviar código)
    if (email && !verificationCode && !newPassword) {
      // Verificar si el email existe
      const user = await mysql.query(
        'SELECT idUsuario FROM Usuario WHERE email = ?',
        [email]
      );

      if (!user || user.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Email no encontrado' })
        };
      }

      // Generar código de verificación (6 dígitos)
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // En producción, aquí deberías:
      // 1. Guardar el código en la base de datos con una fecha de expiración
      // 2. Enviar el código por email
      
      // Por ahora, solo lo devolvemos en la respuesta
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'Código de verificación enviado',
          code // En producción, no enviar el código en la respuesta
        })
      };
    }

    // Si se envía código y nueva contraseña, es la fase de actualización
    if (verificationCode && newPassword) {
      // En producción, aquí deberías:
      // 1. Verificar que el código sea válido y no haya expirado
      // 2. Actualizar la contraseña

      // Hash de la nueva contraseña
      const hashedPassword = crypto
        .createHash('sha256')
        .update(newPassword)
        .digest('hex');

      // Actualizar contraseña
      await mysql.query(
        'UPDATE Usuario SET contrasena = ? WHERE email = ?',
        [hashedPassword, email]
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Contraseña actualizada correctamente' })
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Datos inválidos' })
    };

  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error interno del servidor' })
    };
  }
}; 