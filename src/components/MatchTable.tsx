import { MatchHistory } from "@/lib/flashscore/getMatchDetails";

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
    <div className="border border-border/10 rounded-sm overflow-hidden mb-6 bg-black/10">
      <div className="px-4 py-2 bg-secondary/40 border-b border-border/10 flex items-center justify-between">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground/70">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead className="bg-black/20 text-[9px] font-black uppercase text-muted-foreground/60">
                <tr>
                    <th className="px-4 py-2 font-black">DATA</th>
                    <th className="px-4 py-2 font-black">COMPETIÇÃO</th>
                    <th className="px-4 py-2 font-black">OPONENTE</th>
                    <th className="px-4 py-2 font-black text-center">RES</th>
                    <th className="px-4 py-2 font-black text-right">PLACAR</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border/5">
                {matches.map((m, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors h-9 group">
                        <td className="px-4 py-1.5 text-xs text-muted-foreground font-medium">{m.date}</td>
                        <td className="px-4 py-1.5 text-[10px] font-medium text-foreground/60 truncate max-w-[120px]">{m.competition}</td>
                        <td className="px-4 py-1.5 text-xs font-bold text-foreground/80 truncate max-w-[150px]">
                            {m.opponent} <span className="text-[9px] opacity-40 ml-1">{m.isHome ? "C" : "F"}</span>
                        </td>
                        <td className="px-4 py-1.5 text-center">
                            <div className={`
                                inline-flex items-center justify-center w-5 h-5 rounded-sm text-[10px] font-black
                                ${m.result === "V" ? "bg-green-600 text-white" : 
                                  m.result === "D" ? "bg-red-600 text-white" : 
                                  "bg-yellow-600 text-white"}
                            `}>
                                {m.result}
                            </div>
                        </td>
                        <td className="px-4 py-1.5 text-right font-black tabular-nums text-xs group-hover:text-primary transition-colors">
                            {m.score}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
