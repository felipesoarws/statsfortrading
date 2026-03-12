import { SofaScoreEvent } from '../sofascore/types';

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
  lay01Odd?: string;
  totalVolume?: number;
  isNoZeroZero?: boolean;
}

export async function getMatchesOfDay(dateYYYYMMDD: string, timezoneOffsetMinutes: number = 0): Promise<MatchInfo[]> {
  const yearStr = dateYYYYMMDD.slice(0, 4);
  const monthStr = dateYYYYMMDD.slice(4, 6);
  const dayStr = dateYYYYMMDD.slice(6, 8);
  
  // Calculate the local day boundaries in UTC milliseconds
  // We want to fetch matches from local 00:00:00 to 23:59:59.
  // Example: If local is UTC-03:00 (offset = +180), then local midnight is UTC 03:00.
  const midnightUtcForLocalMs = Date.UTC(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr)) + (timezoneOffsetMinutes * 60 * 1000);
  const endOfDayUtcForLocalMs = midnightUtcForLocalMs + (24 * 60 * 60 * 1000); // exactly 24 hours later

  const getYYYYMMDD = (utcMs: number) => {
    const d = new Date(utcMs);
    const yr = d.getUTCFullYear();
    const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
    const da = String(d.getUTCDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  };

  // We fetch previous, current, and next day in UTC from Sofascore just to be safe
  // that we cover our local bound overlaps.
  const centerDateMs = Date.UTC(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
  const prevDayStr = getYYYYMMDD(centerDateMs - 86400000);
  const currDayStr = getYYYYMMDD(centerDateMs);
  const nextDayStr = getYYYYMMDD(centerDateMs + 86400000);

  const urls = [
    `https://api.sofascore.com/api/v1/sport/football/scheduled-events/${prevDayStr}`,
    `https://api.sofascore.com/api/v1/sport/football/scheduled-events/${currDayStr}`,
    `https://api.sofascore.com/api/v1/sport/football/scheduled-events/${nextDayStr}`
  ];

  try {
    // Fetch all 3 days concurrently
    const fetchOpts: RequestInit = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Cache-Control': 'no-cache',
        'Accept': '*/*'
      },
      next: { revalidate: 60 } as any // cache for 60 seconds
    };

    const responses = await Promise.all(
      urls.map(url => 
        fetch(url, fetchOpts)
          .then(r => r.ok ? r.json() : { events: [] })
          .catch((err) => {
            console.error(`Failed to fetch ${url}`, err);
            return { events: [] };
          })
      )
    );

    // Combine all events
    let allEvents: SofaScoreEvent[] = [];
    for (const data of responses) {
      if (data.events && Array.isArray(data.events)) {
        allEvents = allEvents.concat(data.events);
      }
    }

    if (allEvents.length === 0) {
      return [];
    }

    // Deduplicate by event.id
    const eventsMap = new Map();
    for (const event of allEvents) {
      eventsMap.set(event.id, event);
    }

    // Filter to only include events strictly within the local day boundary
    const filteredEvents = Array.from(eventsMap.values() as IterableIterator<SofaScoreEvent>).filter((event) => {
      const eventTimeMs = event.startTimestamp * 1000;
      return eventTimeMs >= midnightUtcForLocalMs && eventTimeMs < endOfDayUtcForLocalMs;
    });

    // Sort by startTimestamp to ensure chronological order
    filteredEvents.sort((a, b) => a.startTimestamp - b.startTimestamp);

    const matches: MatchInfo[] = filteredEvents.map((event) => {
      const date = new Date(event.startTimestamp * 1000);
      const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      const homeScore = event.homeScore?.current;
      const awayScore = event.awayScore?.current;

      // Calculate live time if match is in progress
      let liveTime = undefined;
      const matchStatus = event.status;
      if (matchStatus && matchStatus.type === 'inprogress' && event.time?.currentPeriodStartTimestamp) {
         const startTs = event.time.currentPeriodStartTimestamp;
         const now = Math.floor(Date.now() / 1000);
         const minutes = Math.floor((now - startTs) / 60);
         
         if (matchStatus.description === '1st half') {
            liveTime = `${Math.min(minutes, 45)}'`;
         } else if (matchStatus.description === '2nd half') {
            liveTime = `${Math.min(minutes + 45, 90)}'`;
         } else if (matchStatus.description === 'Extra time') {
            liveTime = `${minutes + 90}'`;
         } else {
            liveTime = minutes > 0 ? `${minutes}'` : matchStatus.description;
         }
      } else if (matchStatus && matchStatus.type === 'inprogress') {
         liveTime = matchStatus.description;
      }

      return {
        matchId: event.id.toString(),
        league: event.tournament?.name || 'Unknown',
        home: event.homeTeam?.name || 'Unknown',
        away: event.awayTeam?.name || 'Unknown',
        time: timeStr,
        status: matchStatus?.description || matchStatus?.type || 'Scheduled',
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
