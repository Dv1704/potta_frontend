const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Handle a 401 Unauthorized response — token expired or invalid.
 * Clears localStorage and redirects to /login.
 */
function handleUnauthorized() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    // Only redirect if not already on auth pages
    const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
    if (!publicPaths.some(p => window.location.pathname.startsWith(p))) {
        window.location.href = '/login';
    }
}

/**
 * Core fetch wrapper. Automatically attaches JWT from localStorage if not provided.
 * Intercepts 401 and forces logout/redirect.
 */
async function apiFetch(endpoint, options = {}) {
    const token = options.token ?? localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        handleUnauthorized();
    }

    return res;
}

export const api = {
    get: (endpoint, token = null) =>
        apiFetch(endpoint, { method: 'GET', token }),

    post: (endpoint, body, token = null) =>
        apiFetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            token,
        }),

    patch: (endpoint, body, token = null) =>
        apiFetch(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
            token,
        }),

    delete: (endpoint, token = null) =>
        apiFetch(endpoint, { method: 'DELETE', token }),
};

// Named export for direct use where raw fetch was used
export { apiFetch, API_URL };
