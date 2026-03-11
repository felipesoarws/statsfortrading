import Link from "next/link";
import { MatchInfo } from "@/lib/flashscore/getMatchesOfDay";

export function MatchCard({ match }: { match: MatchInfo }) {
  const isLive = match.status && (match.status !== 'Not started' && match.status !== 'Ended' && match.status !== 'Scheduled' && match.status !== 'Postponed' && match.status !== 'Canceled');
  const isFinished = match.status === 'Ended';

  return (
    <Link href={`/match/${match.matchId}`}>
      <div className="group flex items-center h-10 border-b border-border/10 hover:bg-white/5 transition-colors cursor-pointer px-4">
        {/* Time or Status */}
        <div className="w-16 shrink-0 flex items-center justify-center">
            {isLive ? (
                <span className="text-[10px] font-black text-primary animate-pulse uppercase">
                    {match.liveTime || (match.status === 'Halftime' ? 'INT' : match.status)}
                </span>
            ) : isFinished ? (
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">FIM</span>
            ) : (
                <span className="text-[10px] font-medium text-muted-foreground/80">{match.time}</span>
            )}
        </div>

        {/* Home Team */}
        <div className="flex-1 flex items-center justify-end gap-2 truncate pr-4">
          <span className={`text-xs truncate ${match.homeScore !== undefined && match.homeScore > (match.awayScore || 0) ? 'font-bold text-foreground' : 'font-medium text-foreground/70'}`}>
            {match.home}
          </span>
          {match.homeLogo && <img src={match.homeLogo} alt="" className="w-4 h-4 object-contain opacity-80" loading="lazy" />}
        </div>

        {/* Score */}
        <div className="px-3 shrink-0 flex flex-col items-center justify-center bg-white/5 h-full border-x border-border/5 min-w-[60px]">
          {match.homeScore !== undefined && match.awayScore !== undefined ? (
            <>
              <span className={`text-xs font-black tracking-tighter ${isLive ? 'text-primary' : 'text-foreground'}`}>
                {match.homeScore} - {match.awayScore}
              </span>
              {(match.homePenalties !== undefined || match.awayPenalties !== undefined) && (
                <span className="text-[8px] font-bold text-muted-foreground/60 -mt-1">
                  (PEN {match.homePenalties || 0}-{match.awayPenalties || 0})
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground/30 text-[10px]">-</span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex items-center justify-start gap-2 truncate pl-4">
          {match.awayLogo && <img src={match.awayLogo} alt="" className="w-4 h-4 object-contain opacity-80" loading="lazy" />}
          <span className={`text-xs truncate ${match.awayScore !== undefined && match.awayScore > (match.homeScore || 0) ? 'font-bold text-foreground' : 'font-medium text-foreground/70'}`}>
            {match.away}
          </span>
        </div>
      </div>
    </Link>
  );
}
