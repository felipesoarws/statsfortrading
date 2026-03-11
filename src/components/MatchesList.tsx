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
  const [dateOffset, setDateOffset] = useState(0); // -1: Yesterday, 0: Today, 1: Tomorrow
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedDate = useMemo(() => getFormattedDate(dateOffset), [dateOffset]);

  const fetchMatches = async (dateStr: string) => {
    try {
      const res = await fetch(`/api/matches?date=${dateStr}`);
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
        // SofaScore statuses that indicate a live match
        const liveStatuses = ['In progress', '1st half', '2nd half', 'Halftime', 'Extra time', 'Penalties'];
        const isLive = liveStatuses.some(s => match.status?.includes(s)) || (match.status !== 'Ended' && match.status !== 'Not started' && match.status !== 'Scheduled' && match.status !== 'Canceled' && match.status !== 'Postponed');
        return isLive;
      }

      return true;
    });
  }, [matches, searchQuery, showLiveOnly]);

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
      <div className="bg-secondary/40 border border-border/10 rounded-sm mb-6 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b border-border/10">
          <div className="flex flex-col gap-1">
             <h1 className="text-xl font-black tracking-tight text-foreground/90">JOGOS DE HOJE</h1>
             <div className="flex items-center gap-4">
                <div className="flex bg-black/40 p-0.5 rounded border border-border/5">
                  <button 
                    className={`text-[10px] font-bold px-3 py-1 rounded transition-colors ${dateOffset === -1 ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setDateOffset(-1)}
                  >
                    ONTEM
                  </button>
                  <button 
                    className={`text-[10px] font-bold px-3 py-1 rounded transition-colors ${dateOffset === 0 ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setDateOffset(0)}
                  >
                    HOJE
                  </button>
                  <button 
                    className={`text-[10px] font-bold px-3 py-1 rounded transition-colors ${dateOffset === 1 ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setDateOffset(1)}
                  >
                    AMANHÃ
                  </button>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <Button 
                variant="ghost"
                size="sm"
                className={`h-8 px-4 flex items-center gap-2 font-black text-[10px] tracking-tight border border-border/10 ${showLiveOnly ? "bg-primary/10 text-primary border-primary/20" : "bg-black/20 text-muted-foreground"}`}
                onClick={() => setShowLiveOnly(!showLiveOnly)}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${showLiveOnly ? "bg-primary animate-pulse" : "bg-muted-foreground/40"}`} />
                AO VIVO
              </Button>

              <TabsList className="bg-black/20 border border-border/10 h-8 p-0.5">
                <TabsTrigger value="league" className="text-[10px] font-black h-7 px-4 rounded data-[state=active]:bg-secondary data-[state=active]:text-primary">
                  LIGAS
                </TabsTrigger>
                <TabsTrigger value="time" className="text-[10px] font-black h-7 px-4 rounded data-[state=active]:bg-secondary data-[state=active]:text-primary">
                  HORÁRIO
                </TabsTrigger>
              </TabsList>
          </div>
        </div>

        <div className="p-3 bg-black/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
            <Input 
              placeholder="Pesquisar por liga ou equipe..." 
              className="pl-9 bg-black/20 border-border/5 h-8 text-xs focus:ring-1 focus:ring-primary/30"
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
