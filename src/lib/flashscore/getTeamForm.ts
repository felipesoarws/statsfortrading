import { MatchInfo } from "./getMatchesOfDay";

export async function getTeamForm(teamId: string | number): Promise<any[]> {
  try {
    const res = await fetch(`https://api.sofascore.com/api/v1/team/${teamId}/events/last/0`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Cache-Control': 'no-cache',
        'Accept': '*/*'
      },
      next: { revalidate: 3600 } // cache for 1 hour to prevent hitting limits rapidly
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    if (!data.events || !Array.isArray(data.events)) return [];
    
    // Reverse it or we just process as is (SofaScore usually returns them sorted by timestamp descending)
    return data.events;
  } catch (e) {
    console.error(`Failed to fetch form for team ${teamId}`, e);
    return [];
  }
}

export function checkSingularidadeCondition(events: any[], teamId: string | number, type: 'HOME' | 'AWAY'): boolean {
  // Get ONLY finished matches that are actually resolved with scores
  const finished = events.filter(e => e.status?.type === 'finished' && e.homeScore?.current !== undefined && e.awayScore?.current !== undefined);
  
  // limit to last 10
  const last10 = finished.slice(0, 10);
  
  for (const match of last10) {
    const isTeamHome = match.homeTeam.id.toString() === teamId.toString();
    const isTeamAway = match.awayTeam.id.toString() === teamId.toString();
    
    if (!isTeamHome && !isTeamAway) continue;

    const myScore = isTeamHome ? match.homeScore.current : match.awayScore.current;
    const oppScore = isTeamHome ? match.awayScore.current : match.homeScore.current;

    if (type === 'HOME') {
      // "O mandante nunca perdeu de 0x1 nos ultimos 30 jogos"
      // Lost 0x1 means: team scored 0, opponent scored 1.
      if (myScore === 0 && oppScore === 1) {
         return false; // Condition violated: they HAVE lost 0x1. Return false immediately.
      }
    } else if (type === 'AWAY') {
      // "Nem o visitante nunca ganhou de 0x1 nos ultimos 30 jogos"
      // Won 1x0 means (from their perspective): team scored 1, opponent scored 0.
      if (myScore === 1 && oppScore === 0) {
         return false; // Condition violated: they HAVE won 1x0. Return false immediately.
      }
    }
  }

  // If we scanned all up to 10 matches and never returned false, the condition holds true!
  return true;
}
