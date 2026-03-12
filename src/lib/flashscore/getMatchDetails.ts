import { parseFlashscoreFeed } from './parseFlashscoreFeed';
// import { getBolsaOdds } from '../bolsadeaposta/getBolsaOdds';

export interface MatchHistory {
  date: string;
  competition: string;
  score: string;
  opponent: string;
  isHome: boolean;
  result: 'V' | 'E' | 'D';
  teamScore: number;
  opponentScore: number;
  teamHTScore: number;
  opponentHTScore: number;
  homeTeamId: number;
  awayTeamId: number;
  homeLogo?: string;
  awayLogo?: string;
  teamPenalties?: number;
  opponentPenalties?: number;
}

export interface MarketStats {
  over05: number;
  over15: number;
  over25: number;
  under05: number;
  under15: number;
  under25: number;
  btts: number;
}

export interface TeamAnalysis {
  totalGoals: number;
  avgTotalGoals: number;
  goalsScored: number;
  avgGoalsScored: number;
  goalsConceded: number;
  avgGoalsConceded: number;
  ftMarkets: MarketStats;
  htMarkets: MarketStats;
}

export interface MatchDetails {
  matchId: string;
  homeTeam: string;
  homeTeamId: number;
  awayTeam: string;
  awayTeamId: number;
  startTimestamp: number;
  competitionName: string;
  h2h: MatchHistory[];
  homePerformanceHome: MatchHistory[];
  awayPerformanceAway: MatchHistory[];
  homeAnalysis: TeamAnalysis;
  awayAnalysis: TeamAnalysis;
  commonScores: { score: string; count: number }[];
  probabilities?: {
    home: number;
    draw: number;
    away: number;
  };
  homeLogo?: string;
  awayLogo?: string;
  status?: string;
  odds?: {
    home?: string;
    draw?: string;
    away?: string;
    over25?: string;
    under25?: string;
    over15?: string;
    over05?: string;
    lay00?: string;
    lay01?: string;
  };
  currentScore?: {
    home: number;
    away: number;
  };
  statusType?: string;
  statistics?: any[];
  h2hSummary?: {
    homeWins: number;
    draws: number;
    awayWins: number;
  };
  liveTime?: string;
  homePenalties?: number;
  awayPenalties?: number;
  competitionId?: number;
  totalVolume?: number;
  countryName?: string;
}

export async function getMatchDetails(matchId: string, limit: number = 10, competitionId?: number): Promise<MatchDetails | null> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
    'Cache-Control': 'no-cache',
    'Accept': '*/*'
  };

  try {
    // 1. Fetch Event Info
    const eventUrl = `https://api.sofascore.com/api/v1/event/${matchId}`;
    const eventRes = await fetch(eventUrl, { headers, next: { revalidate: 60 } });
    if (!eventRes.ok) return null;
    const { event } = await eventRes.json();

    const homeTeamId = event.homeTeam.id;
    const awayTeamId = event.awayTeam.id;
    const customId = event.customId || matchId;

    // 2. Fetch H2H Events
    const h2hEventsUrl = `https://www.sofascore.com/api/v1/event/${customId}/h2h/events`;
    const h2hEventsRes = await fetch(h2hEventsUrl, { headers, next: { revalidate: 60 } });
    const h2hData = h2hEventsRes.ok ? await h2hEventsRes.json() : { events: [] };

    // 2b. Fetch H2H Summary Data
    const h2hSummaryUrl = `https://api.sofascore.com/api/v1/event/${matchId}/h2h`;
    const h2hSummaryRes = await fetch(h2hSummaryUrl, { headers, next: { revalidate: 60 } });
    let h2hSummary = undefined;
    if (h2hSummaryRes.ok) {
      const summaryData = await h2hSummaryRes.json();
      if (summaryData.teamDuel) {
        h2hSummary = {
          homeWins: summaryData.teamDuel.homeWins || 0,
          draws: summaryData.teamDuel.draws || 0,
          awayWins: summaryData.teamDuel.awayWins || 0,
        };
      }
    }

    // 3. Fetch Home Form
    const homeFormUrl = `https://api.sofascore.com/api/v1/team/${homeTeamId}/events/last/0`;
    const homeFormRes = await fetch(homeFormUrl, { headers, next: { revalidate: 60 } });
    const homeFormData = homeFormRes.ok ? await homeFormRes.json() : { events: [] };

    // 4. Fetch Away Form
    const awayFormUrl = `https://api.sofascore.com/api/v1/team/${awayTeamId}/events/last/0`;
    const awayFormRes = await fetch(awayFormUrl, { headers, next: { revalidate: 60 } });
    const awayFormData = awayFormRes.ok ? await awayFormRes.json() : { events: [] };

    // 5. Fetch Probabilities (Votes)
    const votesUrl = `https://api.sofascore.com/api/v1/event/${matchId}/votes`;
    const votesRes = await fetch(votesUrl, { headers, next: { revalidate: 60 } });
    let probabilities = undefined;
    if (votesRes.ok) {
      const v = await votesRes.json();
      const total = (v.vote1 || 0) + (v.voteX || 0) + (v.vote2 || 0);
      if (total > 0) {
        probabilities = {
          home: Math.round(((v.vote1 || 0) / total) * 100),
          draw: Math.round(((v.voteX || 0) / total) * 100),
          away: Math.round(((v.vote2 || 0) / total) * 100),
        };
      }
    }

    // 6. Fetch Statistics
    const statsUrl = `https://api.sofascore.com/api/v1/event/${matchId}/statistics`;
    const statsRes = await fetch(statsUrl, { headers, next: { revalidate: 60 } });
    const statistics = statsRes.ok ? (await statsRes.json()).statistics : undefined;

    // 7. Fetch Odds from Bolsa de Aposta (official)
    // const bolsaOdds = await getBolsaOdds(event.homeTeam.name, event.awayTeam.name, event.startTimestamp);
    const oddsData = undefined;

    const parseMatches = (events: any[], focusTeamId: number): MatchHistory[] => {
      let filtered = (events || []).filter(e => e.status?.type === 'finished');
      
      if (competitionId) {
        filtered = filtered.filter(e => 
          e.tournament?.uniqueTournament?.id === competitionId || 
          e.tournament?.id === competitionId
        );
      }

      return filtered
        .sort((a, b) => b.startTimestamp - a.startTimestamp)
        .slice(0, limit)
        .map(e => {
          const isHome = e.homeTeam.id === focusTeamId;
          const focusTeamScore = isHome ? e.homeScore?.current : e.awayScore?.current;
          const oppTeamScore = isHome ? e.awayScore?.current : e.homeScore?.current;
          const focusTeamHT = isHome ? e.homeScore?.period1 : e.awayScore?.period1;
          const oppTeamHT = isHome ? e.awayScore?.period1 : e.homeScore?.period1;
          const focusTeamPen = isHome ? e.homeScore?.penalties : e.awayScore?.penalties;
          const oppTeamPen = isHome ? e.awayScore?.penalties : e.homeScore?.penalties;
          
          let result: 'V' | 'E' | 'D' = 'E';
          if (focusTeamScore > oppTeamScore) result = 'V';
          else if (focusTeamScore < oppTeamScore) result = 'D';
          else if (focusTeamPen !== undefined && oppTeamPen !== undefined) {
             if (focusTeamPen > oppTeamPen) result = 'V';
             else if (focusTeamPen < oppTeamPen) result = 'D';
          }

          const date = new Date(e.startTimestamp * 1000);
          
          let scoreStr = (focusTeamScore !== undefined && oppTeamScore !== undefined)
            ? (isHome ? `${focusTeamScore} - ${oppTeamScore}` : `${oppTeamScore} - ${focusTeamScore}`)
            : '-';
          if (focusTeamPen !== undefined && oppTeamPen !== undefined && scoreStr !== '-') {
             scoreStr += isHome ? ` (${focusTeamPen}-${oppTeamPen})` : ` (${oppTeamPen}-${focusTeamPen})`;
          }

          return {
            date: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`,
            competition: e.tournament?.uniqueTournament?.name || e.tournament?.name || 'Unknown',
            score: scoreStr,
            opponent: isHome ? e.awayTeam.name : e.homeTeam.name,
            isHome,
            result,
            teamScore: focusTeamScore || 0,
            opponentScore: oppTeamScore || 0,
            teamHTScore: focusTeamHT || 0,
            opponentHTScore: oppTeamHT || 0,
            homeTeamId: e.homeTeam.id,
            awayTeamId: e.awayTeam.id,
            teamPenalties: focusTeamPen,
            opponentPenalties: oppTeamPen
          };
        });
    };

    const calculateAnalysis = (matches: MatchHistory[]): TeamAnalysis => {
      const gScored = matches.reduce((acc, m) => acc + m.teamScore, 0);
      const gConcd = matches.reduce((acc, m) => acc + m.opponentScore, 0);
      const totalG = gScored + gConcd;
      const count = matches.length || 1;

      const calcMarkets = (ms: MatchHistory[], isHT: boolean): MarketStats => {
        let o05 = 0, o15 = 0, o25 = 0, btts = 0;
        ms.forEach(m => {
          const tS = isHT ? m.teamHTScore : m.teamScore;
          const oS = isHT ? m.opponentHTScore : m.opponentScore;
          const sum = tS + oS;
          if (sum > 0.5) o05++;
          if (sum > 1.5) o15++;
          if (sum > 2.5) o25++;
          if (tS > 0 && oS > 0) btts++;
        });

        const pct = (val: number) => Math.round((val / count) * 100);
        return {
          over05: pct(o05),
          over15: pct(o15),
          over25: pct(o25),
          under05: pct(count - o05),
          under15: pct(count - o15),
          under25: pct(count - o25),
          btts: pct(btts),
        };
      };

      return {
        totalGoals: totalG,
        avgTotalGoals: totalG / count,
        goalsScored: gScored,
        avgGoalsScored: gScored / count,
        goalsConceded: gConcd,
        avgGoalsConceded: gConcd / count,
        ftMarkets: calcMarkets(matches, false),
        htMarkets: calcMarkets(matches, true),
      };
    };

    let h2h = parseMatches(h2hData.events, homeTeamId);
    
    // Fallback: If no direct H2H found, search in home/away recent history for the opponent
    if (h2h.length === 0) {
      const homeRecent = (homeFormData.events || []).filter((e: any) => e.homeTeam.id === awayTeamId || e.awayTeam.id === awayTeamId);
      const awayRecent = (awayFormData.events || []).filter((e: any) => e.homeTeam.id === homeTeamId || e.awayTeam.id === homeTeamId);
      const combined = [...homeRecent, ...awayRecent];
      // Deduplicate by ID
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      h2h = parseMatches(unique, homeTeamId);
    }

    const homeP = parseMatches(homeFormData.events, homeTeamId);
    const awayP = parseMatches(awayFormData.events, awayTeamId);

    // Common scores calculation
    const allRecent = [...h2h, ...homeP, ...awayP];
    const scoreCounts: Record<string, number> = {};
    allRecent.forEach(m => {
        scoreCounts[m.score] = (scoreCounts[m.score] || 0) + 1;
    });
    const commonScores = Object.entries(scoreCounts)
        .map(([score, count]) => ({ score, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

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

    let currentScore = undefined;
    if (event.status.type === 'inprogress' || event.status.type === 'finished') {
       currentScore = {
          home: event.homeScore?.current ?? 0,
          away: event.awayScore?.current ?? 0
       };
    }

    return {
      matchId: String(matchId),
      homeTeam: event.homeTeam.name,
      homeTeamId: event.homeTeam.id,
      awayTeam: event.awayTeam.name,
      awayTeamId: event.awayTeam.id,
      startTimestamp: event.startTimestamp,
      competitionName: event.tournament?.uniqueTournament?.name || event.tournament?.name || 'Competição',
      h2h,
      homePerformanceHome: homeP,
      awayPerformanceAway: awayP,
      homeAnalysis: calculateAnalysis(homeP),
      awayAnalysis: calculateAnalysis(awayP),
      commonScores,
      probabilities,
      statistics,
      odds: oddsData,
      currentScore,
      h2hSummary,
      liveTime,
      homePenalties: event.homeScore?.penalties,
      awayPenalties: event.awayScore?.penalties,
      competitionId: event.tournament?.uniqueTournament?.id,
      statusType: event.status?.type
    };
  } catch (error) {
    console.error('Error fetching match details:', error);
    return null;
  }
}
