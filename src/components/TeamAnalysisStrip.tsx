import { TeamAnalysis } from "@/lib/flashscore/getMatchDetails";

interface Props {
  teamName: string;
  analysis: TeamAnalysis;
  isAway?: boolean;
}

export function TeamAnalysisStrip({ teamName, analysis, isAway }: Props) {
  const accentColor = isAway ? "text-secondary" : "text-primary";
  const borderColor = isAway ? "border-secondary/30" : "border-primary/30";

  return (
    <div className="flex flex-col gap-px border border-border/10 bg-border/5 rounded-sm overflow-hidden">
      <div className={`px-3 py-1.5 bg-secondary/40 border-b border-border/10`}>
        <h3 className={`text-[10px] font-black uppercase tracking-widest text-foreground/80 truncate`}>
          {teamName}
        </h3>
      </div>

      <div className="grid grid-cols-3 bg-black/20 gap-px">
        <div className="bg-background/40 p-3 text-center">
            <div className="text-xl font-black tabular-nums">{analysis.goalsScored}</div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Marcados</div>
            <div className={`text-[9px] font-black tabular-nums ${accentColor} mt-1`}>MÉDIA {analysis.avgGoalsScored.toFixed(2)}</div>
        </div>

        <div className="bg-background/40 p-3 text-center">
            <div className="text-xl font-black tabular-nums text-red-500">{analysis.goalsConceded}</div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Sofridos</div>
            <div className="text-[9px] font-black tabular-nums text-red-500 mt-1">MÉDIA {analysis.avgGoalsConceded.toFixed(2)}</div>
        </div>

        <div className="bg-background/40 p-3 text-center">
            <div className="text-xl font-black tabular-nums text-foreground/70">{analysis.totalGoals}</div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Total</div>
            <div className="text-[9px] font-black tabular-nums text-foreground/40 mt-1">MÉDIA {analysis.avgTotalGoals.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
