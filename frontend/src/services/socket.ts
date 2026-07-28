import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '../types/socket';

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> => {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000';
    socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket']
    });
  }

  return socket;
};
