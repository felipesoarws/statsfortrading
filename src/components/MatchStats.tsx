import { MatchDetails } from "@/lib/bolsadeaposta/getMatchDetails";
import { Trophy } from "lucide-react";
import { SafeImg } from "./SafeImg";

export function MatchStats({ details }: { details: MatchDetails }) {
  return (
    <div className="space-y-6 mb-8">
      {/* Probabilidades da Comunidade */}
      {details.probabilities && (
        <div className="border border-border/10 bg-secondary/5 rounded-sm overflow-hidden flex flex-col shadow-sm">
          <div className="bg-secondary/40 px-4 py-2 border-b border-border/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/50 text-center">
              TENDÊNCIA DA COMUNIDADE
            </h3>
          </div>
          <div className="p-6 bg-black/20">
            <div className="flex w-full h-8 rounded-sm overflow-hidden bg-black/40 shadow-inner">
              <div 
                className="bg-primary flex items-center justify-center text-xs font-black text-white transition-opacity hover:opacity-80 shadow-[inset_-1px_0_0_rgba(0,0,0,0.2)]" 
                style={{ width: `${details.probabilities.home}%` }}
              >
                {details.probabilities.home}%
              </div>
              <div 
                className="bg-muted-foreground/30 flex items-center justify-center text-xs font-black text-white border-x border-black/20" 
                style={{ width: `${details.probabilities.draw}%` }}
              >
                {details.probabilities.draw}%
              </div>
              <div 
                className="bg-foreground/20 flex items-center justify-center text-xs font-black text-white hover:opacity-80 transition-opacity shadow-[inset_1px_0_0_rgba(0,0,0,0.2)]" 
                style={{ width: `${details.probabilities.away}%` }}
              >
                {details.probabilities.away}%
              </div>
            </div>
            <div className="flex justify-between mt-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
              <div className="flex items-center gap-2 max-w-[130px]">
                <SafeImg src={details.homeLogo || ""} className="w-3.5 h-3.5" width={14} height={14} />
                <span className="truncate">{details.homeTeam}</span>
              </div>
              <span>EMPATE</span>
              <div className="flex items-center gap-2 max-w-[130px] justify-end">
                <span className="truncate text-right">{details.awayTeam}</span>
                <SafeImg src={details.awayLogo || ""} className="w-3.5 h-3.5" width={14} height={14} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* H2H Summary */}
        {details.h2hSummary && (
          <div className="border border-border/10 bg-secondary/5 rounded-sm overflow-hidden lg:col-span-4 flex flex-col shadow-sm">
            <div className="bg-secondary/40 px-4 py-2 border-b border-border/10 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40">RESUMO H2H</h3>
                <Trophy className="h-4 w-4 text-primary opacity-30" />
            </div>
            <div className="p-5 bg-black/10 flex items-center gap-6">
                <div className="flex-1 text-center">
                    <div className="text-3xl font-black text-primary tracking-tighter shadow-sm">{details.h2hSummary.homeWins}</div>
                    <div className="text-[10px] font-black text-muted-foreground/60 uppercase mt-1 flex items-center justify-center gap-2">
                         <SafeImg src={details.homeLogo || ""} className="w-3 h-3 opacity-60" width={12} height={12} />
                         Vitórias
                    </div>
                </div>
                <div className="w-px h-10 bg-border/10" />
                <div className="flex-1 text-center">
                    <div className="text-3xl font-black text-foreground/80 tracking-tighter shadow-sm">{details.h2hSummary.draws}</div>
                    <div className="text-[10px] font-black text-muted-foreground/60 uppercase mt-1">Empates</div>
                </div>
                <div className="w-px h-10 bg-border/10" />
                <div className="flex-1 text-center">
                    <div className="text-3xl font-black text-foreground/50 tracking-tighter shadow-sm">{details.h2hSummary.awayWins}</div>
                    <div className="text-[10px] font-black text-muted-foreground/60 uppercase mt-1 flex items-center justify-center gap-2">
                        Vitórias
                        <SafeImg src={details.awayLogo || ""} className="w-3 h-3 opacity-60" width={12} height={12} />
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* Team Stats Summary */}
        <div className="border border-border/10 bg-secondary/5 rounded-sm overflow-hidden flex flex-col shadow-sm">
          <div className="bg-secondary/40 px-3 py-1.5 border-b border-border/10 flex items-center gap-2 justify-center">
            <SafeImg src={details.homeLogo || ""} className="w-3 h-3" width={12} height={12} />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 truncate">MÉDIA {details.homeTeam}</h3>
          </div>
          <div className="p-4 bg-black/10 flex gap-4">
            <div className="flex-1 text-center">
                <div className={`text-2xl font-black tabular-nums ${
                  details.homeAnalysis.avgGoalsScored >= 1.5 ? 'text-green-500' :
                  details.homeAnalysis.avgGoalsScored >= 1.0 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>{details.homeAnalysis.avgGoalsScored.toFixed(1)}</div>
                <p className={`text-[9px] font-black uppercase mt-1 ${
                  details.homeAnalysis.avgGoalsScored >= 1.5 ? 'text-green-500/60' :
                  details.homeAnalysis.avgGoalsScored >= 1.0 ? 'text-yellow-500/60' :
                  'text-red-500/60'
                }`}>Gols Pró</p>
            </div>
            <div className="flex-1 text-center">
                <div className={`text-2xl font-black tabular-nums ${
                  details.homeAnalysis.avgGoalsConceded <= 1.0 ? 'text-green-500' :
                  details.homeAnalysis.avgGoalsConceded <= 1.5 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>{details.homeAnalysis.avgGoalsConceded.toFixed(1)}</div>
                <p className={`text-[9px] font-black uppercase mt-1 ${
                  details.homeAnalysis.avgGoalsConceded <= 1.0 ? 'text-green-500/60' :
                  details.homeAnalysis.avgGoalsConceded <= 1.5 ? 'text-yellow-500/60' :
                  'text-red-500/60'
                }`}>Contra</p>
            </div>
          </div>
        </div>

        <div className="border border-border/10 bg-secondary/5 rounded-sm overflow-hidden flex flex-col shadow-sm">
          <div className="bg-secondary/40 px-3 py-1.5 border-b border-border/10 flex items-center gap-2 justify-center">
            <SafeImg src={details.awayLogo || ""} className="w-3 h-3" width={12} height={12} />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 truncate">MÉDIA {details.awayTeam}</h3>
          </div>
          <div className="p-4 bg-black/10 flex gap-4">
            <div className="flex-1 text-center">
                <div className={`text-2xl font-black tabular-nums ${
                  details.awayAnalysis.avgGoalsScored >= 1.5 ? 'text-green-500' :
                  details.awayAnalysis.avgGoalsScored >= 1.0 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>{details.awayAnalysis.avgGoalsScored.toFixed(1)}</div>
                <p className={`text-[9px] font-black uppercase mt-1 ${
                  details.awayAnalysis.avgGoalsScored >= 1.5 ? 'text-green-500/60' :
                  details.awayAnalysis.avgGoalsScored >= 1.0 ? 'text-yellow-500/60' :
                  'text-red-500/60'
                }`}>Gols Pró</p>
            </div>
            <div className="flex-1 text-center">
                <div className={`text-2xl font-black tabular-nums ${
                  details.awayAnalysis.avgGoalsConceded <= 1.0 ? 'text-green-500' :
                  details.awayAnalysis.avgGoalsConceded <= 1.5 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>{details.awayAnalysis.avgGoalsConceded.toFixed(1)}</div>
                <p className={`text-[9px] font-black uppercase mt-1 ${
                  details.awayAnalysis.avgGoalsConceded <= 1.0 ? 'text-green-500/60' :
                  details.awayAnalysis.avgGoalsConceded <= 1.5 ? 'text-yellow-500/60' :
                  'text-red-500/60'
                }`}>Contra</p>
            </div>
          </div>
        </div>

        <div className="border border-border/10 bg-secondary/5 rounded-sm overflow-hidden flex flex-col shadow-sm">
          <div className="bg-secondary/40 px-3 py-1.5 border-b border-border/10">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 text-center">GOLS POR JOGO</h3>
          </div>
          <div className="p-4 bg-black/10 text-center">
            <div className="text-2xl font-black text-primary tabular-nums">
                {((details.homeAnalysis.avgTotalGoals + details.awayAnalysis.avgTotalGoals) / 2).toFixed(2)}
            </div>
            <p className="text-[9px] font-black text-muted-foreground/60 uppercase mt-1">Expectativa</p>
          </div>
        </div>

        <div className="border border-border/10 bg-secondary/5 rounded-sm overflow-hidden flex flex-col shadow-sm">
          <div className="bg-secondary/40 px-3 py-1.5 border-b border-border/10">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 text-center">PLACAR COMUM</h3>
          </div>
          <div className="p-3 bg-black/10">
            <div className="flex gap-2">
                {details.commonScores.slice(0, 3).map((cs, i) => (
                <div key={i} className="flex flex-col items-center bg-black/20 rounded-sm p-2 flex-1 border border-white/5 shadow-inner">
                    <span className="font-black text-sm text-foreground/80">{cs.score}</span>
                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase tabular-nums">{cs.count}X</span>
                </div>
                ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
