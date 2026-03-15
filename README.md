# SimBasket — Frontend

Angular 21 frontend for SimBasket, a closed basketball league management application.

## Tech Stack

- **Framework:** Angular 21
- **UI Library:** Angular Material (cyan/orange theme)
- **Language:** TypeScript
- **Auth:** JWT (HTTP interceptor)
- **Other:** RxJS, Angular CDK, dotenv

## Project Structure

```
src/
├── app/
│   ├── core/               # Services, guards, interceptors, constants
│   │   ├── constants/      # Shared constants (e.g. team order)
│   │   ├── guards/         # Route guards (auth, role)
│   │   ├── interceptors/   # JWT interceptor
│   │   └── services/       # API services, auth, theme
│   ├── features/           # Feature components (pages)
│   │   ├── admin/          # Admin panel, activity log, tactics log
│   │   ├── roster/         # Team rosters, statistics, salary, GM list
│   │   ├── season/         # Standings, schedule, league leaders etc.
│   │   ├── history/        # Historical stats, records, hall of fame
│   │   └── tactics/        # Team tactics form
│   └── shared/             # Shared components (navbar, layout, iframe-viewer)
├── environments/           # environment.ts / environment.prod.ts
└── styles.scss             # Global styles and CSS variables
```

## Getting Started

### Prerequisites

- Node.js 18+
- Angular CLI 21+

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/simbasket-frontend.git
cd simbasket-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment — edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

4. Run in development mode:

```bash
ng serve
```

App will be available at `http://localhost:4200`.

5. Build for production:

```bash
ng build
```

Output will be in `dist/simbasket-frontend/browser/` — copy contents to backend `/public` folder.

## Angular Conventions

This project follows strict Angular 21 conventions:

- Signal-based APIs: `signal()`, `input()`, `output()`, `viewChild()`
- `inject()` instead of constructor DI
- `@if` / `@for` instead of `*ngIf` / `*ngFor`
- Standalone components only
- No `@Input` / `@Output` decorators, no `ngOnChanges`

## Theme

Angular Material with custom cyan/orange theme. Supports three modes switchable from the navbar:

| Theme   | Description         |
| ------- | ------------------- |
| `dark`  | Dark mode (default) |
| `light` | Light mode          |
| `retro` | Retro orange theme  |

CSS variables are used throughout for consistent theming.
