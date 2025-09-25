'use client';

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getRealtimeClient() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_REALTIME_URL ?? 'http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true
    });
  }
  return socket;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }

  return response.json() as Promise<T>;
}
