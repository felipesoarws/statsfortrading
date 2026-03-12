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

interface SofaScoreSearchResult {
  type: string;
  entity: {
    id: number;
    name: string;
  };
}

export interface TeamLogoResult {
  name: string;
  logo: string;
}

export interface MatchLogoResult {
  homeTeam: TeamLogoResult;
  awayTeam: TeamLogoResult;
}

/**
 * Cleans a team name for better search matching (removes FC, SC, U23, etc.)
 */
function cleanTeamName(name: string): string {
  return name
    .replace(/\s+(FC|SC|SK|FK|AFC|CF|UD|U23|U20|U19|U17)\b/gi, '')
    .replace(/\b(FC|SC|SK|FK|AFC|CF|UD|U23|U20|U19|U17)\s+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Search SofaScore for a team by name and return its logo URL.
 */
export async function getSofascoreTeamLogo(teamName: string, retryClean = true): Promise<TeamLogoResult | null> {
  try {
    const query = encodeURIComponent(teamName);
    const url = `https://api.sofascore.com/api/v1/search/all?q=${query}`;

    const res = await fetch(url, { 
      headers: SOFASCORE_HEADERS,
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 86400 }
    });
    
    if (!res.ok) {
      if (res.status !== 404) console.warn(`[SofaScore] Search failed for "${teamName}": ${res.status}`);
      return null;
    }

    const data = await res.json();
    const results: SofaScoreSearchResult[] = data.results || [];
    const teamResult = results.find((r) => r.type === 'team' && r.entity?.id);

    if (!teamResult) {
      if (retryClean) {
        const cleaned = cleanTeamName(teamName);
        if (cleaned !== teamName) {
          return getSofascoreTeamLogo(cleaned, false);
        }
      }
      return null;
    }

    return { name: teamName, logo: `https://api.sofascore.app/api/v1/team/${teamResult.entity.id}/image` };
  } catch {
    return null;
  }
}

/**
 * Fallback: Search TheSportsDB for a team logo.
 */
export async function getSportsDBLogo(teamName: string): Promise<TeamLogoResult | null> {
  try {
    const query = encodeURIComponent(teamName);
    const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${query}`;
    
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    
    const data = await res.json();
    const team = data.teams?.[0];
    
    if (team?.strBadge) {
      return { name: teamName, logo: team.strBadge };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Resolve team logo trying multiple sources in order.
 */
export async function resolveTeamLogo(teamName: string): Promise<string> {
   // 1. Try SofaScore (original name)
   let result = await getSofascoreTeamLogo(teamName);
   if (result?.logo) return result.logo;

   // 2. Try TheSportsDB
   result = await getSportsDBLogo(teamName);
   if (result?.logo) return result.logo;

   // 3. Try TheSportsDB with cleaned name
   const cleaned = cleanTeamName(teamName);
   if (cleaned !== teamName) {
      result = await getSportsDBLogo(cleaned);
      if (result?.logo) return result.logo;
   }

   return "";
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
