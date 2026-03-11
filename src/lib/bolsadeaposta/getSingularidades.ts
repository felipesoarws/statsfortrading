import { getMatchesOfDay } from './getMatchesOfDay';
import { MatchInfo } from '../flashscore/getMatchesOfDay';

const LAYBACK_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
  'Accept': 'application/json, text/plain, */*',
  'Origin': 'https://bolsadeaposta.bet.br',
  'Referer': 'https://bolsadeaposta.bet.br/'
};

export async function getSingularidades(dateYYYYMMDD: string, timezoneOffsetMinutes: number = 0): Promise<MatchInfo[]> {
  const allMatches = await getMatchesOfDay(dateYYYYMMDD, timezoneOffsetMinutes);
  
  if (!allMatches || allMatches.length === 0) return [];

  const singularidades: MatchInfo[] = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < allMatches.length; i += BATCH_SIZE) {
    const batch = allMatches.slice(i, i + BATCH_SIZE);
    
    const batchResults = await Promise.all(batch.map(async (match) => {
      try {
        // 1. Fetch history for analysis (matching MatchDetails logic: 10 matches, sameSide=true)
        const historyRes = await fetch(`https://data-center-bolsa-statistics-api.layback.trade/api/event/${match.matchId}/history?matches=10&sameSide=true`, { headers: LAYBACK_HEADERS, next: { revalidate: 600 } });
        if (!historyRes.ok) return null;
        
        const historyData = await historyRes.json();
        const homeHistory = historyData.matches?.homeTeam || [];
        const awayHistory = historyData.matches?.awayTeam || [];

        // Condition: Require exactly 10 games for analysis stability
        if (homeHistory.length < 10 || awayHistory.length < 10) return null;

        // Condition 1: Home NEVER lost exactly 0x1 (scored 0, conceded 1) at HOME
        // API already filtered by sameSide=true, but we still check the score
        const homeLost01 = homeHistory.some((m: any) => Number(m.goalsHome) === 0 && Number(m.goalsAway) === 1);
        if (homeLost01) return null;

        // Condition 2: Away NEVER won exactly 1x0 (scored 1, conceded 0) AWAY
        // API already filtered by sameSide=true, but we still check the score
        const awayWon10 = awayHistory.some((m: any) => Number(m.goalsHome) === 0 && Number(m.goalsAway) === 1);
        if (awayWon10) return null;

        // 2. Fetch Lay 0-1 odd for this match
        const runnersRes = await fetch(`https://data-center-bolsa-statistics-api.layback.trade/api/market/runners?provider=matchbook&eventId=${match.matchId}`, { headers: LAYBACK_HEADERS, next: { revalidate: 300 } });
        let lay01Odd = undefined;
        if (runnersRes.ok) {
           const runnersRaw = await runnersRes.json();
           const runners = Array.isArray(runnersRaw) ? runnersRaw : (runnersRaw?.markets || []);
           const csMarket = runners.find((m: any) => m.name.toLowerCase().includes('correct score'));
           const runner01 = csMarket?.runners?.find((r: any) => r.name.includes('0 - 1') || r.name.includes('0-1'));
           const layPrice = runner01?.prices?.find((p: any) => p.side === 'lay')?.odds;
           lay01Odd = layPrice || runner01?.lastMatchedPrice;
        }

        return { ...match, lay01Odd: lay01Odd?.toFixed(2) };
      } catch (e) {
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
