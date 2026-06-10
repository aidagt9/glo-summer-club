exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { imageBase64, imageMime } = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: imageMime, data: imageBase64 }
            },
            {
              type: 'text',
              text: `Analiza este ticket de compra y busca productos GLO (cigarrillos de tabaco calentado, dispositivos GLO, consumibles GLO, sticks, neostiks o similares de la marca GLO).

Responde SOLO en este formato JSON exacto, sin texto adicional:
{
  "es_ticket": true/false,
  "contiene_glo": true/false,
  "cantidad": número_entero,
  "productos_detectados": "descripción breve de qué productos GLO se ven",
  "confianza": "alta/media/baja",
  "nota": "observación breve si hay algo relevante"
}

Si no es un ticket, pon es_ticket: false y cantidad: 0.
Si es ticket pero no tiene productos GLO, pon contiene_glo: false y cantidad: 0.
Cuenta UNIDADES individuales (cajetillas/packs), no el precio ni el importe.`
            }
          ]
        }]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
