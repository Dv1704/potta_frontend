import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';
// Remove trailing slashes if any to prevent connection issues
const sanitizedUrl = SOCKET_URL.replace(/\/$/, "");

export const socket = io(sanitizedUrl, {
    autoConnect: false,
    transports: ['websocket', 'polling'], // Allow polling as fallback
});

export const connectSocket = (userId) => {
    const token = localStorage.getItem('token');

    // Always update auth before connecting/reconnecting
    socket.auth = { token };
    socket.io.opts.query = { userId };

    if (socket.connected) {
        // Already connected — disconnect first so new auth takes effect
        socket.disconnect();
    }

    console.log('[Socket] Connecting to:', sanitizedUrl);
    socket.connect();
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
