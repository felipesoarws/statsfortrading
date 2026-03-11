import { getMatchesOfDay, MatchInfo } from './getMatchesOfDay';
import { getTeamForm, checkSingularidadeCondition } from './getTeamForm';

export async function getSingularidades(dateYYYYMMDD: string, timezoneOffsetMinutes: number = 0): Promise<MatchInfo[]> {
  // 1. Fetch all matches for the day (using our robust timezone-aware method)
  const allMatches = await getMatchesOfDay(dateYYYYMMDD, timezoneOffsetMinutes);
  
  if (!allMatches || allMatches.length === 0) return [];
  
  // We don't want to paralyze the SofaScore API by requesting 1000 forms instantly.
  // We'll process them in batches.
  const singularidades: MatchInfo[] = [];
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < allMatches.length; i += BATCH_SIZE) {
    const batch = allMatches.slice(i, i + BATCH_SIZE);
    
    // Process this batch concurrently
    const batchResults = await Promise.all(batch.map(async (match) => {
        // SofaScore ID is embedded in logos as fallback, or you might need to extract it
        // A robust way to get Home and Away IDs without match details exists if we parse logos
        // However, our MatchInfo already doesn't expose native teamIds directly. 
        // We will extract them from the logos since they are formed like: https://api.sofascore.app/api/v1/team/2828/image
        const homeIdMatch = match.homeLogo?.match(/\/team\/(\d+)\/image/);
        const awayIdMatch = match.awayLogo?.match(/\/team\/(\d+)\/image/);
        
        if (!homeIdMatch || !awayIdMatch) return null;
        
        const homeId = homeIdMatch[1];
        const awayId = awayIdMatch[1];
        
        // Fetch forms
        const [homeForm, awayForm] = await Promise.all([
           getTeamForm(homeId),
           getTeamForm(awayId)
        ]);
        
        if (homeForm.length === 0 || awayForm.length === 0) return null;

        // Condition 1: Home NEVER lost exactly 0x1 (scored 0, conceded 1)
        const homePassed = checkSingularidadeCondition(homeForm, homeId, 'HOME');
        if (!homePassed) return null; // Fast fail
        
        // Condition 2: Away NEVER won exactly 1x0 (scored 1, conceded 0)
        const awayPassed = checkSingularidadeCondition(awayForm, awayId, 'AWAY');
        if (!awayPassed) return null;
        
        return match;
    }));
    
    // Add successful matches
    for (const res of batchResults) {
        if (res) singularidades.push(res);
    }
    
    // Small delay between batches to be polite to the API
    if (i + BATCH_SIZE < allMatches.length) {
       await new Promise(r => setTimeout(r, 200)); 
    }
  }

  return singularidades;
}
