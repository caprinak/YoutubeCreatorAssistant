const STATUS_STYLES: Record<string, { badge: string; columnBorder: string; columnHeader: string; cardBorder: string }> = {
  RESEARCHING: {
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    columnBorder: 'border-violet-500/40 bg-violet-500/5',
    columnHeader: 'text-violet-300 bg-violet-500/10',
    cardBorder: 'hover:border-violet-500/50',
  },
  PLANNING: {
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    columnBorder: 'border-amber-500/40 bg-amber-500/5',
    columnHeader: 'text-amber-300 bg-amber-500/10',
    cardBorder: 'hover:border-amber-500/50',
  },
  IN_PROGRESS: {
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    columnBorder: 'border-sky-500/40 bg-sky-500/5',
    columnHeader: 'text-sky-300 bg-sky-500/10',
    cardBorder: 'hover:border-sky-500/50',
  },
  COMPLETED: {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    columnBorder: 'border-emerald-500/40 bg-emerald-500/5',
    columnHeader: 'text-emerald-300 bg-emerald-500/10',
    cardBorder: 'hover:border-emerald-500/50',
  },
};

const FALLBACK = {
  badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  columnBorder: 'border-slate-500/40 bg-slate-500/5',
  columnHeader: 'text-slate-300 bg-slate-500/10',
  cardBorder: 'hover:border-slate-500/50',
};

export function statusBadge(status: string): string {
  return STATUS_STYLES[status]?.badge ?? FALLBACK.badge;
}

export function columnBorder(status: string): string {
  const s = STATUS_STYLES[status] ?? FALLBACK;
  return `flex-1 min-w-0 flex flex-col rounded-2xl border p-4 ${s.columnBorder}`;
}

export function columnHeader(status: string): string {
  return STATUS_STYLES[status]?.columnHeader ?? FALLBACK.columnHeader;
}

export function cardBorder(status: string): string {
  return STATUS_STYLES[status]?.cardBorder ?? FALLBACK.cardBorder;
}
