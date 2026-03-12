import { MatchHistory } from '../flashscore/getMatchDetails';
import { SofaScoreEvent, SofaScoreSearchResult } from './types';

export async function getSofaScoreH2H(homeName: string, awayName: string): Promise<MatchHistory[]> {
  try {
    // 1. Search for the event to get the custom ID
    const searchUrl = `https://api.sofascore.com/api/v1/search/all?q=${encodeURIComponent(`${homeName} vs ${awayName}`)}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return [];
    
    const searchData: { results?: SofaScoreSearchResult[] } = await searchRes.json();
    // Look for type "event"
    const event = searchData.results?.find((r) => r.type === 'event')?.entity;
    
    if (!event || !event.customId) {
        return [];
    }

    return fetchH2HEvents(event.customId, homeName);
  } catch (error) {
    console.error('[SofaScore] H2H failed:', error);
    return [];
  }
}

async function fetchH2HEvents(customId: string, focusTeamName: string): Promise<MatchHistory[]> {
    const url = `https://www.sofascore.com/api/v1/event/${customId}/h2h/events`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    const events: SofaScoreEvent[] = data.events || [];

    return events.map((m) => {
        const isHome = m.homeTeam.name.toLowerCase().includes(focusTeamName.toLowerCase());
        const hasScore = m.homeScore?.display !== undefined && m.awayScore?.display !== undefined;
        let result: 'V' | 'E' | 'D' = 'E';
        if (hasScore) {
            const hDisplay = m.homeScore?.display || 0;
            const aDisplay = m.awayScore?.display || 0;
            result = hDisplay === aDisplay ? 'E' :
                     (isHome ? (hDisplay > aDisplay ? 'V' : 'D') :
                               (aDisplay > hDisplay ? 'V' : 'D'));
        }

        return {
            date: new Date(m.startTimestamp * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            competition: m.tournament?.name || 'Liga',
            score: hasScore ? `${m.homeScore?.display} - ${m.awayScore?.display}` : '-',
            opponent: isHome ? m.awayTeam.name : m.homeTeam.name,
            isHome,
            result,
            teamScore: isHome ? (m.homeScore?.display || 0) : (m.awayScore?.display || 0),
            opponentScore: isHome ? (m.awayScore?.display || 0) : (m.homeScore?.display || 0),
            teamHTScore: isHome ? (m.homeScore?.period1 || 0) : (m.awayScore?.period1 || 0),
            opponentHTScore: isHome ? (m.awayScore?.period1 || 0) : (m.homeScore?.period1 || 0),
            homeTeamId: m.homeTeam.id,
            awayTeamId: m.awayTeam.id,
            homeTeamName: m.homeTeam.name,
            awayTeamName: m.awayTeam.name,
            homeLogo: `https://api.sofascore.app/api/v1/team/${m.homeTeam.id}/image`,
            awayLogo: `https://api.sofascore.app/api/v1/team/${m.awayTeam.id}/image`,
        };
    });
}
