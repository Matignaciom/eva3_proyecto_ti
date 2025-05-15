const pool = require('./db');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
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
    const body = JSON.parse(event.body);
    const { nombre } = body;

    // Insertar una nueva comunidad
    const [result] = await pool.query(
      'INSERT INTO Comunidad (nombre) VALUES (?)',
      [nombre]
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'Comunidad creada exitosamente',
        idComunidad: result.insertId
      })
    };
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Error al crear la comunidad',
        error: error.message
      })
    };
  }
}; 