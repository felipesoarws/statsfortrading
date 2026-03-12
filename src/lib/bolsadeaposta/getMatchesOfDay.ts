import { MatchInfo } from '../flashscore/getMatchesOfDay';
import { resolveTeamLogo } from '../sofascore/getTeamLogos';
import { BolsaRunner, BolsaMarket, ScheduledEvent, InPlayEvent } from './types';

const MEXCHANGE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Origin': 'https://mexchange2.bolsadeaposta.bet.br',
  'Referer': 'https://mexchange2.bolsadeaposta.bet.br/',
  'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site'
};


const LAYBACK_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
  'Accept': 'application/json, text/plain, */*',
  'Origin': 'https://bolsadeaposta.bet.br',
  'Referer': 'https://bolsadeaposta.bet.br/'
};

/** Resolve SofaScore logos for a list of matches in parallel batches to avoid rate limiting */
async function resolveLogos(matches: MatchInfo[]): Promise<MatchInfo[]> {
  const BATCH = 8; // Increased batch size for more throughput
  const result = [...matches];
  const MAX_LOGOS = 100; // Increased to 100 to cover more games on homepage
  
  for (let i = 0; i < Math.min(result.length, MAX_LOGOS); i += BATCH) {
    const batch = result.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (m, idx) => {
        try {
          const [homeLogo, awayLogo] = await Promise.all([
            resolveTeamLogo(m.home),
            resolveTeamLogo(m.away),
          ]);
          const realIdx = i + idx;
          if (homeLogo) result[realIdx] = { ...result[realIdx], homeLogo };
          if (awayLogo) result[realIdx] = { ...result[realIdx], awayLogo };
        } catch {
          // Ignore logo errors, we have fallbacks
        }
      })
    );
  }
  return result;
}



export async function getMatchesOfDay(dateYYYYMMDD: string, timezoneOffsetMinutes: number = 0): Promise<MatchInfo[]> {
  try {
    const localNow = new Date(Date.now() - (timezoneOffsetMinutes * 60 * 1000));
    const today = localNow.toISOString().split('T')[0].replace(/-/g, '');
    const isPast = dateYYYYMMDD < today;

    if (isPast) {
      // 0. Fetch Past Matches
      const formattedDate = `${dateYYYYMMDD.slice(0, 4)}-${dateYYYYMMDD.slice(4, 6)}-${dateYYYYMMDD.slice(6, 8)}`;
      const url = `https://data-center-bolsa-statistics-api.layback.trade/api/past-events?startDate=${formattedDate}&perPage=100&page=1&groupedByLeague=true`;
      const pastRes = await fetch(url, { headers: LAYBACK_HEADERS, next: { revalidate: 3600 } });
      const pastData = pastRes.ok ? await pastRes.json() : [];
      
      // Handle grouped structure if groupedByLeague is true
      let events = [];
      const pastMatches = Array.isArray(pastData) ? pastData : (pastData.matches || []);
      
      if (Array.isArray(pastMatches)) {
        // Check if elements are leagues or events
        if (pastMatches.length > 0 && pastMatches[0].events) {
          // It's grouped: [{ leagueName, events: [...] }, ...]
          events = pastMatches.flatMap((group: { leagueName: string, events: ScheduledEvent[] }) => 
            group.events.map((e) => ({ ...e, leagueName: group.leagueName || e.leagueName }))
          );
        } else {
          events = pastMatches;
        }
      }

      const mapped: MatchInfo[] = events.map((event: ScheduledEvent & InPlayEvent & { startDate?: string; homeTeamName?: string; awayTeamName?: string; homeTeamScore?: string; awayTeamScore?: string; eventId?: string | number }) => {
        const date = new Date(event.startDate || event.start || Date.now());
        const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return {
          matchId: String(event.eventId || event.id),
          league: event.leagueName || 'Encerrado',
          time: timeStr,
          home: event.homeTeamName || (event.home && typeof event.home === 'object' ? event.home.name : event.home) || event.name?.split(' vs ')[0] || 'Unknown',
          away: event.awayTeamName || (event.away && typeof event.away === 'object' ? event.away.name : event.away) || event.name?.split(' vs ')[1] || 'Unknown',
          status: 'FINISHED',
          homeScore: parseInt(String(event.homeTeamScore || (event.score && typeof event.score === 'object' && event.score.home ? event.score.home.score : (event.home && typeof event.home === 'object' ? event.home.score : '0')))),
          awayScore: parseInt(String(event.awayTeamScore || (event.score && typeof event.score === 'object' && event.score.away ? event.score.away.score : (event.away && typeof event.away === 'object' ? event.away.score : '0')))),
          homeLogo: `https://data-center-bolsa-statistics-api.layback.trade/api/event/${event.eventId || event.id}/image?team=home`,
          awayLogo: `https://data-center-bolsa-statistics-api.layback.trade/api/event/${event.eventId || event.id}/image?team=away`,
        };
      });

      // Resolve SofaScore logos in parallel batches (5 at a time to be polite)
      const withLogos = await resolveLogos(mapped);
      return withLogos.sort((a, b) => a.time.localeCompare(b.time));
    }

    // 1. Fetch In-Play Matches
    let inplayData = [];
    try {
      const inplayRes = await fetch('https://bolsadeaposta.bet.br/client/api/jumper/feedSports/inplay-info', { 
        headers: LAYBACK_HEADERS, 
        next: { revalidate: 30 },
        signal: AbortSignal.timeout(5000) 
      });
      if (inplayRes.ok) {
        inplayData = await inplayRes.json();
      } else {
        console.warn(`[Bolsa] In-play fetch failed: ${inplayRes.status}`);
      }
    } catch (e) {
      console.error('[Bolsa] In-play fetch error:', e);
    }

    // 2. Fetch Scheduled Matches (MExchange)
    let scheduledEvents = [];
    try {
      const url = 'https://mexchange-api.bolsadeaposta.bet.br/api/events?offset=0&per-page=100&sort-by=start&sort-direction=asc&sport-ids=15&market-types=correct_score&en-market-names=Correct+Score&markets-limit=30';
      const scheduledRes = await fetch(url, { 
        headers: MEXCHANGE_HEADERS, 
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(8000)
      });
      if (scheduledRes.ok) {
        const scheduledData = await scheduledRes.json();
        scheduledEvents = scheduledData.events || [];
      } else {
        console.warn(`[Bolsa] Scheduled fetch failed: ${scheduledRes.status}`);
      }
    } catch (e) {
      console.error('[Bolsa] Scheduled fetch error:', e);
    }

    const matches: MatchInfo[] = [];

    // Map scheduled and in-play events from MExchange first (they have league info)
    const scheduledMap = new Map<string, MatchInfo>();
    scheduledEvents.forEach((event: ScheduledEvent) => {
      const date = new Date(event.start);
      // Adjust date to local timezone using the offset provided
      const localDate = new Date(date.getTime() - (timezoneOffsetMinutes * 60 * 1000));
      const eventDateStr = localDate.toISOString().split('T')[0].replace(/-/g, '');
      
      if (eventDateStr !== dateYYYYMMDD) return;

      const leagueTag = event['meta-tags']?.find((t) => t.type === 'COMPETITION');
      const leagueName = leagueTag?.name || event.competitionName || 'Futebol';
      
      const [home, away] = event.name.split(' vs ');
      const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      let totalVolume = 0;
      if (event.markets && Array.isArray(event.markets)) {
         event.markets.forEach((m: BolsaMarket) => {
            if (m.runners && Array.isArray(m.runners)) {
               totalVolume += m.runners.reduce((acc: number, r: BolsaRunner) => acc + (parseFloat(String(r.volume || '0'))), 0);
            }
         });
      }

      scheduledMap.set(String(event.id), {
        matchId: String(event.id),
        league: leagueName,
        time: timeStr,
        home: home || event.name,
        away: away || '',
        status: event['in-running-flag'] ? 'LIVE' : 'Scheduled',
        homeLogo: `https://data-center-bolsa-statistics-api.layback.trade/api/event/${event.id}/image?team=home`,
        awayLogo: `https://data-center-bolsa-statistics-api.layback.trade/api/event/${event.id}/image?team=away`,
        totalVolume,
      });
    });

    // Augment with Live Data (scores, elapsed time)
    if (Array.isArray(inplayData)) {
      inplayData.forEach((liveEvent: InPlayEvent) => {
        const id = String(liveEvent.eventId);
        const existing = scheduledMap.get(id);
        
        if (existing) {
          existing.status = 'LIVE';
          existing.homeScore = parseInt(liveEvent.score?.home?.score || liveEvent.home?.score || '0');
          existing.awayScore = parseInt(liveEvent.score?.away?.score || liveEvent.away?.score || '0');
          existing.liveTime = liveEvent.timeElapsed ? `${liveEvent.timeElapsed}'` : undefined;
        } else {
          // Verify that this live event actually belongs to the requested date!
          const date = new Date(liveEvent.startDate || Date.now());
          const localDate = new Date(date.getTime() - (timezoneOffsetMinutes * 60 * 1000));
          const eventDateStr = localDate.toISOString().split('T')[0].replace(/-/g, '');
          
          if (eventDateStr === dateYYYYMMDD) {
              const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              matches.push({
                matchId: id,
                league: liveEvent.leagueName || 'Ao Vivo',
                time: timeStr,
                home: (liveEvent.score?.home?.name || liveEvent.home?.name || 'Unknown'),
                away: (liveEvent.score?.away?.name || liveEvent.away?.name || 'Unknown'),
                status: 'LIVE',
                homeScore: parseInt(liveEvent.score?.home?.score || liveEvent.home?.score || '0'),
                awayScore: parseInt(liveEvent.score?.away?.score || liveEvent.away?.score || '0'),
                liveTime: liveEvent.timeElapsed ? `${liveEvent.timeElapsed}'` : undefined,
                homeLogo: `https://data-center-bolsa-statistics-api.layback.trade/api/event/${id}/image?team=home`,
                awayLogo: `https://data-center-bolsa-statistics-api.layback.trade/api/event/${id}/image?team=away`,
                totalVolume: 0,
              });
          }
        }
      });
    }

    const finalMatches = [...Array.from(scheduledMap.values()), ...matches];
    const sorted = finalMatches.sort((a, b) => a.time.localeCompare(b.time));
    // Resolve SofaScore logos for all matches in the list
    return await resolveLogos(sorted);
  } catch (error) {
    console.error('Error fetching Bolsa matches:', error);
    return [];
  }
}
