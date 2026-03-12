export interface BolsaRunner {
  name: string;
  prices?: { side: string, odds: number }[];
  'last-matched-odds'?: number;
  volume?: string | number;
}

export interface BolsaMarket {
  name: string;
  runners?: BolsaRunner[];
}

export interface BolsaMatchHistoryItem {
  home: string;
  away: string;
  goalsHome: string | number;
  goalsAway: string | number;
  goalsHomeHt?: string | number;
  goalsAwayHt?: string | number;
  startDate: string;
  league?: string;
  eventId: number | string;
}

export interface BolsaEventInfo {
  homeTeamName: string;
  awayTeamName: string;
  startDate: string;
  leagueName?: string;
  eventStatus: string;
  homeTeamImage?: string;
  awayTeamImage?: string;
  homeInitialOdd?: number;
  drawInitialOdd?: number;
  awayInitialOdd?: number;
}

export interface ScheduledEvent {
  id: number | string;
  name: string;
  start: string;
  competitionName?: string;
  leagueName?: string;
  'in-running-flag'?: boolean;
  'meta-tags'?: { type: string; name: string }[];
  markets?: BolsaMarket[];
}

export interface InPlayEvent {
  eventId: number | string;
  leagueName?: string;
  startDate?: string;
  timeElapsed?: string;
  home?: { name: string; score: string };
  away?: { name: string; score: string };
  score?: {
    home?: { name: string; score: string };
    away?: { name: string; score: string };
  };
}
