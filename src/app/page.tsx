import { MatchesList } from "@/components/MatchesList";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative z-10 selection:bg-primary/30">
      <header className="bg-secondary/60 border-b border-border/10 py-6 mb-8">
        <div className="max-w-5xl mx-auto px-4 md:px-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary flex items-center justify-center font-black text-2xl text-white rounded-sm shadow-sm border border-white/5">
            FS
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Football Analyzer</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Resultados e Estatísticas ao Vivo</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-12">
        <MatchesList />
      </div>
    </main>
  );
}
