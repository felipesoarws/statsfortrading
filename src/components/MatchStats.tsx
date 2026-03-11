import { MatchDetails } from "@/lib/flashscore/getMatchDetails";
import { Trophy } from "lucide-react";

export function MatchStats({ details }: { details: MatchDetails }) {
  return (
    <div className="space-y-6 mb-8">
      {/* Probabilidades da Comunidade */}
      {details.probabilities && (
        <div className="border border-border/10 bg-secondary/5 rounded-sm overflow-hidden flex flex-col">
          <div className="bg-secondary/40 px-3 py-1.5 border-b border-border/10">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/50 text-center">
              TENDÊNCIA DA COMUNIDADE
            </h3>
          </div>
          <div className="p-4 bg-black/10">
            <div className="flex w-full h-6 rounded-sm overflow-hidden bg-black/40">
              <div 
                className="bg-primary flex items-center justify-center text-[10px] font-black text-white transition-opacity hover:opacity-80" 
                style={{ width: `${details.probabilities.home}%` }}
              >
                {details.probabilities.home}%
              </div>
              <div 
                className="bg-muted-foreground/30 flex items-center justify-center text-[10px] font-black text-white border-x border-black/20" 
                style={{ width: `${details.probabilities.draw}%` }}
              >
                {details.probabilities.draw}%
              </div>
              <div 
                className="bg-foreground/20 flex items-center justify-center text-[10px] font-black text-white hover:opacity-80 transition-opacity" 
                style={{ width: `${details.probabilities.away}%` }}
              >
                {details.probabilities.away}%
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60">
              <span className="truncate max-w-[100px]">{details.homeTeam}</span>
              <span>EMPATE</span>
              <span className="truncate max-w-[100px] text-right">{details.awayTeam}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* H2H Summary */}
        {details.h2hSummary && (
          <div className="border border-border/10 bg-secondary/5 rounded-sm overflow-hidden lg:col-span-4 flex flex-col">
            <div className="bg-secondary/40 px-3 py-1 border-b border-border/10 flex items-center justify-between">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-foreground/40 text-center">RESUMO H2H</h3>
                <Trophy className="h-3 w-3 text-primary opacity-30" />
            </div>
            <div className="p-4 bg-black/10 flex items-center gap-4">
                <div className="flex-1 text-center">
                    <div className="text-xl font-black text-primary">{details.h2hSummary.homeWins}</div>
                    <div className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Vitórias {details.homeTeam}</div>
                </div>
                <div className="w-px h-6 bg-border/10" />
                <div className="flex-1 text-center">
                    <div className="text-xl font-black text-foreground/80">{details.h2hSummary.draws}</div>
                    <div className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Empates</div>
                </div>
                <div className="w-px h-6 bg-border/10" />
                <div className="flex-1 text-center">
                    <div className="text-xl font-black text-foreground/50">{details.h2hSummary.awayWins}</div>
                    <div className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Vitórias {details.awayTeam}</div>
                </div>
            </div>
          </div>
        )}

        {/* Team Stats Summary */}
        <div className="border border-border/10 bg-secondary/5 rounded-sm overflow-hidden flex flex-col">
          <div className="bg-secondary/40 px-3 py-1 border-b border-border/10">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-foreground/40 truncate text-center">MÉDIA {details.homeTeam}</h3>
          </div>
          <div className="p-3 bg-black/10 flex gap-4">
            <div className="flex-1 text-center">
                <div className="text-lg font-black text-foreground/90">{details.homeAnalysis.avgGoalsScored.toFixed(1)}</div>
                <p className="text-[8px] font-bold text-green-500 uppercase">Marcados</p>
            </div>
            <div className="flex-1 text-center">
                <div className="text-lg font-black text-red-500/80">{details.homeAnalysis.avgGoalsConceded.toFixed(1)}</div>
                <p className="text-[8px] font-bold text-red-500/60 uppercase">Sofridos</p>
            </div>
          </div>
        </div>

        <div className="border border-border/10 bg-secondary/5 rounded-sm overflow-hidden flex flex-col">
          <div className="bg-secondary/40 px-3 py-1 border-b border-border/10">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-foreground/40 truncate text-center">MÉDIA {details.awayTeam}</h3>
          </div>
          <div className="p-3 bg-black/10 flex gap-4">
            <div className="flex-1 text-center">
                <div className="text-lg font-black text-foreground/90">{details.awayAnalysis.avgGoalsScored.toFixed(1)}</div>
                <p className="text-[8px] font-bold text-green-500 uppercase">Marcados</p>
            </div>
            <div className="flex-1 text-center">
                <div className="text-lg font-black text-red-500/80">{details.awayAnalysis.avgGoalsConceded.toFixed(1)}</div>
                <p className="text-[8px] font-bold text-red-500/60 uppercase">Sofridos</p>
            </div>
          </div>
        </div>

        <div className="border border-border/10 bg-secondary/5 rounded-sm overflow-hidden flex flex-col">
          <div className="bg-secondary/40 px-3 py-1 border-b border-border/10">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-foreground/40 text-center">GOLS POR JOGO</h3>
          </div>
          <div className="p-3 bg-black/10 text-center">
            <div className="text-lg font-black text-primary">
                {((details.homeAnalysis.avgTotalGoals + details.awayAnalysis.avgTotalGoals) / 2).toFixed(2)}
            </div>
            <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60 italic">Expectativa Geral</p>
          </div>
        </div>

        <div className="border border-border/10 bg-secondary/5 rounded-sm overflow-hidden flex flex-col">
          <div className="bg-secondary/40 px-3 py-1 border-b border-border/10">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-foreground/40 text-center">PLACAR COMUM</h3>
          </div>
          <div className="p-2 bg-black/10">
            <div className="flex gap-1">
                {details.commonScores.slice(0, 3).map((cs, i) => (
                <div key={i} className="flex flex-col items-center bg-black/20 rounded-sm p-1.5 flex-1 border border-white/5">
                    <span className="font-black text-xs text-foreground/80">{cs.score}</span>
                    <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-tighter">{cs.count}X</span>
                </div>
                ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
