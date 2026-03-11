import { MatchesList } from "@/components/MatchesList";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="min-h-screen relative z-10 selection:bg-primary/30 p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Dashboard de Partidas</h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">Visão geral dos confrontos do dia</p>
        </div>
        <MatchesList />
      </div>
    </div>
  );
}
