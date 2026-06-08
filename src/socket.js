import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
// Remove trailing slashes if any to prevent connection issues
const sanitizedUrl = SOCKET_URL.replace(/\/$/, "");

export const socket = io(sanitizedUrl, {
    autoConnect: false,
    transports: ['websocket', 'polling'], // Allow polling as fallback
});

export const connectSocket = (userId) => {
    if (socket.connected) return;

    const token = localStorage.getItem('token');

    console.log('[Socket] Connecting to:', sanitizedUrl);

    // Pass both userId and JWT token for server-side authentication
    socket.io.opts.query = { userId };
    if (token) {
        socket.io.opts.auth = { token };
    }

    socket.connect();
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
