export interface MatchInfo {
  matchId: string;
  league: string;
  time: string;
  home: string;
  away: string;
  status?: string;
  homeScore?: number;
  awayScore?: number;
  homeLogo?: string;
  awayLogo?: string;
  leagueLogo?: string;
  countryCode?: string;
  homePenalties?: number;
  awayPenalties?: number;
  liveTime?: string;
}

export async function getMatchesOfDay(dateYYYYMMDD: string): Promise<MatchInfo[]> {
  // Convert 20260310 to 2026-03-10
  const year = dateYYYYMMDD.slice(0, 4);
  const month = dateYYYYMMDD.slice(4, 6);
  const day = dateYYYYMMDD.slice(6, 8);
  const dateStr = `${year}-${month}-${day}`;

  const url = `https://api.sofascore.com/api/v1/sport/football/scheduled-events/${dateStr}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Cache-Control': 'no-cache',
        'Accept': '*/*'
      },
      next: { revalidate: 60 } // cache for 60 seconds
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch sofascore feed: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    if (!data.events || data.events.length === 0) {
      return [];
    }

    const matches: MatchInfo[] = data.events.map((event: any) => {
      const date = new Date(event.startTimestamp * 1000);
      const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      const homeScore = event.homeScore?.current;
      const awayScore = event.awayScore?.current;

      // Calculate live time if match is in progress
      let liveTime = undefined;
      if (event.status.type === 'inprogress' && event.time?.currentPeriodStartTimestamp) {
         const startTs = event.time.currentPeriodStartTimestamp;
         const now = Math.floor(Date.now() / 1000);
         let minutes = Math.floor((now - startTs) / 60);
         
         if (event.status.description === '1st half') {
            liveTime = `${Math.min(minutes, 45)}'`;
         } else if (event.status.description === '2nd half') {
            liveTime = `${Math.min(minutes + 45, 90)}'`;
         } else if (event.status.description === 'Extra time') {
            liveTime = `${minutes + 90}'`;
         } else {
            liveTime = minutes > 0 ? `${minutes}'` : event.status.description;
         }
      } else if (event.status.type === 'inprogress') {
         liveTime = event.status.description;
      }

      return {
        matchId: event.id.toString(),
        league: event.tournament?.name || 'Unknown',
        home: event.homeTeam?.name || 'Unknown',
        away: event.awayTeam?.name || 'Unknown',
        time: timeStr,
        status: event.status?.description || event.status?.type || 'Scheduled',
        homeScore,
        awayScore,
        homeLogo: event.homeTeam?.id ? `https://api.sofascore.app/api/v1/team/${event.homeTeam.id}/image` : undefined,
        awayLogo: event.awayTeam?.id ? `https://api.sofascore.app/api/v1/team/${event.awayTeam.id}/image` : undefined,
        leagueLogo: event.tournament?.uniqueTournament?.id ? `https://api.sofascore.app/api/v1/unique-tournament/${event.tournament.uniqueTournament.id}/image` : undefined,
        countryCode: event.tournament?.category?.alpha2 ? event.tournament.category.alpha2.toLowerCase() : undefined,
        homePenalties: event.homeScore?.penalties,
        awayPenalties: event.awayScore?.penalties,
        liveTime
      };
    });
    
    return matches;
  } catch (error) {
    console.error('Error fetching matches of the day:', error);
    return [];
  }
}
