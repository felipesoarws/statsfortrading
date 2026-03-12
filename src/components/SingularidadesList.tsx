"use client";

import { useEffect, useState, useMemo } from "react";
import { MatchInfo } from "@/lib/flashscore/getMatchesOfDay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeagueGroup } from "@/components/LeagueGroup";
import { MatchCard } from "@/components/MatchCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Calendar } from "lucide-react";
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

export function SingularidadesList() {
  const [matches, setMatches] = useState<MatchInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => getFormattedDate(0));
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'lay01' | 'no00'>('all');

  const fetchSingularidades = async (dateStr: string) => {
    try {
      const offset = new Date().getTimezoneOffset();
      const res = await fetch(`/api/singularidades?date=${dateStr}&timezoneOffset=${offset}`);
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      }
    } catch (e) {
      console.error("Failed to load singularidades", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSingularidades(selectedDate);
  }, [selectedDate]);

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const matchesSearch = match.league.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            match.home.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            match.away.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (filterType === 'lay01') {
        // We'll rely on the fact that if it's NOT no00, it MUST be lay01 based on our return condition.
        // But some might be both.
        // For now, let's just filter by isNoZeroZero if 'no00' is selected.
        return true; 
      }
      
      if (filterType === 'no00') {
        return match.isNoZeroZero === true;
      }

      return true;
    });
  }, [matches, searchQuery, filterType]);

  // Group by League
  const byLeague = useMemo(() => {
    return filteredMatches.reduce((acc, match) => {
      if (!acc[match.league]) acc[match.league] = [];
      acc[match.league].push(match);
      return acc;
    }, {} as Record<string, MatchInfo[]>);
  }, [filteredMatches]);

  // Group by Time
  const byTime = useMemo(() => {
    return [...filteredMatches].sort((a, b) => a.time.localeCompare(b.time));
  }, [filteredMatches]);

  return (
    <Tabs defaultValue="league" className="w-full">
      <div className="bg-secondary/40 border border-border/10 rounded-sm mb-2 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-2 border-b border-border/10">
          <div className="flex flex-col gap-1">
             <h1 className="text-xl font-black tracking-tight text-foreground/90 uppercase">
               {selectedDate === getFormattedDate(-1) ? "Singularidades DE ONTEM" :
                selectedDate === getFormattedDate(0) ? "Singularidades DE HOJE" :
                selectedDate === getFormattedDate(1) ? "Singularidades DE AMANHÃ" :
                `Singularidades - ${selectedDate.slice(6,8)}/${selectedDate.slice(4,6)}/${selectedDate.slice(0,4)}`}
             </h1>
             <div className="flex items-center gap-2">
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
              <div className="flex bg-black/5 dark:bg-black/20 p-0.5 rounded border border-border/10">
                <button 
                  className={`text-[9px] font-black px-3 py-1 rounded transition-colors ${filterType === 'all' ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setFilterType('all')}
                >
                  TODAS
                </button>
                <button 
                  className={`text-[9px] font-black px-3 py-1 rounded transition-colors ${filterType === 'lay01' ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setFilterType('lay01')}
                >
                  LAY 0-1
                </button>
                <button 
                  className={`text-[9px] font-black px-3 py-1 rounded transition-colors ${filterType === 'no00' ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setFilterType('no00')}
                >
                  LAY 0-0
                </button>
              </div>
              <div className="w-px h-4 bg-border/20 mx-1" />
              <TabsList className="bg-black/5 dark:bg-black/20 border border-border/10 h-7 p-0.5">
                <TabsTrigger value="league" className="text-[10px] font-black h-6 px-4 rounded data-[state=active]:bg-secondary data-[state=active]:text-primary">
                  LIGAS
                </TabsTrigger>
                <TabsTrigger value="time" className="text-[10px] font-black h-6 px-4 rounded data-[state=active]:bg-secondary data-[state=active]:text-primary">
                  HORÁRIO
                </TabsTrigger>
              </TabsList>
          </div>
        </div>

      <div className="p-3 bg-secondary/50 border-b border-border/5 relative z-10 w-full mb-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
          <Input 
            placeholder="Pesquisar por liga ou equipe..." 
            className="pl-9 bg-background/50 border-border/10 h-8 text-xs focus:ring-1 focus:ring-primary/30 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)] pr-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-24 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-xs text-muted-foreground animate-pulse font-medium">Buscando formulário histórico profundo de times e calculando singularidades. Isso pode levar alguns segundos...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground bg-card/30 rounded-lg border border-border/50 backdrop-blur-md font-medium">
            Nenhuma Singularidade encontrada para este dia.
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
