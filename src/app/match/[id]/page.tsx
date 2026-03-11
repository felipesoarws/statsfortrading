import { getMatchDetails } from "@/lib/bolsadeaposta/getMatchDetails";
import { MatchStats } from "@/components/MatchStats";
import { MatchTable } from "@/components/MatchTable";
import { MatchLiveStats } from "@/components/MatchLiveStats";
import { MarketStats } from "@/components/MarketStats";
import { TeamAnalysisStrip } from "@/components/TeamAnalysisStrip";
import { SingularidadesMatchSection } from "@/components/SingularidadesMatchSection";
import { SafeImg } from "@/components/SafeImg";
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
  const limit = s.limit ? parseInt(s.limit) : 20;
  const filterCompId = s.competitionId ? parseInt(s.competitionId) : undefined;
  
  const details = await getMatchDetails(matchId, limit, filterCompId);

  if (!details) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-muted-foreground gap-4">
        <div className="animate-bounce">⚽</div>
        <p className="font-medium text-sm">Não foi possível carregar os detalhes.</p>
        <Link href="/" className="text-primary hover:underline font-medium text-sm">Voltar ao Dashboard</Link>
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
          className="flex items-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Futebol
        </Link>
        <div className="text-xs font-medium text-foreground/80">
            {details.countryName ? `${details.countryName}: ` : ''}{details.competitionName}
        </div>
        <div className="w-20" /> {/* Spacer */}
      </nav>

      {/* Main Content Area */}
      <div className="px-3 py-4 md:px-6">
        {/* Match Header Section */}
        <header className="mb-4 bg-secondary/30 border border-border/10 rounded-sm p-4 md:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                {/* Home Team */}
                <div className="flex-1 flex flex-col md:flex-row items-center justify-end gap-6 text-center md:text-right">
                    <div className="order-2 md:order-1">
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">
                            {details.homeTeam}
                        </h1>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">Casa</p>
                    </div>
                    <div className="order-1 md:order-2 w-16 h-16 relative flex items-center justify-center bg-black/5 dark:bg-white/5 rounded border border-border/10 p-2 group">
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded" />
                        <img 
                            src={details.homeLogo} 
                            alt={details.homeTeam} 
                            className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                </div>

                {/* Score / Center Info */}
                <div className="flex flex-col items-center justify-center min-w-[120px]">
                    <div className="flex flex-col items-center gap-2">
                        <div className="text-5xl font-bold tabular-nums tracking-tighter text-foreground drop-shadow-sm">
                            {details.statusType === 'notstarted' ? '0 - 0' : 
                             details.currentScore ? `${details.currentScore.home} - ${details.currentScore.away}` : '0 - 0'}
                        </div>
                        {details.statusType === 'finished' && details.currentScore && (
                             <div className={`px-3 py-0.5 rounded-full text-[11px] font-medium border ${
                                details.currentScore.home > details.currentScore.away ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                details.currentScore.home < details.currentScore.away ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                'bg-amber-500/10 text-amber-600 border-amber-500/20'
                             }`}>
                                {details.currentScore.home > details.currentScore.away ? 'Vitória' : 
                                 details.currentScore.home < details.currentScore.away ? 'Derrota' : 'Empate'}
                             </div>
                        )}
                    </div>
                    {(details.homePenalties !== undefined || details.awayPenalties !== undefined) && (
                       <div className="text-xs font-medium text-muted-foreground/80 mt-2">
                          Pênaltis: {details.homePenalties || 0} - {details.awayPenalties || 0}
                       </div>
                    )}
                    <div className="text-[10px] font-medium text-muted-foreground/80 mt-2 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded flex flex-col items-center gap-1">
                        <span>{details.statusType === 'inprogress' ? 'Em andamento' : details.statusType === 'finished' ? 'Finalizado' : 'Aguardando início'}</span>
                        {details.totalVolume !== undefined && details.totalVolume > 0 && (
                            <span className="text-primary/80 font-semibold">Volume: R$ {details.totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        )}
                    </div>
                </div>

                {/* Away Team */}
                <div className="flex-1 flex flex-col md:flex-row items-center justify-start gap-4 text-center md:text-left">
                    <div className="w-16 h-16 relative flex items-center justify-center bg-black/5 dark:bg-white/5 rounded border border-border/10 p-2 group">
                        <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded" />
                        <img 
                            src={details.awayLogo} 
                            alt={details.awayTeam} 
                            className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">
                            {details.awayTeam}
                        </h1>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">Fora</p>
                    </div>
                </div>
            </div>
        </header>

        {/* Odds & Averages Stripe */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-secondary/30 rounded-sm p-3 border border-border/10">
           <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-medium text-muted-foreground/80">Odds Iniciais (1X2)</span>
                 <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-black/30 px-2 py-1.5 rounded border border-border/10 shadow-sm">
                        <span className="text-[10px] font-medium text-muted-foreground mr-0.5">1</span>
                        <span className="text-xs font-semibold">{details.odds?.home || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-black/30 px-2 py-1.5 rounded border border-border/10 shadow-sm">
                        <span className="text-[10px] font-medium text-muted-foreground mr-0.5">X</span>
                        <span className="text-xs font-semibold">{details.odds?.draw || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-black/30 px-2 py-1.5 rounded border border-border/10 shadow-sm">
                        <span className="text-[10px] font-medium text-muted-foreground mr-0.5">2</span>
                        <span className="text-xs font-semibold">{details.odds?.away || '-'}</span>
                    </div>
                  </div>
              </div>
              
              <div className="w-px h-6 bg-border/20 hidden md:block"></div>

              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-medium text-muted-foreground/80">Gols (2.5)</span>
                 <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-black/30 px-2 py-1.5 rounded border border-border/10 shadow-sm">
                        <span className="text-[10px] font-medium text-green-600 dark:text-green-500/80 mr-0.5">Over</span>
                        <span className="text-xs font-semibold">{details.odds?.over25 || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-black/30 px-2 py-1.5 rounded border border-border/10 shadow-sm">
                        <span className="text-[10px] font-medium text-red-600 dark:text-red-500/80 mr-0.5">Under</span>
                        <span className="text-xs font-semibold">{details.odds?.under25 || '-'}</span>
                    </div>
                  </div>
              </div>

              <div className="w-px h-6 bg-border/20 hidden md:block"></div>

              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-medium text-muted-foreground/80">Gols (1.5)</span>
                 <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-black/30 px-2 py-1.5 rounded border border-border/10 shadow-sm">
                        <span className="text-[10px] font-medium text-green-600 dark:text-green-500/80 mr-0.5">Over</span>
                        <span className="text-xs font-semibold">{details.odds?.over15 || '-'}</span>
                    </div>
                  </div>
              </div>

              <div className="w-px h-6 bg-border/20 hidden md:block"></div>

              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-medium text-muted-foreground/80">Gols (0.5)</span>
                 <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-black/30 px-2 py-1.5 rounded border border-border/10 shadow-sm">
                        <span className="text-[10px] font-medium text-green-600 dark:text-green-500/80 mr-0.5">Over</span>
                        <span className="text-xs font-semibold">{details.odds?.over05 || '-'}</span>
                    </div>
                  </div>
              </div>

              <div className="w-px h-6 bg-border/20 hidden md:block"></div>

              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-medium text-muted-foreground/80">Placar Exato (LAY)</span>
                 <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-black/30 px-2 py-1.5 rounded border border-border/10 shadow-sm">
                        <span className="text-[10px] font-medium text-blue-600 dark:text-blue-500/80 mr-0.5">0-0</span>
                        <span className="text-xs font-semibold">{details.odds?.lay00 || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/5 dark:bg-black/30 px-2 py-1.5 rounded border border-border/10 shadow-sm">
                        <span className="text-[10px] font-medium text-blue-600 dark:text-blue-500/80 mr-0.5">0-1</span>
                        <span className="text-xs font-semibold">{details.odds?.lay01 || '-'}</span>
                    </div>
                  </div>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="flex flex-col text-right">
                 <span className="text-[10px] font-medium text-muted-foreground/80 flex items-center justify-end gap-1.5">
                    <img src={(details.homeLogo || '').startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(details.homeLogo || '')}` : (details.homeLogo || '')} className="w-3 h-3" alt="" />
                    Médias - {details.homeTeam}
                 </span>
                 <div className="text-[11px] font-medium mt-1 tabular-nums">
                    Marcados: <span className="text-green-600 font-semibold dark:text-green-500">{details.homeAnalysis.avgGoalsScored.toFixed(1)}</span> / Sofridos: <span className="text-red-600 font-semibold dark:text-red-500">{details.homeAnalysis.avgGoalsConceded.toFixed(1)}</span>
                 </div>
              </div>
              <div className="flex flex-col text-right">
                 <span className="text-[10px] font-medium text-muted-foreground/80 flex items-center justify-end gap-1.5">
                    <img src={(details.awayLogo || '').startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(details.awayLogo || '')}` : (details.awayLogo || '')} className="w-3 h-3" alt="" />
                    Médias - {details.awayTeam}
                 </span>
                 <div className="text-[11px] font-medium mt-1 tabular-nums">
                    Marcados: <span className="text-green-600 font-semibold dark:text-green-500">{details.awayAnalysis.avgGoalsScored.toFixed(1)}</span> / Sofridos: <span className="text-red-600 font-semibold dark:text-red-500">{details.awayAnalysis.avgGoalsConceded.toFixed(1)}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Filtros de Análise */}
        <div className="flex flex-wrap items-center gap-8 mb-6 bg-secondary/20 rounded-sm p-4 border border-border/10">
            <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground/80">Base de Dados</span>
                <div className="flex bg-black/5 dark:bg-black/40 p-1 rounded border border-border/10">
                    {[5, 10, 15, 20].map((num) => (
                        <Link
                            key={num}
                            href={`/match/${matchId}?limit=${num}${filterCompId ? `&competitionId=${filterCompId}` : ''}`}
                            className={`text-xs font-medium px-4 py-1.5 rounded transition-all ${limit === num ? "bg-primary text-white shadow-md shadow-primary/30" : "text-muted-foreground/80 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"}`}
                        >
                            {num} Jogos
                        </Link>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground/80">Escopo da Análise</span>
                <div className="flex bg-black/5 dark:bg-black/40 p-1 rounded border border-border/10">
                    <Link
                        href={`/match/${matchId}?limit=${limit}`}
                        className={`text-xs font-medium px-4 py-1.5 rounded transition-all ${!filterCompId ? "bg-primary text-white shadow-md shadow-primary/30" : "text-muted-foreground/80 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"}`}
                    >
                        Geral (Todas Ligas)
                    </Link>
                    <Link
                        href={`/match/${matchId}?limit=${limit}&competitionId=${details.competitionId}`}
                        className={`text-xs font-medium px-4 py-1.5 rounded transition-all ${filterCompId ? "bg-primary text-white shadow-md shadow-primary/30" : "text-muted-foreground/80 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"}`}
                    >
                        Apenas {details.competitionName}
                    </Link>
                </div>
            </div>
        </div>

        {/* Jogos Considerados na Análise */}
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <History className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Jogos Considerados na Análise</h2>
                <span className="text-[10px] font-medium text-muted-foreground/80 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                    Ambas as equipes ({limit} jogos cada {filterCompId ? 'da Liga' : 'Gerais'})
                </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Home Team Games */}
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground/80 mb-3 pl-2 border-l-2 border-primary/40">
                        Últimos de {details.homeTeam} (Casa)
                    </h3>
                    <div className="bg-secondary/5 rounded-sm overflow-hidden border border-border/10">
                        {details.homePerformanceHome.map((m, i) => (
                            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border/10 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <span className="text-[10px] font-medium text-muted-foreground w-10 tabular-nums">{m.date}</span>
                                <div className="flex-1 flex items-center gap-4">
                                    <div className="flex items-center gap-3 flex-1 justify-end overflow-hidden">
                                        <span className={`text-sm truncate ${m.isHome ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                                            {m.isHome ? details.homeTeam : m.opponent}
                                        </span>
                                        <SafeImg 
                                            src={m.homeLogo?.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(m.homeLogo)}` : (m.homeLogo || '')} 
                                            className="w-5 h-5 object-contain shrink-0" 
                                        />
                                    </div>
                                    <span className={`text-sm font-bold px-3 bg-black/5 dark:bg-black/40 border border-border/5 rounded-sm py-1 min-w-[55px] text-center shadow-sm shrink-0 ${
                                        m.result === 'V' ? 'text-green-600 dark:text-green-500' : 
                                        m.result === 'D' ? 'text-red-600 dark:text-red-500' : 'text-amber-600 dark:text-amber-500'
                                    }`}>
                                        {m.score}
                                    </span>
                                    <div className="flex items-center gap-3 flex-1 justify-start overflow-hidden">
                                        <SafeImg 
                                            src={m.awayLogo?.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(m.awayLogo)}` : (m.awayLogo || '')} 
                                            className="w-5 h-5 object-contain shrink-0" 
                                        />
                                        <span className={`text-sm truncate ${!m.isHome ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                                            {!m.isHome ? details.homeTeam : m.opponent}
                                        </span>
                                    </div>
                                </div>
                                <span className={`text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-sm ${
                                    m.result === 'V' ? 'bg-green-500/10 text-green-600 dark:text-green-500' : 
                                    m.result === 'D' ? 'bg-red-500/10 text-red-600 dark:text-red-500' : 'bg-amber-500/10 text-amber-600 dark:text-amber-500'
                                }`}>
                                    {m.result}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Away Team Games */}
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground/80 mb-3 pl-2 border-l-2 border-primary/40">
                        Últimos de {details.awayTeam} (Fora)
                    </h3>
                    <div className="bg-secondary/5 rounded-sm overflow-hidden border border-border/10">
                        {details.awayPerformanceAway.map((m, i) => (
                            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border/10 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <span className="text-[10px] font-medium text-muted-foreground w-10 tabular-nums">{m.date}</span>
                                <div className="flex-1 flex items-center gap-4">
                                    <div className="flex items-center gap-3 flex-1 justify-end overflow-hidden">
                                        <span className={`text-sm truncate ${m.isHome ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                                            {m.isHome ? details.awayTeam : m.opponent}
                                        </span>
                                        <SafeImg 
                                            src={m.homeLogo?.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(m.homeLogo)}` : (m.homeLogo || '')} 
                                            className="w-5 h-5 object-contain shrink-0" 
                                        />
                                    </div>
                                    <span className={`text-sm font-bold px-3 bg-black/5 dark:bg-black/40 border border-border/5 rounded-sm py-1 min-w-[55px] text-center shadow-sm shrink-0 ${
                                        m.result === 'V' ? 'text-green-600 dark:text-green-500' : 
                                        m.result === 'D' ? 'text-red-600 dark:text-red-500' : 'text-amber-600 dark:text-amber-500'
                                    }`}>
                                        {m.score}
                                    </span>
                                    <div className="flex items-center gap-3 flex-1 justify-start overflow-hidden">
                                        <SafeImg 
                                            src={m.awayLogo?.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(m.awayLogo)}` : (m.awayLogo || '')} 
                                            className="w-5 h-5 object-contain shrink-0" 
                                        />
                                        <span className={`text-sm truncate ${!m.isHome ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                                            {!m.isHome ? details.awayTeam : m.opponent}
                                        </span>
                                    </div>
                                </div>
                                <span className={`text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-sm ${
                                    m.result === 'V' ? 'bg-green-500/10 text-green-600 dark:text-green-500' : 
                                    m.result === 'D' ? 'bg-red-500/10 text-red-600 dark:text-red-500' : 'bg-amber-500/10 text-amber-600 dark:text-amber-500'
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
      <div className="grid grid-cols-1 xl:grid-cols-8 gap-10">
        
        {/* Coluna Larga: Dados e Mercados */}
        <div className="xl:col-span-8 space-y-12">
           
           {/* Seção 1: Médias e Gols */}
           <section className="animate-in fade-in slide-in-from-bottom duration-500">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-xl border border-primary/20"><TrendingUp className="w-5 h-5 text-primary" /></div>
                 <div>
                    <h2 className="text-lg font-bold tracking-tight">Desempenho Ofensivo e Defensivo</h2>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">Dados ponderados por {limit} partidas recentes</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <TeamAnalysisStrip teamName={details.homeTeam} teamLogo={details.homeLogo} analysis={details.homeAnalysis} />
                 <TeamAnalysisStrip teamName={details.awayTeam} teamLogo={details.awayLogo} analysis={details.awayAnalysis} isAway={true} />
              </div>
           </section>

           {/* Seção 2: Probabilidades de Mercado */}
           <section className="animate-in fade-in slide-in-from-bottom duration-700 delay-100">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-10 h-10 flex items-center justify-center bg-orange-500/10 rounded-xl border border-orange-500/20"><BarChart3 className="w-5 h-5 text-orange-500" /></div>
                 <div>
                    <h2 className="text-lg font-bold tracking-tight">Probabilidades de Mercado</h2>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">Taxa de frequência estatística para apostas</p>
                 </div>
              </div>
              
              <div className="flex flex-col xl:flex-row gap-10 justify-between ">
                {/* Home Team */}
                <div className="bg-muted/5 rounded-3xl p-6 border border-border/10 w-full">
                  <div className="text-sm font-semibold text-primary mb-6 pl-2 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                        <img src={details.homeLogo} className="w-5 h-5 object-contain" alt="" />
                     </div>
                     {details.homeTeam}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MarketStats title="Tempo Regular (FT)" stats={details.homeAnalysis.ftMarkets} />
                    <MarketStats title="Intervalo (HT)" stats={details.homeAnalysis.htMarkets} />
                  </div>
                </div>
                
                {/* Away Team */}
                <div className="bg-muted/5 rounded-3xl p-6 border border-border/10 w-full">
                   <div className="text-sm font-semibold text-secondary-foreground mb-6 pl-2 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center border border-secondary/30 shadow-sm">
                        <img src={details.awayLogo} className="w-5 h-5 object-contain" alt="" />
                     </div>
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
                    <h2 className="text-lg font-bold tracking-tight">Histórico e Confrontos Diretos</h2>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">Resultados passados e tendências de placar</p>
                 </div>
              </div>
              
              <div className="space-y-10">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                     <MatchTable title="Confrontos Diretos (H2H)" matches={details.h2h} />
                     <div className="space-y-6">
                        <MatchStats details={details!} />
                     </div>
                  </div>
                
                 <div className="grid grid-cols-1 gap-8 pt-6">
                    <MatchTable title={`Últimos 10 Jogos - ${details.homeTeam}`} matches={details.homePerformanceHome} />
                    <MatchTable title={`Últimos 10 Jogos - ${details.awayTeam}`} matches={details.awayPerformanceAway} />
                 </div>
              </div>
           </section>
        </div>
      </div>
      {details.homePerformanceHome.length >= 20 && details.awayPerformanceAway.length >= 20 && (
        <SingularidadesMatchSection 
            homeName={details.homeTeam}
            awayName={details.awayTeam}
            homeHistory={details.homePerformanceHome}
            awayHistory={details.awayPerformanceAway}
            homeLogo={details.homeLogo}
            awayLogo={details.awayLogo}
            lay01Odd={details.odds?.lay01}
        />
      )}
    </div>
  </main>
);
}
