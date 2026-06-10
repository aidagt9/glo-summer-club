export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { imageBase64, imageMime } = body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: imageMime || 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: `Analiza este ticket de compra. Busca productos de la marca GLO o relacionados: GLO, Neo, Neostik, Neo Classic, Neo Sticks, cartones Neo, sticks de tabaco calentado, dispositivos GLO Hyper, GLO Pro, GLO Sens, o cualquier producto Neo/GLO de tabaco calentado.

Es un ticket valido si ves cualquier factura, recibo o comprobante de compra.

Responde SOLO este JSON exacto sin ningun texto adicional ni markdown:
{"es_ticket":true,"contiene_glo":true,"cantidad":1,"productos_detectados":"descripcion breve","confianza":"alta","nota":""}

Si no es ticket: {"es_ticket":false,"contiene_glo":false,"cantidad":0,"productos_detectados":"","confianza":"alta","nota":"no es ticket"}
Si es ticket sin productos GLO/Neo: {"es_ticket":true,"contiene_glo":false,"cantidad":0,"productos_detectados":"otros productos","confianza":"alta","nota":"sin productos GLO"}

IMPORTANTE: Neo Classic, Neo Sticks, cartones Neo, son productos GLO. Cuenta las UNIDADES (no el precio).` }
          ]
        }]
      })
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
