const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
    get: async (endpoint, token = null) => {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers
        });
        return res;
    },

    post: async (endpoint, body, token = null) => {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });
        return res;
    },

    // Helper to standardise error handling if needed, but keeping raw response for now to match current usage
};
