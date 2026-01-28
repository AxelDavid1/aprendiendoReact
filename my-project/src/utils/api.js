// Función para obtener el token de autenticación
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Función para hacer llamadas autenticadas
export const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
};

// Para llamadas a APIs públicas (como universidades públicas)
export const publicFetch = async (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};