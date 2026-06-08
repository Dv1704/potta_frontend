import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
    }, []);

    // On mount: restore session from localStorage and validate token against server
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!storedToken) {
            setLoading(false);
            return;
        }

        // Restore optimistically so pages render immediately
        setToken(storedToken);
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch { /* ignore */ }
        }

        // Then validate against server — if 401, token is expired
        fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
        })
            .then(res => {
                if (res.status === 401) {
                    // Token expired or invalid — force logout
                    logout();
                    return null;
                }
                return res.json();
            })
            .then(userData => {
                if (userData) {
                    // Refresh user data from server (removes stale data / password leak)
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                }
            })
            .catch(() => {
                // Network error — keep session optimistically, let individual pages handle errors
            })
            .finally(() => {
                setLoading(false);
            });
    }, [logout]);

    const login = (authToken, userData) => {
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.id) {
            localStorage.setItem('userId', userData.id);
        }
    };

    /**
     * Re-fetch user profile from server and update context + localStorage.
     * Call this after balance changes, profile updates, etc.
     */
    const refreshUser = useCallback(async () => {
        const t = localStorage.getItem('token');
        if (!t) return;
        try {
            const res = await fetch(`${API_URL}/auth/profile`, {
                headers: { 'Authorization': `Bearer ${t}` }
            });
            if (res.status === 401) { logout(); return; }
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            }
        } catch { /* network error — ignore */ }
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
