import { getMatchesOfDay } from './getMatchesOfDay';
import { MatchInfo } from '../flashscore/getMatchesOfDay';

const LAYBACK_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
  'Accept': 'application/json, text/plain, */*',
  'Origin': 'https://bolsadeaposta.bet.br',
  'Referer': 'https://bolsadeaposta.bet.br/'
};

interface BolsaMatch {
  goalsHome: string | number;
  goalsAway: string | number;
}

interface BolsaRunner {
  name: string;
  lastMatchedPrice?: number;
  prices?: {
    side: string;
    odds: number;
  }[];
}

interface BolsaMarket {
  name: string;
  runners?: BolsaRunner[];
}

export async function getSingularidades(dateYYYYMMDD: string, timezoneOffsetMinutes: number = 0): Promise<MatchInfo[]> {
  const allMatches = await getMatchesOfDay(dateYYYYMMDD, timezoneOffsetMinutes);
  
  if (!allMatches || allMatches.length === 0) return [];

  const singularidades: MatchInfo[] = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < allMatches.length; i += BATCH_SIZE) {
    const batch = allMatches.slice(i, i + BATCH_SIZE);
    
    const batchResults = await Promise.all(batch.map(async (match) => {
      try {
        // 1. Fetch history for analysis (matching MatchDetails logic: 20 matches, sameSide=true)
        const historyRes = await fetch(`https://data-center-bolsa-statistics-api.layback.trade/api/event/${match.matchId}/history?matches=20&sameSide=true`, { headers: LAYBACK_HEADERS, next: { revalidate: 600 } });
        if (!historyRes.ok) return null;
        
        const historyData = await historyRes.json();
        const homeHistory: BolsaMatch[] = historyData.matches?.homeTeam || [];
        const awayHistory: BolsaMatch[] = historyData.matches?.awayTeam || [];

        // Condition: Require exactly 20 games for analysis stability
        if (homeHistory.length < 20 || awayHistory.length < 20) return null;

        // Condition 1: Home NEVER lost exactly 0x1 (scored 0, conceded 1) at HOME
        const homeLost01 = homeHistory.some((m) => Number(m.goalsHome) === 0 && Number(m.goalsAway) === 1);

        // Condition 2: Away NEVER won exactly 1x0 (scored 1, conceded 0) AWAY
        const awayWon10 = awayHistory.some((m) => Number(m.goalsHome) === 0 && Number(m.goalsAway) === 1);

        // EXTRA Condition: No 0x0 for both in last 20
        const homeHas00 = homeHistory.some((m) => Number(m.goalsHome) === 0 && Number(m.goalsAway) === 0);
        const awayHas00 = awayHistory.some((m) => Number(m.goalsHome) === 0 && Number(m.goalsAway) === 0);
        const isNoZeroZero = !homeHas00 && !awayHas00;

        // Valid if either "Lay 0-1" logic passes OR "No 0x0" logic passes
        const isLay01Passed = !homeLost01 && !awayWon10;

        if (!isLay01Passed && !isNoZeroZero) return null;

        // 2. Fetch Lay 0-1 odd for this match
        const runnersRes = await fetch(`https://data-center-bolsa-statistics-api.layback.trade/api/market/runners?provider=matchbook&eventId=${match.matchId}`, { headers: LAYBACK_HEADERS, next: { revalidate: 300 } });
        let lay01Odd: number | undefined = undefined;
        if (runnersRes.ok) {
           const runnersRaw = await runnersRes.json();
           const runners: BolsaMarket[] = Array.isArray(runnersRaw) ? runnersRaw : (runnersRaw?.markets || []);
           const csMarket = runners.find((m) => m.name.toLowerCase().includes('correct score'));
           const runner01 = csMarket?.runners?.find((r) => r.name.includes('0 - 1') || r.name.includes('0-1'));
           const layPrice = runner01?.prices?.find((p) => p.side === 'lay')?.odds;
           lay01Odd = layPrice || runner01?.lastMatchedPrice;
        }

        return { ...match, lay01Odd: lay01Odd?.toFixed(2), isNoZeroZero };
      } catch (_e) {
        return null;
      }
    }));

    for (const res of batchResults) {
      if (res) singularidades.push(res);
    }

    if (i + BATCH_SIZE < allMatches.length) {
      await new Promise(r => setTimeout(r, 100)); // Be polite
    }
  }

  return singularidades;
}
