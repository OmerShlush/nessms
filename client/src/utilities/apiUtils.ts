const baseUrl = "/api/v1";

export const fetchWithAuth = async (url: string, options?: RequestInit): Promise<Response> => {
    // Get the token from wherever you store it (e.g., localStorage, Redux store)
    const token = localStorage.getItem('token'); // Implement this function to get the token
  
    const headers = token ? { ...options?.headers, Authorization: `Bearer ${token}` } : options?.headers;
  
    return await fetch(baseUrl + url, { ...options, headers });
  };

export const fetchWithoutAuth = async (url: string, options?: RequestInit): Promise<Response> => {
    // Get the token from wherever you store it (e.g., localStorage, Redux store)
  
    const headers = options?.headers;
  
    return await fetch(baseUrl + url, { ...options, headers });
};