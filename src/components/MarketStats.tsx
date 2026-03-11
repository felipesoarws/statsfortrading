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
    <div className="border border-border/10 bg-secondary/5 rounded-sm overflow-hidden flex flex-col">
      <div className="bg-secondary/40 px-3 py-1.5 border-b border-border/10">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/50 text-center">
          {title}
        </h3>
      </div>
      <div className="p-3 bg-black/10 space-y-2.5">
        {markets.map((m, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase text-foreground/70 shrink-0">
              {m.label}
            </span>
            <div className="flex items-center gap-3 flex-1 justify-end pl-8">
              <div className="flex-1 max-w-[120px] bg-black/40 h-1.5 rounded-full overflow-hidden border border-border/5">
                <div 
                  className={`h-full transition-all duration-700 ${m.value > 60 ? 'bg-primary' : m.value > 40 ? 'bg-yellow-500' : 'bg-muted-foreground/30'}`}
                  style={{ width: `${m.value}%` }}
                />
              </div>
              <span className={`text-[10px] font-black w-8 text-right tabular-nums ${m.value > 60 ? 'text-primary' : m.value < 30 ? 'text-muted-foreground/30' : 'text-foreground'}`}>
                {m.value}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
