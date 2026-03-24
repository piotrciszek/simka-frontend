import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import { PublicLayoutComponent } from './features/public/public-layout/public-layout.component';

export const routes: Routes = [
  // --- NIEZALGOWANY ---
  { path: '', redirectTo: 'html/standings', pathMatch: 'full' },
  {
    path: 'html',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'standings', pathMatch: 'full' },
      // ── ROSTER ──
      {
        path: 'team-rosters',
        loadComponent: () =>
          import('./features/roster/team-rosters/team-rosters.component').then(
            m => m.TeamRostersComponent,
          ),
      },
      {
        path: 'team-statistics',
        loadComponent: () =>
          import('./features/roster/team-statistics/team-statistics.component').then(
            m => m.TeamStatisticsComponent,
          ),
      },
      {
        path: 'salary-info',
        loadComponent: () =>
          import('./features/roster/salary-info/salary-info.component').then(
            m => m.SalaryInfoComponent,
          ),
      },
      {
        path: 'injury-reserve',
        loadComponent: () =>
          import('./features/roster/injury-reserve/injury-reserve.component').then(
            m => m.InjuryReserveComponent,
          ),
      },
      // ── SEASON ──
      {
        path: 'standings',
        loadComponent: () =>
          import('./features/season/standings/standings.component').then(m => m.StandingsComponent),
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('./features/season/schedule/schedule.component').then(m => m.ScheduleComponent),
      },
      {
        path: 'league-leaders',
        loadComponent: () =>
          import('./features/season/league-leaders/league-leaders.component').then(
            m => m.LeagueLeadersComponent,
          ),
      },
      {
        path: 'wm-awards',
        loadComponent: () =>
          import('./features/season/wm-awards/wm-awards.component').then(m => m.WmAwardsComponent),
      },
      {
        path: 'draft-preview',
        loadComponent: () =>
          import('./features/season/draft-preview/draft-preview.component').then(
            m => m.DraftPreviewComponent,
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/season/transactions/transactions.component').then(
            m => m.TransactionsComponent,
          ),
      },
      {
        path: 'free-agents',
        loadComponent: () =>
          import('./features/season/free-agents/free-agents.component').then(
            m => m.FreeAgentsComponent,
          ),
      },
      // ── PLAYOFFS ──
      {
        path: 'playoffs',
        loadComponent: () =>
          import('./features/season/playoffs/playoffs.component').then(m => m.PlayoffsComponent),
      },
      {
        path: 'playoff-leaders',
        loadComponent: () =>
          import('./features/season/playoff-leaders/playoff-leaders.component').then(
            m => m.PlayoffLeadersComponent,
          ),
      },
      // ── HISTORY ──
      {
        path: 'historical-team-performance',
        loadComponent: () =>
          import('./features/history/hist-team-perf/hist-team-perf.component').then(
            m => m.HistTeamPerfComponent,
          ),
      },
      {
        path: 'team-records',
        loadComponent: () =>
          import('./features/history/team-records/team-records.component').then(
            m => m.TeamRecordsComponent,
          ),
      },
      {
        path: 'allstar-winners',
        loadComponent: () =>
          import('./features/history/allstar-winners/allstar-winners.component').then(
            m => m.AllstarWinnersComponent,
          ),
      },
      {
        path: 'player-game-records',
        loadComponent: () =>
          import('./features/history/player-game-records/player-game-records.component').then(
            m => m.PlayerGameRecordsComponent,
          ),
      },
      {
        path: 'player-season-records',
        loadComponent: () =>
          import('./features/history/player-season-records/player-season-records.component').then(
            m => m.PlayerSeasonRecordsComponent,
          ),
      },
      {
        path: 'player-career-records',
        loadComponent: () =>
          import('./features/history/player-career-records/player-career-records.component').then(
            m => m.PlayerCareerRecordsComponent,
          ),
      },
      {
        path: 'past-champions',
        loadComponent: () =>
          import('./features/history/past-champions/past-champions.component').then(
            m => m.PastChampionsComponent,
          ),
      },
      {
        path: 'hall-of-fame',
        loadComponent: () =>
          import('./features/history/hall-of-fame/hall-of-fame.component').then(
            m => m.HallOfFameComponent,
          ),
      },
      {
        path: 'past-picks',
        loadComponent: () =>
          import('./features/history/past-picks/past-picks.component').then(
            m => m.PastPicksComponent,
          ),
      },
    ],
  },
  // --- ZALGOWANY ---
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('./features/auth/change-password/change-password.component').then(
        m => m.ChangePasswordComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'tactics',
        loadComponent: () =>
          import('./features/tactics/tactics.component').then(m => m.TacticsComponent),
      },
      {
        path: 'rosters',
        loadComponent: () =>
          import('./features/rosters/rosters.component').then(m => m.RostersComponent),
      },
      {
        path: 'gm-list',
        loadComponent: () =>
          import('./features/gm-list/gm-list.component').then(m => m.GmListComponent),
      },
      {
        path: 'csv-files',
        loadComponent: () =>
          import('./features/csv-files/csv-files.component').then(m => m.CsvFilesComponent),
      },
      {
        path: 'csv-compare',
        loadComponent: () =>
          import('./features/compare-csv/compare-csv.component').then(m => m.CompareCsvComponent),
      },
      {
        path: 'pbp-files',
        loadComponent: () =>
          import('./features/pbp-files/pbp-files.component').then(m => m.PbpFilesComponent),
      },
      {
        path: 'save-files',
        loadComponent: () =>
          import('./features/save-files/save-files.component').then(m => m.SaveFilesComponent),
      },
      // ── ROSTER ──
      {
        path: 'team-rosters',
        loadComponent: () =>
          import('./features/roster/team-rosters/team-rosters.component').then(
            m => m.TeamRostersComponent,
          ),
      },
      {
        path: 'team-statistics',
        loadComponent: () =>
          import('./features/roster/team-statistics/team-statistics.component').then(
            m => m.TeamStatisticsComponent,
          ),
      },
      {
        path: 'salary-info',
        loadComponent: () =>
          import('./features/roster/salary-info/salary-info.component').then(
            m => m.SalaryInfoComponent,
          ),
      },
      {
        path: 'injury-reserve',
        loadComponent: () =>
          import('./features/roster/injury-reserve/injury-reserve.component').then(
            m => m.InjuryReserveComponent,
          ),
      },
      // ── SEASON ──
      {
        path: 'standings',
        loadComponent: () =>
          import('./features/season/standings/standings.component').then(m => m.StandingsComponent),
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('./features/season/schedule/schedule.component').then(m => m.ScheduleComponent),
      },
      {
        path: 'league-leaders',
        loadComponent: () =>
          import('./features/season/league-leaders/league-leaders.component').then(
            m => m.LeagueLeadersComponent,
          ),
      },
      {
        path: 'wm-awards',
        loadComponent: () =>
          import('./features/season/wm-awards/wm-awards.component').then(m => m.WmAwardsComponent),
      },
      {
        path: 'draft-preview',
        loadComponent: () =>
          import('./features/season/draft-preview/draft-preview.component').then(
            m => m.DraftPreviewComponent,
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/season/transactions/transactions.component').then(
            m => m.TransactionsComponent,
          ),
      },
      {
        path: 'free-agents',
        loadComponent: () =>
          import('./features/season/free-agents/free-agents.component').then(
            m => m.FreeAgentsComponent,
          ),
      },
      // ── PLAYOFFS ──
      {
        path: 'playoffs',
        loadComponent: () =>
          import('./features/season/playoffs/playoffs.component').then(m => m.PlayoffsComponent),
      },
      {
        path: 'playoff-leaders',
        loadComponent: () =>
          import('./features/season/playoff-leaders/playoff-leaders.component').then(
            m => m.PlayoffLeadersComponent,
          ),
      },
      // ── HISTORY ──
      {
        path: 'historical-team-performance',
        loadComponent: () =>
          import('./features/history/hist-team-perf/hist-team-perf.component').then(
            m => m.HistTeamPerfComponent,
          ),
      },
      {
        path: 'team-records',
        loadComponent: () =>
          import('./features/history/team-records/team-records.component').then(
            m => m.TeamRecordsComponent,
          ),
      },
      {
        path: 'allstar-winners',
        loadComponent: () =>
          import('./features/history/allstar-winners/allstar-winners.component').then(
            m => m.AllstarWinnersComponent,
          ),
      },
      {
        path: 'player-game-records',
        loadComponent: () =>
          import('./features/history/player-game-records/player-game-records.component').then(
            m => m.PlayerGameRecordsComponent,
          ),
      },
      {
        path: 'player-season-records',
        loadComponent: () =>
          import('./features/history/player-season-records/player-season-records.component').then(
            m => m.PlayerSeasonRecordsComponent,
          ),
      },
      {
        path: 'player-career-records',
        loadComponent: () =>
          import('./features/history/player-career-records/player-career-records.component').then(
            m => m.PlayerCareerRecordsComponent,
          ),
      },
      {
        path: 'past-champions',
        loadComponent: () =>
          import('./features/history/past-champions/past-champions.component').then(
            m => m.PastChampionsComponent,
          ),
      },
      {
        path: 'hall-of-fame',
        loadComponent: () =>
          import('./features/history/hall-of-fame/hall-of-fame.component').then(
            m => m.HallOfFameComponent,
          ),
      },
      {
        path: 'past-picks',
        loadComponent: () =>
          import('./features/history/past-picks/past-picks.component').then(
            m => m.PastPicksComponent,
          ),
      },
      // ── ADMIN ──
      {
        path: 'tactics-log',
        loadComponent: () =>
          import('./features/admin/tactics-log/tactics-log.component').then(
            m => m.TacticsLogComponent,
          ),
        canActivate: [roleGuard(['admin', 'komisz'])],
      },
      {
        path: 'dsg',
        loadComponent: () =>
          import('./features/admin/day-score-generator/day-score-generator.component').then(
            m => m.DayScoreGeneratorComponent,
          ),
        canActivate: [roleGuard(['admin', 'komisz'])],
      },
      {
        path: 'activity-log',
        loadComponent: () =>
          import('./features/admin/activity-log/activity-log.component').then(
            m => m.ActivityLogComponent,
          ),
        canActivate: [roleGuard(['admin', 'komisz'])],
      },
      {
        path: 'admin-panel',
        loadComponent: () =>
          import('./features/admin/admin-panel/admin-panel.component').then(
            m => m.AdminPanelComponent,
          ),
        canActivate: [roleGuard(['admin', 'komisz'])],
      },
      {
        path: 'rebuild-player-db',
        loadComponent: () =>
          import('./features/admin/rebuild-player-db/rebuild-player-db.component').then(
            m => m.RebuildPlayerDbComponent,
          ),
        canActivate: [roleGuard(['admin', 'komisz'])],
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
