import { MatchDetails, MatchHistory, TeamAnalysis, MarketStats } from '../flashscore/getMatchDetails';
import { getSofascoreTeamLogo } from '../sofascore/getTeamLogos';
import { getSofaScoreH2H } from '../sofascore/getH2H';
export type { MatchDetails, MatchHistory, TeamAnalysis, MarketStats };

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

// Simplified fetch without retries or verbose logs
async function fetchWithRetry(url: string, options: RequestInit & { next?: any }): Promise<Response> {
  return fetch(url, options);
}

async function safeJson(res: Response, fallback: any = null) {
  if (!res.ok) return fallback;
  const text = await res.text();
  if (!text || text.trim() === '') return fallback;
  try {
    return JSON.parse(text);
  } catch (e) {
    return fallback;
  }
}

export async function getMatchDetails(matchId: string, limit: number = 20, competitionId?: number): Promise<MatchDetails | null> {
  try {
    // 1. Fetch Event Info (Includes Base64 logos)
    const infoUrl = `https://data-center-bolsa-statistics-api.layback.trade/api/event/${matchId}/info`;
    const infoRes = await fetchWithRetry(infoUrl, { headers: LAYBACK_HEADERS, next: { revalidate: 300 } });
    let info = await safeJson(infoRes);
    
    // Fallback: If info is missing (common for past events), try to recover from history
    if (!info) {
      const fallbackHistUrl = `https://data-center-bolsa-statistics-api.layback.trade/api/event/${matchId}/history?matches=1`;
      const fallbackHistRes = await fetchWithRetry(fallbackHistUrl, { headers: LAYBACK_HEADERS, next: { revalidate: 3600 } });
      const fallbackHistData = await safeJson(fallbackHistRes);
      
      const foundMatch = [...(fallbackHistData?.matches?.homeTeam || []), ...(fallbackHistData?.matches?.awayTeam || [])]
        .find((m: any) => String(m.eventId) === String(matchId));
      
      if (foundMatch) {
        info = {
          homeTeamName: foundMatch.home,
          awayTeamName: foundMatch.away,
          startDate: foundMatch.startDate,
          leagueName: foundMatch.league,
          eventStatus: 'FINISHED',
          homeInitialOdd: undefined,
          drawInitialOdd: undefined,
          awayInitialOdd: undefined
        };
      } else {
        return null;
      }
    }

    // 2. Fetch History, Score, Runners and SofaScore H2H in parallel
    const historyParams = new URLSearchParams({ matches: String(limit), sameSide: 'true' });
    if (competitionId) historyParams.set('sameLeague', 'true');
    const historyUrl = `https://data-center-bolsa-statistics-api.layback.trade/api/event/${matchId}/history?${historyParams.toString()}`;
    
    const [historyRes, scoreRes, eventsRes, homeLogoResult, awayLogoResult, sofascoreH2H] = await Promise.all([
      fetchWithRetry(historyUrl, { headers: LAYBACK_HEADERS, next: { revalidate: 600 } }),
      fetchWithRetry(`https://data-center-bolsa-statistics-api.layback.trade/api/event/${matchId}/score`, { headers: LAYBACK_HEADERS, next: { revalidate: 60 } }),
      fetchWithRetry(`https://mexchange-api.bolsadeaposta.bet.br/api/events/${matchId}?popular-count=10`, { headers: MEXCHANGE_HEADERS, next: { revalidate: 300 } }),
      getSofascoreTeamLogo(info.homeTeamName),
      getSofascoreTeamLogo(info.awayTeamName),
      getSofaScoreH2H(info.homeTeamName, info.awayTeamName),
    ]);

    const historyData = await safeJson(historyRes, { matches: { homeTeam: [], awayTeam: [] } });
    const scoreResData = await safeJson(scoreRes);
    const runnersRaw = await safeJson(eventsRes, {});
    const runnersData: any[] = runnersRaw?.markets || [];
    const totalVolume = runnersRaw?.volume || 0;
    
    // Extract more info from meta-tags
    const competitionTag = runnersRaw?.['meta-tags']?.find((t: any) => t.type === 'COMPETITION');
    const countryTag = runnersRaw?.['meta-tags']?.find((t: any) => t.type === 'COUNTRY');
    const leagueName = competitionTag?.name || info.leagueName || 'Competição';

    // Base64 fallback for logos
    const formatLogoBase64 = (base64: string | null) => {
      if (!base64) return null;
      const cleanBase64 = base64.replace(/^data:image\/png;base64,/, '');
      return `data:image/png;base64,${cleanBase64}`;
    };

    const homeLogo = homeLogoResult?.logo || formatLogoBase64(info.homeTeamImage) || '';
    const awayLogo = awayLogoResult?.logo || formatLogoBase64(info.awayTeamImage) || '';

    // Mapping helper — sync, logos added afterwards
    const mapBolsaMatchToHistory = (m: any, focusTeamName: string): MatchHistory => {
      const isHome = m.home.toLowerCase().includes(focusTeamName.toLowerCase());
      const teamScore = parseInt(isHome ? m.goalsHome : m.goalsAway);
      const opponentScore = parseInt(isHome ? m.goalsAway : m.goalsHome);
      
      let result: 'V' | 'E' | 'D' = 'E';
      if (teamScore > opponentScore) result = 'V';
      else if (teamScore < opponentScore) result = 'D';

      return {
        date: new Date(m.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        competition: m.league || 'Liga',
        score: (m.goalsHome !== undefined && m.goalsAway !== undefined) ? `${m.goalsHome} - ${m.goalsAway}` : '-',
        opponent: isHome ? m.away : m.home,
        isHome,
        result,
        teamScore,
        opponentScore,
        teamHTScore: parseInt(isHome ? (m.goalsHomeHt || 0) : (m.goalsAwayHt || 0)),
        opponentHTScore: parseInt(isHome ? (m.goalsAwayHt || 0) : (m.goalsHomeHt || 0)),
        homeTeamId: m.eventId,
        awayTeamId: m.eventId,
        homeTeamName: m.home,
        awayTeamName: m.away,
      } as any;
    };

    const homeHistoryRaw = (historyData.matches?.homeTeam || []).map((m: any) => mapBolsaMatchToHistory(m, info.homeTeamName));
    const awayHistoryRaw = (historyData.matches?.awayTeam || []).map((m: any) => mapBolsaMatchToHistory(m, info.awayTeamName));

    const logoCache = new Map<string, string>();
    logoCache.set(info.homeTeamName.toLowerCase(), homeLogo);
    logoCache.set(info.awayTeamName.toLowerCase(), awayLogo);

    const resolveOpponentLogo = async (name: string): Promise<string> => {
      const key = name.toLowerCase();
      if (logoCache.has(key)) return logoCache.get(key)!;
      const result = await getSofascoreTeamLogo(name);
      const logo = result?.logo || '';
      logoCache.set(key, logo);
      return logo;
    };

    await Promise.all([...homeHistoryRaw, ...awayHistoryRaw].map(async (row: any) => {
        row.homeLogo = await resolveOpponentLogo(row.homeTeamName);
        row.awayLogo = await resolveOpponentLogo(row.awayTeamName);
    }));

    const calculateAnalysis = (matches: MatchHistory[]): TeamAnalysis => {
      const last10 = matches.slice(0, 10);
      const goalsScored = last10.reduce((sum, m) => sum + m.teamScore, 0);
      const goalsConceded = last10.reduce((sum, m) => sum + m.opponentScore, 0);
      const count = last10.length || 1;
      
      const calcMarket = (ms: MatchHistory[], period: 'FT' | 'HT'): MarketStats => {
        const mc = ms.length || 1;
        const over05 = ms.filter(m => (period === 'FT' ? m.teamScore + m.opponentScore : m.teamHTScore + m.opponentHTScore) > 0.5).length;
        const over15 = ms.filter(m => (period === 'FT' ? m.teamScore + m.opponentScore : m.teamHTScore + m.opponentHTScore) > 1.5).length;
        const over25 = ms.filter(m => (period === 'FT' ? m.teamScore + m.opponentScore : m.teamHTScore + m.opponentHTScore) > 2.5).length;
        const btts = ms.filter(m => (period === 'FT' ? (m.teamScore > 0 && m.opponentScore > 0) : (m.teamHTScore > 0 && m.opponentHTScore > 0))).length;
        return {
          over05: Math.round((over05 / mc) * 100), over15: Math.round((over15 / mc) * 100), over25: Math.round((over25 / mc) * 100),
          under05: Math.round(((mc - over05) / mc) * 100), under15: Math.round(((mc - over15) / mc) * 100), under25: Math.round(((mc - over25) / mc) * 100),
          btts: Math.round((btts / mc) * 100),
        };
      };

      return {
        totalGoals: goalsScored + goalsConceded,
        avgTotalGoals: (goalsScored + goalsConceded) / count,
        goalsScored, avgGoalsScored: goalsScored / count,
        goalsConceded, avgGoalsConceded: goalsConceded / count,
        ftMarkets: calcMarket(last10, 'FT'),
        htMarkets: calcMarket(last10, 'HT'),
      };
    };

    const findOdds = (marketName: string, runnerName: string, side: 'back' | 'lay' = 'back') => {
      // Find all markets of that type, then find the runner that matches
      const markets = (runnersData || []).filter((m: any) => m.name.toLowerCase().includes(marketName.toLowerCase()));
      
      for (const m of markets) {
        const runner = m.runners?.find((r: any) => r.name.toLowerCase().includes(runnerName.toLowerCase()));
        if (!runner) continue;

        const prices = runner.prices?.filter((p: any) => p.side === side);
        if (prices && prices.length > 0) {
          const sorted = prices.sort((a: any, b: any) => side === 'back' ? b.odds - a.odds : a.odds - b.odds);
          return sorted[0].odds?.toFixed(2);
        }
        
        if (runner['last-matched-odds']) return runner['last-matched-odds'].toFixed(2);
      }
      return undefined;
    };

    const currentHome = findOdds('Match Odds', info.homeTeamName);
    const currentDraw = findOdds('Match Odds', 'Draw');
    const currentAway = findOdds('Match Odds', info.awayTeamName);

    return {
      matchId,
      homeTeam: info.homeTeamName, homeTeamId: 0,
      awayTeam: info.awayTeamName, awayTeamId: 0,
      startTimestamp: Math.floor(new Date(info.startDate).getTime() / 1000),
      competitionName: leagueName,
      countryName: countryTag?.name,
      competitionId: 1, 
      h2h: sofascoreH2H.length > 0 ? sofascoreH2H : [], 
      homePerformanceHome: homeHistoryRaw,
      awayPerformanceAway: awayHistoryRaw,
      homeAnalysis: calculateAnalysis(homeHistoryRaw),
      awayAnalysis: calculateAnalysis(awayHistoryRaw),
      commonScores: [],
      statusType: (info.eventStatus === 'INPLAY' || info.eventStatus === 'LIVE') ? 'inprogress' : 
                  (info.eventStatus === 'DONE' || info.eventStatus === 'FINISHED') ? 'finished' : 'scheduled',
      homeLogo, awayLogo,
      totalVolume,
      currentScore: scoreResData ? { home: parseInt(scoreResData.homeTeamScore || '0'), away: parseInt(scoreResData.awayTeamScore || '0') } : undefined,
      odds: {
        home: info.homeInitialOdd?.toFixed(2) || currentHome, 
        draw: info.drawInitialOdd?.toFixed(2) || currentDraw, 
        away: info.awayInitialOdd?.toFixed(2) || currentAway,
        over25: findOdds('Total', 'OVER 2.5'), 
        under25: findOdds('Total', 'UNDER 2.5'),
        over15: findOdds('Total', 'OVER 1.5'),
        over05: findOdds('Total', 'OVER 0.5'),
        lay00: findOdds('Correct Score', '0-0', 'lay'),
        lay01: findOdds('Correct Score', '0-1', 'lay'),
      }
    };

  } catch (error) {
    console.error('Error fetching Bolsa match details:', error);
    return null;
  }
}
