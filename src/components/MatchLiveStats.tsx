import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatItem {
    name: string;
    home: string;
    away: string;
    homeValue: number;
    awayValue: number;
}

interface StatGroup {
    groupName: string;
    statisticsItems: StatItem[];
}

// Translation map for common stats
const statTranslations: Record<string, string> = {
    "Ball possession": "Posse de Bola",
    "Total shots": "Total de Chutes",
    "Shots on target": "Chutes no Alvo",
    "Shots off target": "Chutes para Fora",
    "Corner kicks": "Escanteios",
    "Offsides": "Impedimentos",
    "Fouls": "Faltas",
    "Yellow cards": "Cartões Amarelos",
    "Red cards": "Cartões Vermelhos",
    "Goalkeeper saves": "Defesas do Goleiro",
    "Passes": "Passes Totais",
    "Accurate passes": "Passes Certos",
    "Tackles": "Desarmes",
    "Big chances": "Grandes Chances",
    "Big chances missed": "Grandes Chances Perdidas",
    "Hit woodwork": "Bolas na Trave",
    "Counter attacks": "Contra-ataques",
    "Shots inside box": "Chutes dentro da área",
    "Shots outside box": "Chutes fora da área"
};

export function MatchLiveStats({ 
    statistics, 
    homeTeamName, 
    awayTeamName 
}: { 
    statistics: StatGroup[], 
    homeTeamName: string, 
    awayTeamName: string 
}) {
    const fullMatchStats = statistics[0]?.statisticsItems || [];
    if (fullMatchStats.length === 0) return null;

    return (
        <div className="border border-border/10 bg-secondary/5 rounded-sm overflow-hidden flex flex-col">
            <div className="bg-secondary/40 px-4 py-2 border-b border-border/10 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary truncate max-w-[120px]">{homeTeamName}</span>
                <span className="text-[9px] font-black text-muted-foreground/40">ESTATÍSTICAS LIVE</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 truncate max-w-[120px] text-right">{awayTeamName}</span>
            </div>

            <div className="p-4 bg-black/10 space-y-4">
                {fullMatchStats.map((stat, idx) => {
                    const name = statTranslations[stat.name] || stat.name;
                    const hVal = parseFloat(stat.home.replace('%', ''));
                    const aVal = parseFloat(stat.away.replace('%', ''));
                    const total = hVal + aVal;
                    const hPercent = total > 0 ? (hVal / total) * 100 : 50;

                    return (
                        <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-tighter">
                                <span className={hVal > aVal ? "text-primary font-black" : "text-muted-foreground/60"}>
                                    {stat.home}
                                </span>
                                <span className="text-[9px] text-muted-foreground/40 font-black tracking-widest">
                                    {name}
                                </span>
                                <span className={aVal > hVal ? "text-foreground font-black" : "text-muted-foreground/60"}>
                                    {stat.away}
                                </span>
                            </div>
                            <div className="flex w-full h-1.5 rounded-full overflow-hidden bg-black/40">
                                <div 
                                    className="bg-primary transition-all duration-700" 
                                    style={{ width: `${hPercent}%` }}
                                />
                                <div 
                                    className="bg-foreground/20 transition-all duration-700" 
                                    style={{ width: `${100 - hPercent}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
