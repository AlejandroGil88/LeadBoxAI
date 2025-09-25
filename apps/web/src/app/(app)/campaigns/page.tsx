import { Metadata } from 'next';
import { serverApiFetch } from '../../../lib/api/server';

type Campaign = {
  id: string;
  name: string;
  status: string;
  scheduleAt: string | null;
  stats: Record<string, number>;
};

async function getCampaigns(): Promise<Campaign[]> {
  try {
    return await serverApiFetch<Campaign[]>('/campaigns');
  } catch (error) {
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Campañas | LeadBoxAI'
};

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Campañas</h1>
          <p className="text-sm text-slate-400">
            Diseña campañas multilingües con opt-in y seguimiento granular.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500">
            Importar segmento
          </button>
          <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500">
            Nueva campaña
          </button>
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.length === 0 && (
          <article className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-sm text-slate-400">
            Aún no hay campañas. Crea una para enviar mensajes masivos con plantillas aprobadas.
          </article>
        )}
        {campaigns.map((campaign) => (
          <article key={campaign.id} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{campaign.name}</h2>
                <p className="text-xs text-slate-400">{campaign.scheduleAt ?? 'Enviar ahora'}</p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase text-slate-300">{campaign.status}</span>
            </header>
            <dl className="grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div>
                <dt className="text-slate-500">Entregados</dt>
                <dd className="text-lg font-semibold text-emerald-300">{campaign.stats.delivered ?? 0}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Leídos</dt>
                <dd className="text-lg font-semibold text-brand-200">{campaign.stats.read ?? 0}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Respondidos</dt>
                <dd className="text-lg font-semibold text-amber-300">{campaign.stats.replied ?? 0}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Conversiones</dt>
                <dd className="text-lg font-semibold text-white">{campaign.stats.converted ?? 0}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
