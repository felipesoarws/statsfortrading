import { TeamAnalysis } from "@/lib/bolsadeaposta/getMatchDetails";
import { SafeImg } from "./SafeImg";

interface Props {
  teamName: string;
  analysis: TeamAnalysis;
  teamLogo?: string;
  isAway?: boolean;
}

export function TeamAnalysisStrip({ teamName, analysis, teamLogo }: Props) {

  return (
    <div className="flex flex-col gap-px border border-border/10 bg-border/5 rounded-sm overflow-hidden shadow-sm">
      <div className={`px-2 py-1.5 bg-secondary/40 border-b border-border/10 flex items-center gap-2`}>
        <div className="w-5 h-5 rounded flex items-center justify-center border border-border/10 shadow-inner bg-card">
            <SafeImg src={teamLogo || ""} className="w-3.5 h-3.5 object-contain" width={14} height={14} />
        </div>
        <h3 className={`text-xs font-bold tracking-widest text-foreground truncate`}>
          {teamName}
        </h3>
      </div>

      <div className="grid grid-cols-3 bg-border/20 gap-px">
        <div className="bg-background/40 p-2 text-center">
            <div className={`text-xl font-bold tabular-nums tracking-tighter shadow-sm ${
              analysis.avgGoalsScored >= 1.5 ? 'text-green-600 dark:text-green-500' :
              analysis.avgGoalsScored >= 1.0 ? 'text-yellow-600 dark:text-yellow-500' :
              'text-red-600 dark:text-red-500'
            }`}>{analysis.goalsScored}</div>
            <div className="text-[10px] font-medium text-muted-foreground mt-0.5">Marcados</div>
            <div className={`text-[11px] font-semibold tabular-nums mt-1 p-0.5 rounded shadow-inner ${
              analysis.avgGoalsScored >= 1.5 ? 'bg-green-500/10 text-green-600 dark:text-green-500' :
              analysis.avgGoalsScored >= 1.0 ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500' :
              'bg-red-500/10 text-red-600 dark:text-red-500'
            }`}>MÉDIA {analysis.avgGoalsScored.toFixed(2)}</div>
        </div>

        <div className="bg-background/40 p-2 text-center">
            <div className={`text-xl font-bold tabular-nums tracking-tighter shadow-sm ${
              analysis.avgGoalsConceded <= 1.0 ? 'text-green-600 dark:text-green-500' :
              analysis.avgGoalsConceded <= 1.5 ? 'text-yellow-600 dark:text-yellow-500' :
              'text-red-600 dark:text-red-500'
            }`}>{analysis.goalsConceded}</div>
            <div className="text-[10px] font-medium text-muted-foreground mt-0.5">Sofridos</div>
            <div className={`text-[11px] font-semibold tabular-nums mt-1 p-0.5 rounded shadow-inner ${
              analysis.avgGoalsConceded <= 1.0 ? 'bg-green-500/10 text-green-600 dark:text-green-500' :
              analysis.avgGoalsConceded <= 1.5 ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500' :
              'bg-red-500/10 text-red-600 dark:text-red-500'
            }`}>MÉDIA {analysis.avgGoalsConceded.toFixed(2)}</div>
        </div>

        <div className="bg-background/40 p-2 text-center border-l border-border/10">
            <div className="text-xl font-bold tabular-nums text-foreground/80 tracking-tighter shadow-sm">{analysis.totalGoals}</div>
            <div className="text-[10px] font-medium text-muted-foreground mt-0.5">Total</div>
            <div className="text-[11px] font-semibold tabular-nums text-foreground/60 mt-1 bg-black/5 p-0.5 rounded shadow-inner">MÉDIA {analysis.avgTotalGoals.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
