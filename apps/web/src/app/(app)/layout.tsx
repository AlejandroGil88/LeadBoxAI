import Link from 'next/link';
import type { Route } from 'next';
import { PropsWithChildren } from 'react';
import { NavigationFilters } from '../../components/navigation-filters';

const routes: Array<{ href: Route; label: string }> = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/leads', label: 'Leads' },
  { href: '/inbox', label: 'Bandeja' },
  { href: '/campaigns', label: 'Campañas' }
];

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-950/80 p-4">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">LeadBoxAI</h1>
          <p className="mt-2 text-xs text-slate-400">WhatsApp CRM &amp; AI Assistant</p>
        </div>
        <nav className="flex-1 space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <NavigationFilters />
      </aside>
      <main className="flex-1 overflow-y-auto bg-slate-900/70 p-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">{children}</div>
      </main>
    </div>
  );
}
