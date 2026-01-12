import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket'],
});

export const connectSocket = (userId) => {
    if (socket.connected) return;

    socket.io.opts.query = { userId };
    socket.connect();
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
