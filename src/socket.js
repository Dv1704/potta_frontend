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

    console.log('[Socket] Connecting to:', sanitizedUrl);


    socket.io.opts.query = { userId };
    socket.connect();
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
