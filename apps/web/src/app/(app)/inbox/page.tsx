'use client';

import { useEffect, useState } from 'react';
import { getRealtimeClient, apiFetch } from '../../../lib/api/client';

export default function InboxPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThread, setSelectedThread] = useState<any | null>(null);

  useEffect(() => {
    apiFetch<any[]>('/conversations?limit=20')
      .then(setThreads)
      .catch(() => setThreads([]));

    const socket = getRealtimeClient();
    socket.on('conversation.updated', (payload) => {
      setThreads((prev) => {
        const index = prev.findIndex((thread) => thread.id === payload.id);
        if (index === -1) {
          return [payload, ...prev];
        }
        const clone = [...prev];
        clone[index] = { ...clone[index], ...payload };
        return clone;
      });
    });

    return () => {
      socket.off('conversation.updated');
    };
  }, []);

  return (
    <div className="grid h-full grid-cols-[340px,1fr,320px] gap-4">
      <aside className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
        <header className="flex items-center justify-between border-b border-slate-800 p-4">
          <div>
            <h1 className="text-lg font-semibold text-white">Inbox</h1>
            <p className="text-xs text-slate-400">Unificado por contacto y canal</p>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
            {threads.length}
          </span>
        </header>
        <ul className="flex-1 divide-y divide-slate-800 overflow-auto">
          {threads.map((thread) => (
            <li
              key={thread.id}
              className={`cursor-pointer px-4 py-3 text-sm transition hover:bg-slate-800/60 ${
                selectedThread?.id === thread.id ? 'bg-slate-800/60' : ''
              }`}
              onClick={() => setSelectedThread(thread)}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">{thread.contact?.name ?? 'Sin nombre'}</p>
                <span className="text-[10px] uppercase text-slate-500">{thread.channel}</span>
              </div>
              <p className="mt-1 truncate text-xs text-slate-400">{thread.lastMessage}</p>
            </li>
          ))}
        </ul>
      </aside>
      <section className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
        {selectedThread ? (
          <>
            <header className="flex items-center justify-between border-b border-slate-800 p-4">
              <div>
                <h2 className="text-base font-semibold text-white">{selectedThread.contact?.name}</h2>
                <p className="text-xs text-slate-400">{selectedThread.contact?.phone}</p>
              </div>
              <button className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-slate-500">
                Traducir
              </button>
            </header>
            <div className="flex-1 space-y-4 overflow-auto p-4 text-sm">
              {selectedThread.messages?.map((message: any) => (
                <article
                  key={message.id}
                  className={`max-w-lg rounded-lg border border-slate-800/60 p-3 ${
                    message.direction === 'out' ? 'ml-auto bg-brand-600/30' : 'bg-slate-800/40'
                  }`}
                >
                  <p className="text-slate-200">{message.body}</p>
                  {message.body_original && (
                    <p className="mt-2 text-xs text-slate-400">Original: {message.body_original}</p>
                  )}
                </article>
              ))}
            </div>
            <footer className="space-y-3 border-t border-slate-800 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Plantilla: Onboarding Inicial ES</span>
                <button className="rounded-md border border-slate-700 px-3 py-1 text-[11px] font-semibold uppercase text-slate-200">
                  IA: redactar borrador
                </button>
              </div>
              <textarea
                className="h-24 w-full rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-100"
                placeholder="Escribe una respuesta con variables {{nombre}}..."
              />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-800" />
                  Auto traducir al idioma del contacto
                </label>
                <button className="rounded-md bg-brand-600 px-4 py-2 text-xs font-semibold uppercase text-white hover:bg-brand-500">
                  Enviar
                </button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
            Selecciona un hilo para ver el timeline.
          </div>
        )}
      </section>
      <aside className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div>
          <h2 className="text-base font-semibold text-white">Ficha del contacto</h2>
          {selectedThread ? (
            <ul className="mt-3 space-y-1 text-xs text-slate-300">
              <li>Estado lead: {selectedThread.leadStatus ?? 'Nuevo'}</li>
              <li>Idioma preferido: {selectedThread.contact?.locale ?? 'es'}</li>
              <li>Última interacción: {selectedThread.updatedAt}</li>
            </ul>
          ) : (
            <p className="mt-2 text-xs text-slate-500">Selecciona un contacto para ver detalles.</p>
          )}
        </div>
        <div className="space-y-2 text-xs text-slate-300">
          <h3 className="font-semibold text-white">Automatizaciones activas</h3>
          <ul className="space-y-1">
            <li>→ Recordatorio 24h sin respuesta</li>
            <li>→ Escalado a Manager si SLA 2h</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
