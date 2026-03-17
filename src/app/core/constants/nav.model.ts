export interface NavLink {
  label: string;
  route: string;
}

export interface NavMenu {
  label: string;
  key: string;
  links: NavLink[];
}

export const NAV_MENUS: NavMenu[] = [
  {
    label: 'Roster',
    key: 'roster',
    links: [
      { label: 'Team Rosters', route: 'team-rosters' },
      { label: 'Team Statistics', route: 'team-statistics' },
      { label: 'Salary Info', route: 'salary-info' },
      { label: 'Injury Reserve', route: 'injury-reserve' },
    ],
  },
  {
    label: 'Season',
    key: 'season',
    links: [
      { label: 'Standings', route: 'standings' },
      { label: 'Schedule', route: 'schedule' },
      { label: 'League Leaders', route: 'league-leaders' },
      { label: 'Weekly / Monthly Awards', route: 'wm-awards' },
      { label: 'Draft Preview', route: 'draft-preview' },
      { label: 'Transactions', route: 'transactions' },
      { label: 'Free Agents', route: 'free-agents' },
    ],
  },
  {
    label: 'History',
    key: 'history',
    links: [
      { label: 'Historical Team Performance', route: 'historical-team-performance' },
      { label: 'Team Records', route: 'team-records' },
      { label: 'All-Star Weekend Winners', route: 'allstar-winners' },
      { label: 'Player Game Records', route: 'player-game-records' },
      { label: 'Player Season Records', route: 'player-season-records' },
      { label: 'Player Career Records', route: 'player-career-records' },
      { label: 'Past Champions', route: 'past-champions' },
      { label: 'Hall of Fame', route: 'hall-of-fame' },
      { label: 'Past #1 Overall Picks', route: 'past-picks' },
    ],
  },
];
