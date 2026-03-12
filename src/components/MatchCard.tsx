import Link from "next/link";
import { MatchInfo } from "@/lib/flashscore/getMatchesOfDay";
import Image from "next/image";

export function MatchCard({ match }: { match: MatchInfo }) {
  const isFinished = match.status === 'FINISHED' || match.status === 'DONE';
  const isLive = match.status === 'LIVE' || match.status === 'INPLAY';


  return (
    <Link href={`/match/${match.matchId}`}>
      <div className="group relative flex items-center h-8 border-b border-border/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
        
        {/* Left Half */}
        <div className="flex-1 w-1/2 flex items-center justify-end pr-[36px] pl-2 h-full gap-2 truncate">
            {/* Time or Status */}
            <div className="w-10 shrink-0 flex items-center justify-start">
                {isLive ? (
                    <span className="text-[10px] font-black text-primary animate-pulse uppercase">
                        {match.liveTime || (match.status === 'Halftime' ? 'INT' : match.status)}
                    </span>
                ) : isFinished ? (
                    <div className="flex flex-col items-start gap-0.5">
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter leading-none mt-0.5">FIM</span>
                       <span className="text-[9px] font-medium text-muted-foreground/60 leading-none">{match.time}</span>
                    </div>
                ) : (
                    <span className="text-[10px] font-medium text-muted-foreground/80">{match.time}</span>
                )}
            </div>

            {/* Home Team */}
            <div className="flex-1 flex items-center justify-end gap-1.5 truncate">
              <span className={`text-xs truncate ${match.homeScore !== undefined && match.homeScore > (match.awayScore || 0) ? 'font-bold text-foreground' : 'font-medium text-foreground/70'}`}>
                {match.home}
              </span>
              {match.homeLogo && (
                <Image 
                  src={match.homeLogo.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(match.homeLogo)}` : match.homeLogo} 
                  alt="" 
                  className="w-4 h-4 object-contain opacity-80 shrink-0" 
                  width={16}
                  height={16}
                />
              )}
            </div>
        </div>

        {/* Center Score */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[60px] h-full flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 border-x border-border/5 z-10">
          {match.homeScore !== undefined && match.awayScore !== undefined ? (
            <div className="flex flex-col items-center">
              <span className={`text-[11px] font-black tracking-tighter ${
                isLive ? 'text-primary' : 
                isFinished ? (
                  match.homeScore > match.awayScore ? 'text-green-500' :
                  match.homeScore < match.awayScore ? 'text-red-500' :
                  'text-amber-500'
                ) : 'text-foreground/80'
              }`}>
                {match.homeScore} - {match.awayScore}
              </span>
              {(match.homePenalties !== undefined || match.awayPenalties !== undefined) && (
                <span className="text-[9px] font-black text-primary/90 -mt-1 leading-none">
                  ({match.homePenalties}-{match.awayPenalties})
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground/30 text-[10px]">-</span>
          )}
        </div>

        {/* Right Half */}
        <div className="flex-1 w-1/2 flex items-center justify-start pl-[36px] h-full">
            {/* Away Team */}
            <div className="flex-1 flex items-center justify-start gap-1.5 truncate">
              {match.awayLogo && (
                <Image 
                  src={match.awayLogo.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(match.awayLogo)}` : match.awayLogo} 
                  alt="" 
                  className="w-4 h-4 object-contain opacity-80 shrink-0" 
                  width={16}
                  height={16}
                />
              )}
              <span className={`text-xs truncate ${match.awayScore !== undefined && match.awayScore > (match.homeScore || 0) ? 'font-bold text-foreground' : 'font-medium text-foreground/70'}`}>
                {match.away}
              </span>
            </div>

            {/* Extras Container limits truncation via shrink-0 */}
            <div className="shrink-0 flex items-center h-full">
                {/* Volume (Only if greater than 0) */}
                {match.totalVolume !== undefined && match.totalVolume > 0 && (
                   <div className="px-2 flex items-center justify-center border-l border-border/5 h-full opacity-80 min-w-[50px]">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 tracking-tighter tabular-nums">
                         {match.totalVolume >= 1000 ? `R$ ${(match.totalVolume / 1000).toFixed(1)}k` : `R$ ${match.totalVolume.toFixed(0)}`}
                      </span>
                   </div>
                )}

                {/* Lay 0-1 Odd (Optional for Singularidades) */}
                {match.lay01Odd && (
                   <div className="w-12 flex items-center justify-center border-l border-border/5 h-full bg-primary/5">
                      <div className="flex flex-col items-center">
                         <span className="text-[8px] font-black text-primary/60 uppercase leading-none mb-0.5">LAY 0-1</span>
                         <span className="text-[10px] font-black text-primary tabular-nums tracking-tighter">{match.lay01Odd}</span>
                      </div>
                   </div>
                )}

                {/* No 0x0 Badge */}
                {match.isNoZeroZero && (
                   <div className="px-2 flex items-center justify-center border-l border-border/5 h-full bg-amber-500/5">
                      <div className="flex flex-col items-center">
                         <span className="text-[8px] font-black text-amber-600 dark:text-amber-500 uppercase leading-none">LAY 0-0</span>
                         <span className="text-[7px] font-bold text-amber-600/60 uppercase leading-none -mt-0.5">(20 J)</span>
                      </div>
                   </div>
                )}
            </div>
        </div>

      </div>
    </Link>
  );
}
