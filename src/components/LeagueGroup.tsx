import { MatchCard } from "./MatchCard";
import { MatchInfo } from "@/lib/flashscore/getMatchesOfDay";
import { SafeImg } from "@/components/SafeImg";

export function LeagueGroup({ leagueName, matches }: { leagueName: string; matches: MatchInfo[] }) {
  if (matches.length === 0) return null;

  return (
    <div className="mb-2 overflow-hidden border border-border/10 rounded-sm">
      <div className="flex items-center gap-2 px-2 py-1 bg-secondary/80 border-b border-border/10">
        {matches[0]?.leagueLogo && (
           <SafeImg
             src={matches[0].leagueLogo}
             className="w-4 h-4 rounded-sm object-contain"
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
