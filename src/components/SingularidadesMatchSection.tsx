import { MatchHistory } from "@/lib/bolsadeaposta/getMatchDetails";
import { Activity, Trophy, Info } from "lucide-react";

interface Props {
  homeHistory: MatchHistory[];
  awayHistory: MatchHistory[];
  homeName: string;
  awayName: string;
  homeLogo?: string;
  awayLogo?: string;
  lay01Odd?: string;
}

export function SingularidadesMatchSection({ homeHistory, awayHistory, homeName, awayName, homeLogo, awayLogo, lay01Odd }: Props) {
    
    const home20 = homeHistory.slice(0, 20);
    const away20 = awayHistory.slice(0, 20);

    const calculateLay01Prob = (matches: MatchHistory[]) => {
        if (matches.length === 0) return 0;
        // Lay 0-1 means we win if the score is NOT 0-1. 
        // We look for matches where the result was NOT 0-1 (from focus team perspective).
        // Actually, Lay 0-1 is usually "The game will NOT end 0-1".
        const count01 = matches.filter(m => m.score === "0 - 1").length;
        return ((matches.length - count01) / matches.length) * 100;
    };

    const homeProb = calculateLay01Prob(home20);
    const awayProb = calculateLay01Prob(away20);

    return (
        <section className="animate-in fade-in slide-in-from-bottom duration-700 delay-300 xl:col-span-12 mt-12 mb-20 bg-primary/5 rounded-3xl p-8 border border-primary/20">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center p-2 backdrop-blur-md shadow-xl relative z-10 transition-transform group-hover:scale-110">
                            {homeLogo && <img src={homeLogo.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(homeLogo)}` : homeLogo} className="w-full h-full object-contain" alt="" />}
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center p-2 backdrop-blur-md shadow-xl relative z-0 transition-transform group-hover:scale-110">
                            {awayLogo && <img src={awayLogo.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(awayLogo)}` : awayLogo} className="w-full h-full object-contain" alt="" />}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-primary">Singularidades Lay 0-1</h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                            Rentabilidade nos últimos 20 jogos contra o placar exato de 0x1 {lay01Odd && `• ODD ATUAL: ${lay01Odd}`}
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-black/20 rounded-full border border-black/5 dark:border-white/5">
                    <Info className="w-3 h-3 text-primary/60" />
                    <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Baseado em Dados Históricos reais Bolsa</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Home Stats */}
                <div className="relative group p-6 bg-black/5 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5 hover:border-primary/30 transition-all duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Trophy className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-foreground/80">{homeName}</span>
                        </div>
                        <span className="text-sm font-black text-primary">{homeProb.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                        <div 
                            className="h-full bg-linear-to-r from-primary/40 to-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                            style={{ width: `${homeProb}%` }}
                        />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {home20.map((m, i) => (
                            <div key={i} className="group/item relative capitalize">
                                <div className={`w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/10 transition-all duration-300 hover:scale-150 ${m.score === "0 - 1" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"}`} />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/95 text-white text-[10px] rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-300 whitespace-nowrap z-50 pointer-events-none border border-white/10 shadow-2xl backdrop-blur-sm">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="font-black text-primary/80 tracking-widest uppercase">{m.date}</span>
                                        <span className="font-bold text-xs">{m.score}</span>
                                        <span className="text-[9px] text-muted-foreground/60 uppercase tracking-tighter">{m.competition}</span>
                                        <span className="text-[9px] font-black flex items-center gap-1.5 mt-1">
                                            <span className={m.isHome ? "text-primary" : "text-muted-foreground"}>{homeName}</span>
                                            <span className="text-foreground/20 dark:text-white/20">VS</span>
                                            <span className={!m.isHome ? "text-primary" : "text-muted-foreground"}>{m.opponent}</span>
                                        </span>
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/95" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Away Stats */}
                <div className="relative group p-6 bg-black/5 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5 hover:border-secondary/30 transition-all duration-500">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-secondary" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-foreground/80">{awayName}</span>
                        </div>
                        <span className="text-sm font-black text-secondary">{awayProb.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                        <div 
                            className="h-full bg-linear-to-r from-secondary/40 to-secondary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--secondary),0.3)]"
                            style={{ width: `${awayProb}%` }}
                        />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {away20.map((m, i) => (
                            <div key={i} className="group/item relative capitalize">
                                <div className={`w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/10 transition-all duration-300 hover:scale-150 ${m.score === "0 - 1" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"}`} />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/95 text-white text-[10px] rounded-lg opacity-0 group-hover/item:opacity-100 transition-all duration-300 whitespace-nowrap z-50 pointer-events-none border border-white/10 shadow-2xl backdrop-blur-sm">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="font-black text-secondary/80 tracking-widest uppercase">{m.date}</span>
                                        <span className="font-bold text-xs">{m.score}</span>
                                        <span className="text-[9px] text-muted-foreground/60 uppercase tracking-tighter">{m.competition}</span>
                                        <span className="text-[9px] font-black flex items-center gap-1.5 mt-1">
                                            <span className={m.isHome ? "text-secondary" : "text-muted-foreground"}>{awayName}</span>
                                            <span className="text-foreground/20 dark:text-white/20">VS</span>
                                            <span className={!m.isHome ? "text-secondary" : "text-muted-foreground"}>{m.opponent}</span>
                                        </span>
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/95" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
