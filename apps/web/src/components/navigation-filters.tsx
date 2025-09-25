'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSidebarFilters } from '../lib/store/sidebar-filters';
import { filtersSchema, type FiltersSchema } from '../lib/validation/filters';

export function NavigationFilters() {
  const { filters, setFilters } = useSidebarFilters();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FiltersSchema>({
    defaultValues: filters,
    resolver: zodResolver(filtersSchema)
  });

  const onSubmit = handleSubmit((values) => {
    setFilters(values);
  });

  const onReset = () => {
    reset({
      channels: [],
      languages: [],
      slaBreachOnly: false
    });
    setFilters({ channels: [], languages: [], slaBreachOnly: false });
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="text-sm font-semibold text-white">Filtros rápidos</h2>
      <fieldset className="space-y-2 text-xs text-slate-300">
        <label className="block font-medium">Canales</label>
        <div className="flex flex-wrap gap-2">
          {['whatsapp', 'email', 'sms'].map((channel) => (
            <label key={channel} className="inline-flex items-center gap-2">
              <input type="checkbox" value={channel} className="h-4 w-4 rounded border-slate-700 bg-slate-800" {...register('channels')} />
              <span className="capitalize">{channel}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="space-y-2 text-xs text-slate-300">
        <label className="block font-medium">Idiomas</label>
        <div className="flex flex-wrap gap-2">
          {['es', 'en', 'pt'].map((lang) => (
            <label key={lang} className="inline-flex items-center gap-2">
              <input type="checkbox" value={lang} className="h-4 w-4 rounded border-slate-700 bg-slate-800" {...register('languages')} />
              <span className="uppercase">{lang}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-2 text-xs text-slate-300">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-800" {...register('slaBreachOnly')} />
        Mostrar solo SLA vencido
      </label>
      {(errors.channels || errors.languages) && (
        <p className="text-xs text-red-400">Revisa los filtros seleccionados.</p>
      )}
      <div className="flex gap-2">
        <button type="submit" className="flex-1 rounded-md bg-brand-600 px-3 py-2 text-xs font-semibold uppercase text-white transition hover:bg-brand-500">
          Aplicar
        </button>
        <button type="button" onClick={onReset} className="rounded-md border border-slate-700 px-3 py-2 text-xs font-semibold uppercase text-slate-200 transition hover:border-slate-500">
          Limpiar
        </button>
      </div>
    </form>
  );
}
