import { MatchCard } from "./MatchCard";
import { MatchInfo } from "@/lib/flashscore/getMatchesOfDay";

export function LeagueGroup({ leagueName, matches }: { leagueName: string; matches: MatchInfo[] }) {
  if (matches.length === 0) return null;

  return (
    <div className="mb-6 overflow-hidden border border-border/10 rounded-sm">
      <div className="flex items-center gap-3 px-4 py-2 bg-secondary/80 border-b border-border/10">
        {matches[0]?.leagueLogo && (
           <img 
             src={matches[0].leagueLogo} 
             alt="" 
             className="w-4 h-4 rounded-sm object-contain" 
             onError={(e) => {
               e.currentTarget.style.display = 'none';
             }}
           />
        )}
        <h2 className="text-xs font-black tracking-widest uppercase text-foreground/90">{leagueName}</h2>
      </div>
      <div className="flex flex-col">
        {matches.map((m) => (
          <MatchCard key={m.matchId} match={m} />
        ))}
      </div>
    </div>
  );
}
