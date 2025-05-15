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
    // Ejemplo de consulta
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Conexión exitosa a la base de datos',
        data: rows
      })
    };
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Error al conectar con la base de datos',
        error: error.message
      })
    };
  }
}; 