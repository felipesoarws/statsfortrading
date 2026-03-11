import { MatchHistory } from "@/lib/bolsadeaposta/getMatchDetails";
import { SafeImg } from "@/components/SafeImg";

export function MatchTable({
  title,
  matches,
}: {
  title: string;
  matches: MatchHistory[];
}) {
  if (matches.length === 0) {
    return (
      <div className="text-[10px] font-bold text-muted-foreground p-8 text-center border border-border/10 rounded-sm bg-secondary/5 uppercase tracking-widest">
        Sem histórico de confrontos disponível.
      </div>
    );
  }

  return (
    <div className="border border-border/10 rounded-sm overflow-hidden mb-2 bg-black/5 dark:bg-black/10">
      <div className="px-3 py-1.5 bg-secondary/40 border-b border-border/10 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground/80">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead className="bg-black/10 dark:bg-black/40 text-[10px] font-semibold text-muted-foreground/80">
                <tr>
                    <th className="px-3 py-1.5 font-semibold">Data</th>
                    <th className="px-3 py-1.5 font-semibold">Competição</th>
                    <th className="px-3 py-1.5 font-semibold text-center">Confronto</th>
                    <th className="px-3 py-1.5 font-semibold text-center">Res</th>
                    <th className="px-3 py-1.5 font-semibold text-center">Placar</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border/5">
                {matches.map((m, idx) => (
                    <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors h-8 group">
                        <td className="px-3 py-1 text-[10px] text-muted-foreground font-medium tabular-nums">{m.date || '-'}</td>
                        <td className="px-3 py-1 text-[10px] font-medium text-foreground/70 max-w-[150px] truncate">{m.competition || '-'}</td>
                        <td className="px-3 py-1">
                            <div className="flex items-center justify-center min-w-[200px]">
                                {/* Left Team */}
                                <div className="flex-1 flex items-center justify-end gap-2 truncate">
                                    <span className={`text-xs font-semibold truncate ${m.isHome ? 'text-primary' : 'text-foreground/80'}`}>
                                        {m.isHome ? "Casa" : (m.opponent || '-')}
                                    </span>
                                    <SafeImg 
                                        src={m.homeLogo?.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(m.homeLogo)}` : (m.homeLogo || '')} 
                                        className="w-4 h-4 object-contain shrink-0"
                                        alt=""
                                    />
                                </div>
                                
                                <div className="px-2 shrink-0 flex items-center justify-center">
                                    <span className="text-[9px] font-semibold text-muted-foreground/40 mx-1">x</span>
                                </div>

                                {/* Right Team */}
                                <div className="flex-1 flex items-center justify-start gap-2 truncate">
                                    <SafeImg 
                                        src={m.awayLogo?.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(m.awayLogo)}` : (m.awayLogo || '')} 
                                        className="w-4 h-4 object-contain shrink-0"
                                        alt=""
                                    />
                                    <span className={`text-xs font-semibold truncate ${!m.isHome ? 'text-secondary-foreground' : 'text-foreground/80'}`}>
                                        {!m.isHome ? "Fora" : (m.opponent || '-')}
                                    </span>
                                </div>
                            </div>
                        </td>
                        <td className="px-3 py-1 text-center">
                            <div className={`
                                inline-flex items-center justify-center w-6 h-6 rounded-sm text-[11px] font-bold shadow-sm
                                ${m.result === "V" ? "bg-green-500/10 text-green-600 dark:text-green-500" : 
                                m.result === "D" ? "bg-red-500/10 text-red-600 dark:text-red-500" : 
                                m.result === "E" ? "bg-amber-500/10 text-amber-600 dark:text-amber-500" :
                                "bg-black/5 dark:bg-white/5 text-muted-foreground"}
                            `}>
                                {m.result || '-'}
                            </div>
                        </td>
                        <td className="px-3 py-1 text-center font-semibold tabular-nums text-xs group-hover:text-primary transition-colors tracking-tighter">
                            {m.score || '-'}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
