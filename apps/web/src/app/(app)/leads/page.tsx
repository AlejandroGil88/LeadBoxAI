import { Metadata } from 'next';
import { serverApiFetch } from '../../../lib/api/server';

type Lead = {
  id: string;
  name: string;
  status: string;
  owner: string;
  source: string;
  score: number;
  tags: string[];
};

async function getLeads(): Promise<Lead[]> {
  try {
    return await serverApiFetch<Lead[]>('/leads');
  } catch (error) {
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Leads | LeadBoxAI'
};

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Leads</h1>
          <p className="text-sm text-slate-400">Gestiona leads por origen, campaña y SLA.</p>
        </div>
        <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-500">
          Nuevo lead
        </button>
      </header>
      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
          <thead className="bg-slate-900/60 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/40">
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  Aún no hay leads cargados. Importa CSV o conecta un formulario.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-800/60">
                <td className="px-4 py-3 font-medium text-white">{lead.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs capitalize text-slate-200">{lead.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-300">{lead.owner}</td>
                <td className="px-4 py-3 text-slate-300">{lead.source}</td>
                <td className="px-4 py-3 font-mono text-xs text-emerald-300">{lead.score}</td>
                <td className="px-4 py-3 text-slate-300">
                  <div className="flex flex-wrap gap-2">
                    {lead.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-brand-500/20 px-2 py-1 text-xs text-brand-100">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
