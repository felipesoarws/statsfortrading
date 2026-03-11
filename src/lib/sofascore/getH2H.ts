import { MatchHistory } from '../flashscore/getMatchDetails';

export async function getSofaScoreH2H(homeName: string, awayName: string): Promise<MatchHistory[]> {
  try {
    // 1. Search for the event to get the custom ID
    const searchUrl = `https://api.sofascore.com/api/v1/search/all?q=${encodeURIComponent(`${homeName} vs ${awayName}`)}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return [];
    
    const searchData = await searchRes.json();
    // Look for type "event"
    const event = searchData.results?.find((r: any) => r.type === 'event')?.entity;
    
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
    const events = data.events || [];

    return events.map((m: any) => {
        const isHome = m.homeTeam.name.toLowerCase().includes(focusTeamName.toLowerCase());
        const hasScore = m.homeScore?.display !== undefined && m.awayScore?.display !== undefined;
        let result: 'V' | 'E' | 'D' = 'E';
        if (hasScore) {
            result = m.homeScore.display === m.awayScore.display ? 'E' :
                     (isHome ? (m.homeScore.display > m.awayScore.display ? 'V' : 'D') :
                              (m.awayScore.display > m.homeScore.display ? 'V' : 'D'));
        }

        return {
            date: new Date(m.startTimestamp * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            competition: m.tournament.name || 'Liga',
            score: hasScore ? `${m.homeScore.display} - ${m.awayScore.display}` : '-',
            opponent: isHome ? m.awayTeam.name : m.homeTeam.name,
            isHome,
            result,
            teamScore: isHome ? m.homeScore?.display : m.awayScore?.display,
            opponentScore: isHome ? m.awayScore?.display : m.homeScore?.display,
            teamHTScore: isHome ? (m.homeScore.period1 || 0) : (m.awayScore.period1 || 0),
            opponentHTScore: isHome ? (m.awayScore.period1 || 0) : (m.homeScore.period1 || 0),
            homeTeamId: m.homeTeam.id,
            awayTeamId: m.awayTeam.id,
            homeLogo: `https://api.sofascore.app/api/v1/team/${m.homeTeam.id}/image`,
            awayLogo: `https://api.sofascore.app/api/v1/team/${m.awayTeam.id}/image`,
        };
    });
}
