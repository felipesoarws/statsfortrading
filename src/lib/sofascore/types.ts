export interface SofaScoreTeam {
  id: number;
  name: string;
  slug: string;
}

export interface SofaScoreScore {
  current?: number;
  display?: number;
  period1?: number;
  period2?: number;
  normaltime?: number;
  penalties?: number;
}

export interface SofaScoreEvent {
  id: number;
  slug: string;
  homeTeam: SofaScoreTeam;
  awayTeam: SofaScoreTeam;
  homeScore?: SofaScoreScore;
  awayScore?: SofaScoreScore;
  startTimestamp: number;
  status?: {
    code: number;
    description: string;
    type: string;
  };
  tournament?: {
    id: number;
    name: string;
    slug: string;
    category: {
      name: string;
      slug: string;
      id: number;
      flag: string;
      alpha2?: string;
    };
    uniqueTournament?: {
      name: string;
      slug: string;
      id: number;
    };
  };
  time?: {
    currentPeriodStartTimestamp?: number;
  };
}

export interface SofaScoreSearchResult {
  type: string;
  entity: {
    id: number;
    name: string;
    slug: string;
    slug_name?: string;
    customId?: string;
  };
  score?: number;
}
