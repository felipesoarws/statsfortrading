export interface BolsaEventInfo {
  eventId: string;
  league: string;
  startDate: string;
  homeTeam: {
    name: string;
    logo: string;
  };
  awayTeam: {
    name: string;
    logo: string;
  };
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

export async function getBolsaEventInfo(eventId: string): Promise<BolsaEventInfo | null> {
  const url = `https://data-center-bolsa-statistics-api.layback.trade/api/event/${eventId}/info`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;

    const data = await res.json();

    const formatLogo = (base64: string | null) => {
      if (!base64) return null;
      // Ensure the base64 string doesn't already have the prefix
      const cleanBase64 = base64.replace(/^data:image\/png;base64,/, '');
      return `data:image/png;base64,${cleanBase64}`;
    };

    return {
      eventId: data.eventId?.toString() || eventId,
      league: data.leagueName,
      startDate: data.startDate,
      homeTeam: {
        name: data.homeTeamName,
        logo: formatLogo(data.homeTeamImage) || "",
      },
      awayTeam: {
        name: data.awayTeamName,
        logo: formatLogo(data.awayTeamImage) || "",
      },
      odds: {
        home: data.homeInitialOdd || 0,
        draw: data.drawInitialOdd || 0,
        away: data.awayInitialOdd || 0,
      },
    };
  } catch (error) {
    console.error(`Error fetching event info for ${eventId}:`, error);
    return null;
  }
}
