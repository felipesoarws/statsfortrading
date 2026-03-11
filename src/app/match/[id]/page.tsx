import { getMatchDetails } from "@/lib/flashscore/getMatchDetails";
import { MatchStats } from "@/components/MatchStats";
import { MatchTable } from "@/components/MatchTable";
import { MatchLiveStats } from "@/components/MatchLiveStats";
import { MarketStats } from "@/components/MarketStats";
import { TeamAnalysisStrip } from "@/components/TeamAnalysisStrip";
import Link from "next/link";
import { ArrowLeft, TrendingUp, BarChart3, History, Info, Activity } from "lucide-react";

export default async function MatchPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ limit?: string; competitionId?: string }>
}) {
  const p = await params;
  const s = await searchParams;
  const matchId = p.id;
  const limit = s.limit ? parseInt(s.limit) : 10;
  const filterCompId = s.competitionId ? parseInt(s.competitionId) : undefined;
  
  const details = await getMatchDetails(matchId, limit, filterCompId);

  if (!details) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-muted-foreground gap-4">
        <div className="animate-bounce">⚽</div>
        <p className="font-bold uppercase tracking-widest text-[10px]">Não foi possível carregar os detalhes.</p>
        <Link href="/" className="text-primary hover:underline font-black text-[9px] uppercase">Voltar ao Dashboard</Link>
      </div>
    );
  }

  const matchDate = new Date(details.startTimestamp * 1000);
  const formattedDate = matchDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = matchDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <main className="min-h-screen bg-background w-full max-w-none relative z-10 selection:bg-primary/30">
      {/* Top Navigation Bar style Flashscore */}
      <nav className="bg-secondary/60 border-b border-border/10 px-4 h-12 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Futebol
        </Link>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70">
            {details.competitionName}
        </div>
        <div className="w-20" /> {/* Spacer */}
      </nav>

      {/* Main Content Area */}
      <div className="px-4 py-8 md:px-8 lg:px-12">
        {/* Match Header Section */}
        <header className="mb-8 bg-secondary/20 border border-border/10 rounded-sm p-8">
            <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto gap-8">
                {/* Home Team */}
                <div className="flex-1 flex flex-col md:flex-row items-center justify-end gap-6 text-center md:text-right">
                    <div className="order-2 md:order-1">
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight uppercase leading-tight">
                            {details.homeTeam}
                        </h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Casa</p>
                    </div>
                    <div className="w-20 h-20 relative flex items-center justify-center bg-white/5 rounded border border-white/5 p-3 order-1 md:order-2">
                        <img 
                            src={`https://api.sofascore.com/api/v1/team/${details.homeTeamId}/image`} 
                            alt=""
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                {/* Center Score / Time */}
                <div className="flex flex-col items-center justify-center px-8 text-center bg-black/20 py-4 rounded-sm border border-border/5 min-w-[160px]">
                    <div className="text-[10px] font-bold text-muted-foreground mb-1 flex items-center gap-2">
                        <span>{formattedDate} • {formattedTime}</span>
                        {details.liveTime && (
                           <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm animate-pulse">
                              {details.liveTime}
                           </span>
                        )}
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-4xl md:text-5xl font-black tracking-tighter text-primary">
                            {(details.liveTime || details.h2hSummary) ? (
                               `${details.h2h[0]?.teamScore ?? 0} - ${details.h2h[0]?.opponentScore ?? 0}`
                            ) : (
                               details.h2h[0]?.score?.includes('-') ? details.h2h[0].score : 'VS'
                            )}
                        </div>
                        {(details.homePenalties !== undefined || details.awayPenalties !== undefined) && (
                           <div className="text-xs font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest">
                              Pênaltis: {details.homePenalties || 0} - {details.awayPenalties || 0}
                           </div>
                        )}
                    </div>
                    <div className="text-[9px] font-black text-muted-foreground/60 uppercase mt-2 tracking-widest">
                        {details.liveTime ? 'PARTIDA EM ANDAMENTO' : details.h2hSummary ? 'RESULTADO FINAL' : 'RESULTADO H2H MAIS RECENTE'}
                    </div>
                </div>

                {/* Away Team */}
                <div className="flex-1 flex flex-col md:flex-row items-center justify-start gap-6 text-center md:text-left">
                    <div className="w-20 h-20 relative flex items-center justify-center bg-white/5 rounded border border-white/5 p-3">
                        <img 
                            src={`https://api.sofascore.com/api/v1/team/${details.awayTeamId}/image`} 
                            alt=""
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight uppercase leading-tight">
                            {details.awayTeam}
                        </h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Fora</p>
                    </div>
                </div>
            </div>
        </header>

        {/* Filtros de Análise */}
        <div className="flex flex-wrap items-center gap-10 mb-10 bg-secondary/5 rounded-sm p-6 border border-border/5">
            <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Base de Dados</span>
                <div className="flex bg-black/40 p-1 rounded border border-border/10">
                    {[5, 10, 15, 20].map((num) => (
                        <Link
                            key={num}
                            href={`/match/${matchId}?limit=${num}${filterCompId ? `&competitionId=${filterCompId}` : ''}`}
                            className={`text-[11px] font-black px-5 py-1.5 rounded transition-all ${limit === num ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground/60 hover:text-white hover:bg-white/5"}`}
                        >
                            {num} JOGOS
                        </Link>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Escopo da Análise</span>
                <div className="flex bg-black/40 p-1 rounded border border-border/10">
                    <Link
                        href={`/match/${matchId}?limit=${limit}`}
                        className={`text-[11px] font-black px-5 py-1.5 rounded transition-all ${!filterCompId ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground/60 hover:text-white hover:bg-white/5"}`}
                    >
                        GERAL (TODAS LIGAS)
                    </Link>
                    <Link
                        href={`/match/${matchId}?limit=${limit}&competitionId=${details.competitionId}`}
                        className={`text-[11px] font-black px-5 py-1.5 rounded transition-all ${filterCompId ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground/60 hover:text-white hover:bg-white/5"}`}
                    >
                        SÓ {details.competitionName.toUpperCase()}
                    </Link>
                </div>
            </div>
        </div>

        {/* Jogos Considerados na Análise */}
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <History className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-black tracking-tight uppercase">Jogos Considerados na Análise</h2>
                <span className="text-[10px] font-bold text-muted-foreground/40 bg-white/5 px-2 py-0.5 rounded uppercase">
                    Ambas as equipes ({limit} jogos cada {filterCompId ? 'da Liga' : 'Gerais'})
                </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Home Team Games */}
                <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-muted-foreground/60 mb-3 uppercase tracking-widest pl-2 border-l-2 border-primary/40">
                        Últimos de {details.homeTeam} (Casa)
                    </h3>
                    <div className="bg-secondary/5 rounded-sm overflow-hidden border border-border/5">
                        {details.homePerformanceHome.map((m, i) => (
                            <div key={i} className="flex items-center gap-4 px-4 py-2.5 border-b border-border/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                <span className="text-[9px] font-bold text-muted-foreground/50 w-8">{m.date}</span>
                                <div className="flex-1 flex items-center gap-3 truncate">
                                    <div className="flex items-center gap-2 truncate flex-1 justify-end">
                                        <span className={`text-[11px] truncate ${m.isHome ? 'font-bold' : 'text-muted-foreground'}`}>{details.homeTeam}</span>
                                        <img src={`https://api.sofascore.com/api/v1/team/${m.homeTeamId}/image`} alt="" className="w-4 h-4 object-contain opacity-70" />
                                    </div>
                                    <span className="text-[11px] font-black text-primary px-2 bg-primary/5 rounded py-0.5 min-w-[45px] text-center">
                                        {m.score}
                                    </span>
                                    <div className="flex items-center gap-2 truncate flex-1 justify-start">
                                        <img src={`https://api.sofascore.com/api/v1/team/${m.awayTeamId}/image`} alt="" className="w-4 h-4 object-contain opacity-70" />
                                        <span className={`text-[11px] truncate ${!m.isHome ? 'font-bold' : 'text-muted-foreground'}`}>{m.opponent}</span>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full ${
                                    m.result === 'V' ? 'bg-green-500/20 text-green-500' : 
                                    m.result === 'D' ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-500'
                                }`}>
                                    {m.result}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Away Team Games */}
                <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-muted-foreground/60 mb-3 uppercase tracking-widest pl-2 border-l-2 border-primary/40">
                        Últimos de {details.awayTeam} (Fora)
                    </h3>
                    <div className="bg-secondary/5 rounded-sm overflow-hidden border border-border/5">
                        {details.awayPerformanceAway.map((m, i) => (
                            <div key={i} className="flex items-center gap-4 px-4 py-2.5 border-b border-border/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                <span className="text-[9px] font-bold text-muted-foreground/50 w-8">{m.date}</span>
                                <div className="flex-1 flex items-center gap-3 truncate">
                                    <div className="flex items-center gap-2 truncate flex-1 justify-end">
                                        <span className={`text-[11px] truncate ${m.isHome ? 'font-bold' : 'text-muted-foreground'}`}>{details.awayTeam}</span>
                                        <img src={`https://api.sofascore.com/api/v1/team/${m.homeTeamId}/image`} alt="" className="w-4 h-4 object-contain opacity-70" />
                                    </div>
                                    <span className="text-[11px] font-black text-primary px-2 bg-primary/5 rounded py-0.5 min-w-[45px] text-center">
                                        {m.score}
                                    </span>
                                    <div className="flex items-center gap-2 truncate flex-1 justify-start">
                                        <img src={`https://api.sofascore.com/api/v1/team/${m.awayTeamId}/image`} alt="" className="w-4 h-4 object-contain opacity-70" />
                                        <span className={`text-[11px] truncate ${!m.isHome ? 'font-bold' : 'text-muted-foreground'}`}>{m.opponent}</span>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full ${
                                    m.result === 'V' ? 'bg-green-500/20 text-green-500' : 
                                    m.result === 'D' ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-500'
                                }`}>
                                    {m.result}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

      {/* Grid de Análise em Largura Total */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Coluna Larga: Dados e Mercados */}
        <div className="xl:col-span-8 space-y-12">
           
           {/* Seção 1: Médias e Gols */}
           <section className="animate-in fade-in slide-in-from-bottom duration-500">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-xl border border-primary/20"><TrendingUp className="w-5 h-5 text-primary" /></div>
                 <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">Desempenho Ofensivo e Defensivo</h2>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Dados ponderados por 10 partidas recentes</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <TeamAnalysisStrip teamName={details.homeTeam} analysis={details.homeAnalysis} />
                 <TeamAnalysisStrip teamName={details.awayTeam} analysis={details.awayAnalysis} isAway />
              </div>
           </section>

           {/* Seção 2: Mercados (HT / FT) */}
           <section className="animate-in fade-in slide-in-from-bottom duration-700 delay-100">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 flex items-center justify-center bg-orange-500/10 rounded-xl border border-orange-500/20"><BarChart3 className="w-5 h-5 text-orange-500" /></div>
                 <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">Probabilidades de Mercado</h2>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Taxa de frequência estatística para apostas</p>
                 </div>
              </div>
              
              <div className="flex flex-col gap-10">
                {/* Home Team */}
                <div className="bg-muted/5 rounded-3xl p-6 border border-border/10">
                  <div className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/60 mb-6 pl-2 flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-primary/40"></span>
                     {details.homeTeam}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MarketStats title="Tempo Regular (FT)" stats={details.homeAnalysis.ftMarkets} />
                    <MarketStats title="Intervalo (HT)" stats={details.homeAnalysis.htMarkets} />
                  </div>
                </div>
                
                {/* Away Team */}
                <div className="bg-muted/5 rounded-3xl p-6 border border-border/10">
                   <div className="text-[11px] font-black uppercase tracking-[0.3em] text-secondary/60 mb-6 pl-2 flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-secondary/40"></span>
                     {details.awayTeam}
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MarketStats title="Tempo Regular (FT)" stats={details.awayAnalysis.ftMarkets} />
                    <MarketStats title="Intervalo (HT)" stats={details.awayAnalysis.htMarkets} />
                  </div>
                </div>
              </div>
           </section>

           {/* Seção 3: Histórico e Confrontos Diretos */}
           <section className="animate-in fade-in slide-in-from-bottom duration-700 delay-200">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 rounded-xl border border-blue-500/20"><History className="w-5 h-5 text-blue-500" /></div>
                 <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">Histórico e Confrontos Diretos</h2>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Resultados passados e tendências de placar</p>
                 </div>
              </div>
              
              <div className="space-y-10">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                     <MatchTable title="Confrontos Diretos (H2H)" matches={details.h2h} />
                     <div className="space-y-6">
                        <MatchStats details={details!} />
                     </div>
                  </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-6">
                   <MatchTable title={`Últimos 10 Jogos - ${details.homeTeam}`} matches={details.homePerformanceHome} />
                   <MatchTable title={`Últimos 10 Jogos - ${details.awayTeam}`} matches={details.awayPerformanceAway} />
                </div>
              </div>
           </section>
        </div>

        {/* Coluna Direita: Live e Insights */}
        <aside className="xl:col-span-4 space-y-10">
           {details.statistics && (
              <div className="animate-in fade-in slide-in-from-right duration-700 bg-muted/5 p-6 rounded-3xl border border-border/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 rounded-xl border border-red-500/20"><Activity className="w-5 h-5 text-red-500" /></div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-red-500 leading-none">Estatísticas em Tempo Real</h2>
                  </div>
                  <MatchLiveStats statistics={details.statistics} homeTeamName={details.homeTeam} awayTeamName={details.awayTeam} />
              </div>
           )}

           <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 backdrop-blur-3xl space-y-6">
              <div className="flex items-center gap-3">
                 <Info className="w-5 h-5 text-primary" />
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Dica de Análise</h4>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground font-medium italic">
                 "Ao analisar os mercados de **Intervalo (HT)**, observe se as médias de gols sofridos no primeiro tempo compensam as de marcados. Partidas com alto Over 0.5 HT em ambas as equipes sugerem estratégias agressivas desde o apito inicial."
              </p>
              <div className="pt-4 border-t border-primary/10">
                 <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Fonte de Dados • SofaScore Analytics</div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  </main>
);
}
