const pool = require('./db');

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  // Manejar preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Consulta para obtener comunidades y sus usuarios
    const query = `
      SELECT 
        c.idComunidad,
        c.nombre as nombreComunidad,
        COUNT(u.idUsuario) as totalUsuarios,
        SUM(CASE WHEN u.rol = 'Administrador' THEN 1 ELSE 0 END) as totalAdministradores,
        SUM(CASE WHEN u.rol = 'Copropietario' THEN 1 ELSE 0 END) as totalCopropietarios
      FROM Comunidad c
      LEFT JOIN Usuario u ON c.idComunidad = u.idComunidad
      GROUP BY c.idComunidad, c.nombre
    `;

    const [rows] = await pool.query(query);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Consulta exitosa',
        data: rows
      })
    };
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Error al consultar la base de datos',
        error: error.message
      })
    };
  }
}; 