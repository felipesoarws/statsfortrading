/**
 * Utility to resolve SofaScore team logos from team names.
 * Given a home and away team name (from Bolsa de Aposta scraping),
 * searches SofaScore's API to find the teamId and generates the logo URL.
 */

const SOFASCORE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://www.sofascore.com/',
  'Origin': 'https://www.sofascore.com',
};

export interface TeamLogoResult {
  name: string;
  logo: string;
}

export interface MatchLogoResult {
  homeTeam: TeamLogoResult;
  awayTeam: TeamLogoResult;
}

/**
 * Search SofaScore for a team by name and return its logo URL.
 * Returns null if the team is not found.
 */
export async function getSofascoreTeamLogo(teamName: string): Promise<TeamLogoResult | null> {
  try {
    const query = encodeURIComponent(teamName);
    const url = `https://api.sofascore.com/api/v1/search/all?q=${query}`;

    const res = await fetch(url, { headers: SOFASCORE_HEADERS });
    if (!res.ok) {
      console.warn(`[SofaScore] Search failed for "${teamName}": ${res.status}`);
      return null;
    }

    const data = await res.json();

    // The response contains a `results` array with items that have a `type` field
    const results: any[] = data.results || [];
    const teamResult = results.find(
      (r: any) => r.type === 'team' && r.entity?.id
    );

    if (!teamResult) {
      console.warn(`[SofaScore] No team result found for "${teamName}"`);
      return null;
    }

    const teamId: number = teamResult.entity.id;
    const logo = `https://api.sofascore.app/api/v1/team/${teamId}/image`;

    return { name: teamName, logo };
  } catch (err) {
    console.error(`[SofaScore] Error searching for team "${teamName}":`, err);
    return null;
  }
}

/**
 * Main function: given a match from Bolsa de Aposta, resolve both teams' logos via SofaScore.
 */
export async function getMatchTeamLogos(match: {
  homeTeamName: string;
  awayTeamName: string;
  leagueName?: string;
}): Promise<MatchLogoResult> {
  const [home, away] = await Promise.all([
    getSofascoreTeamLogo(match.homeTeamName),
    getSofascoreTeamLogo(match.awayTeamName),
  ]);

  return {
    homeTeam: home ?? { name: match.homeTeamName, logo: '' },
    awayTeam: away ?? { name: match.awayTeamName, logo: '' },
  };
}
