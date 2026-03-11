"use client";

import { useEffect, useState, useMemo } from "react";
import { MatchInfo } from "@/lib/flashscore/getMatchesOfDay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeagueGroup } from "./LeagueGroup";
import { MatchCard } from "./MatchCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Clock, Search, Calendar, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function getFormattedDate(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export function MatchesList() {
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => getFormattedDate(0));
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [showNotLiveOnly, setShowNotLiveOnly] = useState(false);
  const [sortByLiquidity, setSortByLiquidity] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMatches = async (dateStr: string) => {
    try {
      const offset = new Date().getTimezoneOffset();
      const res = await fetch(`/api/matches?date=${dateStr}&timezoneOffset=${offset}`);
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      }
    } catch (e) {
      console.error("Failed to load matches", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMatches(selectedDate);
    
    const interval = setInterval(() => {
      fetchMatches(selectedDate);
    }, 60000);

    return () => clearInterval(interval);
  }, [selectedDate]);

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const matchesSearch = match.league.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            match.home.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            match.away.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (showLiveOnly) {
        return match.status === 'LIVE' || match.status === 'INPLAY';
      }

      if (showNotLiveOnly) {
        // Scheduled matches without live or finished status
        return match.status !== 'LIVE' && match.status !== 'INPLAY' && match.status !== 'FINISHED' && match.status !== 'DONE';
      }

      return true;
    });
  }, [matches, searchQuery, showLiveOnly, showNotLiveOnly]);

  // Group by League and sort internal matches
  const byLeague = useMemo(() => {
    // Group matches
    const grouped = filteredMatches.reduce((acc, match) => {
      if (!acc[match.league]) acc[match.league] = [];
      acc[match.league].push(match);
      return acc;
    }, {} as Record<string, MatchInfo[]>);

    // Sort matches within each league
    for (const league in grouped) {
        grouped[league].sort((a, b) => {
            if (sortByLiquidity) {
                const volA = a.totalVolume || 0;
                const volB = b.totalVolume || 0;
                if (volA !== volB) return volB - volA;
            }
            return a.time.localeCompare(b.time);
        });
    }

    // Sort the leagues themselves based on the first match's volume (if sorted by liquidity) or name
    const sortedEntries = Object.entries(grouped).sort((a, b) => {
        if (sortByLiquidity) {
            const maxVolA = Math.max(...a[1].map(m => m.totalVolume || 0));
            const maxVolB = Math.max(...b[1].map(m => m.totalVolume || 0));
            if (maxVolA !== maxVolB) return maxVolB - maxVolA;
        }
        return a[0].localeCompare(b[0]);
    });

    return Object.fromEntries(sortedEntries);
  }, [filteredMatches, sortByLiquidity]);

  // Group by Time and sort by either Time or Liquidity
  const byTime = useMemo(() => {
    return [...filteredMatches].sort((a, b) => {
      if (sortByLiquidity) {
        // Sort descending by liquidity
        const volA = a.totalVolume || 0;
        const volB = b.totalVolume || 0;
        if (volA !== volB) return volB - volA;
      }
      return a.time.localeCompare(b.time);
    });
  }, [filteredMatches, sortByLiquidity]);

  return (
    <Tabs defaultValue="league" className="w-full">
      <div className="bg-secondary/40 border border-border/10 rounded-sm mb-6 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b border-border/10">
          <div className="flex flex-col gap-1">
             <h1 className="text-xl font-black tracking-tight text-foreground/90 uppercase">
               {selectedDate === getFormattedDate(-1) ? "JOGOS DE ONTEM" :
                selectedDate === getFormattedDate(0) ? "JOGOS DE HOJE" :
                selectedDate === getFormattedDate(1) ? "JOGOS DE AMANHÃ" :
                `JOGOS - ${selectedDate.slice(6,8)}/${selectedDate.slice(4,6)}/${selectedDate.slice(0,4)}`}
             </h1>
             <div className="flex items-center gap-4">
                <div className="flex bg-black/5 dark:bg-black/40 p-0.5 rounded border border-border/5">
                  <button 
                    className={`text-[10px] font-bold px-3 py-1 rounded transition-colors ${selectedDate === getFormattedDate(-1) ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setSelectedDate(getFormattedDate(-1))}
                  >
                    ONTEM
                  </button>
                  <button 
                    className={`text-[10px] font-bold px-3 py-1 rounded transition-colors ${selectedDate === getFormattedDate(0) ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setSelectedDate(getFormattedDate(0))}
                  >
                    HOJE
                  </button>
                  <button 
                    className={`text-[10px] font-bold px-3 py-1 rounded transition-colors ${selectedDate === getFormattedDate(1) ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setSelectedDate(getFormattedDate(1))}
                  >
                    AMANHÃ
                  </button>
                  <div className="w-px bg-border/20 mx-1 my-1" />
                  <div className="relative flex items-center group">
                    <Calendar className={`w-3.5 h-3.5 absolute left-2 ${![getFormattedDate(-1), getFormattedDate(0), getFormattedDate(1)].includes(selectedDate) ? "text-white" : "text-muted-foreground group-hover:text-foreground"} pointer-events-none`} />
                    <input 
                      type="date"
                      className={`text-[10px] font-bold pl-7 pr-2 py-1 rounded transition-colors bg-transparent border-none outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 ${![getFormattedDate(-1), getFormattedDate(0), getFormattedDate(1)].includes(selectedDate) ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
                      value={`${selectedDate.slice(0,4)}-${selectedDate.slice(4,6)}-${selectedDate.slice(6,8)}`}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedDate(e.target.value.replace(/-/g, ''));
                        }
                      }}
                    />
                  </div>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 bg-black/5 dark:bg-black/20 p-0.5 rounded border border-border/10">
                 <Button 
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-3 flex items-center gap-1.5 font-bold text-[10px] tracking-tight ${showLiveOnly ? "bg-primary text-white shadow-sm" : "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground"}`}
                    onClick={() => {
                        setShowLiveOnly(!showLiveOnly);
                        if (!showLiveOnly) setShowNotLiveOnly(false);
                    }}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${showLiveOnly ? "bg-white animate-pulse" : "bg-primary/50"}`} />
                    AO VIVO
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-3 flex items-center gap-1.5 font-bold text-[10px] tracking-tight ${showNotLiveOnly ? "bg-secondary-foreground text-secondary border border-border/10 shadow-sm" : "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground"}`}
                    onClick={() => {
                        setShowNotLiveOnly(!showNotLiveOnly);
                        if (!showNotLiveOnly) setShowLiveOnly(false);
                    }}
                  >
                    <Clock className="w-3 h-3" />
                    A INICIAR
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-3 flex items-center gap-1.5 font-bold text-[10px] tracking-tight ${sortByLiquidity ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 border border-emerald-500/30 shadow-sm" : "hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground"}`}
                    onClick={() => setSortByLiquidity(!sortByLiquidity)}
                    title="Ordenar por Maior Liquidez"
                  >
                    <Activity className="w-3 h-3" />
                    LIQUIDEZ
                  </Button>
              </div>

              <TabsList className="bg-black/5 dark:bg-black/20 border border-border/10 h-8 p-0.5">
                <TabsTrigger value="league" className="text-[10px] font-black h-7 px-4 rounded data-[state=active]:bg-secondary data-[state=active]:text-primary">
                  LIGAS
                </TabsTrigger>
                <TabsTrigger value="time" className="text-[10px] font-black h-7 px-4 rounded data-[state=active]:bg-secondary data-[state=active]:text-primary">
                  HORÁRIO
                </TabsTrigger>
              </TabsList>
          </div>
        </div>

        <div className="p-3 bg-secondary/50 border-b border-border/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
            <Input 
              placeholder="Pesquisar por liga ou equipe..." 
              className="pl-9 bg-background/50 border-border/10 h-8 text-xs focus:ring-1 focus:ring-primary/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)] pr-4">
        {loading ? (
          <div className="flex items-center justify-center p-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground bg-card/30 rounded-lg border border-border/50 backdrop-blur-md font-medium">
            Nenhum jogo encontrado {searchQuery ? `para "${searchQuery}"` : "para hoje"}.
          </div>
        ) : (
          <>
            <TabsContent value="league" className="mt-0">
              {Object.entries(byLeague).map(([league, leagueMatches]) => (
                <LeagueGroup key={league} leagueName={league} matches={leagueMatches} />
              ))}
            </TabsContent>

            <TabsContent value="time" className="mt-0 space-y-2">
              {byTime.map((m) => (
                <MatchCard key={m.matchId} match={m} />
              ))}
            </TabsContent>
          </>
        )}
      </ScrollArea>
    </Tabs>
  );
}
