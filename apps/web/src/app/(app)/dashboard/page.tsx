import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | LeadBoxAI'
};

const kpis = [
  { label: 'Nuevos leads', value: '328', trend: '+12%' },
  { label: 'Tiempo medio primera respuesta', value: '07m', trend: '-18%' },
  { label: 'Tasa conversión', value: '28%', trend: '+6%' }
];

const funnelStages = [
  { stage: 'Nuevo', value: 4200 },
  { stage: 'Contactado', value: 2800 },
  { stage: 'Cualificado', value: 1650 },
  { stage: 'En proceso', value: 860 },
  { stage: 'Ganado', value: 410 }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Resumen ejecutivo</h1>
        <p className="text-sm text-slate-400">
          Observa el rendimiento global del funnel, equipos y campañas activas.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-sm font-medium text-slate-400">{kpi.label}</h2>
            <p className="mt-3 text-3xl font-semibold text-white">{kpi.value}</p>
            <p className="mt-2 text-xs text-emerald-400">{kpi.trend} vs. semana anterior</p>
          </article>
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <article className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Embudo de captación</h2>
              <p className="text-xs text-slate-400">Leads y tasa de conversión por etapa</p>
            </div>
            <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold uppercase text-white">Tiempo real</span>
          </header>
          <ul className="space-y-3">
            {funnelStages.map((stage) => (
              <li key={stage.stage} className="flex items-center justify-between text-sm text-slate-200">
                <span>{stage.stage}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full bg-brand-500" style={{ width: `${(stage.value / funnelStages[0].value) * 100}%` }} />
                  </div>
                  <span className="font-mono text-xs text-slate-400">{stage.value.toLocaleString('es-ES')}</span>
                </div>
              </li>
            ))}
          </ul>
        </article>
        <article className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Alertas SLA</h2>
              <p className="text-xs text-slate-400">Hilos que requieren atención inmediata</p>
            </div>
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase text-amber-300">12 pendientes</span>
          </header>
          <ul className="space-y-3 text-sm text-slate-200">
            <li className="flex items-center justify-between">
              <span>Inbox Admisiones</span>
              <span className="font-mono text-xs text-red-300">8 SLA vencidos</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Campaña Becas 2024</span>
              <span className="font-mono text-xs text-amber-300">3 en riesgo</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Canal WhatsApp LATAM</span>
              <span className="font-mono text-xs text-emerald-300">1 resuelto</span>
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
}
