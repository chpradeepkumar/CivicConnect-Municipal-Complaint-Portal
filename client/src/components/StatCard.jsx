const VARIANTS = {
  navy: 'text-navy-700 bg-navy-50',
  civic: 'text-civic-700 bg-civic-50',
  green: 'text-green-700 bg-green-50',
  amber: 'text-amber-700 bg-amber-50',
  red: 'text-red-700 bg-red-50',
  slate: 'text-slate-700 bg-slate-100',
};

export function StatCard({ label, value, icon: Icon, variant = 'navy', hint }) {
  return (
    <div className="card p-5 transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-navy-500">{label}</p>
        {Icon ? (
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${VARIANTS[variant]}`}>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-navy-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-navy-400">{hint}</p> : null}
    </div>
  );
}

export default StatCard;
