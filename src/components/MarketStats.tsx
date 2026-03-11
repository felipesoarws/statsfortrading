import { MarketStats as IMarketStats } from "@/lib/flashscore/getMatchDetails";

interface Props {
  title: string;
  stats: IMarketStats;
}

export function MarketStats({ title, stats }: Props) {
  const markets = [
    { label: "Over 0.5", value: stats.over05 },
    { label: "Over 1.5", value: stats.over15 },
    { label: "Over 2.5", value: stats.over25 },
    { label: "Ambas Marcam", value: stats.btts },
    { label: "Under 2.5", value: stats.under25 },
    { label: "Under 1.5", value: stats.under15 },
    { label: "Under 0.5", value: stats.under05 },
  ];

  return (
    <div className="border border-border/10 bg-secondary/5 rounded-sm overflow-hidden flex flex-col shadow-sm">
      <div className="bg-secondary/40 px-3 py-1.5 border-b border-border/10">
        <h3 className="text-xs font-semibold text-foreground/70 text-center">
          {title}
        </h3>
      </div>
      <div className="p-2 py-3 bg-black/5 space-y-2">
        {markets.map((m, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground/80 shrink-0">
              {m.label}
            </span>
            <div className="flex items-center gap-2 flex-1 justify-end pl-4">
              <div className="flex-1 max-w-[100px] bg-black/10 dark:bg-black/40 h-1.5 rounded-full overflow-hidden border border-border/10">
                <div 
                  className={`h-full transition-all duration-700 ${
                    m.value >= 70 ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.3)]' : 
                    m.value >= 40 ? 'bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.3)]' : 
                    'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.3)]'
                  }`}
                  style={{ width: `${m.value}%` }}
                />
              </div>
              <span className={`text-xs font-semibold w-8 text-right tabular-nums ${
                m.value >= 70 ? 'text-green-600 dark:text-green-500' : 
                m.value >= 40 ? 'text-yellow-600 dark:text-yellow-500' : 
                'text-red-600 dark:text-red-500'
              }`}>
                {m.value}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
