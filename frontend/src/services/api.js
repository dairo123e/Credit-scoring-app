const API_URL = '/api/mlp_demo';

export async function predecirRiesgo(payload) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'No se pudo obtener la prediccion');
  }

  return response.json();
}
