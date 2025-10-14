# Code Organization

This document describes the directory structure and import conventions for the EquiAlert project.

## Directory Structure

```
/workspaces/EquiAlert/
├── client/                 # Frontend React application
│   └── src/
│       ├── components/     # React components
│       │   ├── examples/   # Component usage examples
│       │   └── ui/        # shadcn/ui components
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Utility libraries
│       └── pages/         # Page components
├── server/                # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── serpapi.ts        # SerpAPI integration
│   ├── priceCache.ts     # Price caching system
│   ├── rateLimiter.ts    # Rate limiting system
│   ├── priceUpdater.ts   # Background price updater
│   ├── scheduler.ts      # Notification scheduler
│   ├── storage.ts        # Data storage layer
│   ├── twilio.ts         # Twilio WhatsApp integration
│   └── vite.ts           # Vite middleware
└── shared/               # Shared code between client/server
    └── schema.ts         # Database schemas & types

```

## Import Path Conventions

### Client Code (`client/src/`)

**Use the `@/` path alias for all imports within the client:**

```typescript
// ✅ Correct - using @ alias
import TopBar from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// ❌ Incorrect - using relative paths
import TopBar from '../components/TopBar';
import { Button } from './ui/button';
```

**Benefits:**
- Consistent import paths across the entire codebase
- No need to calculate relative paths (`../../..`)
- Easier refactoring - imports don't break when moving files
- Cleaner, more readable code

### Server Code (`server/`)

**Use relative imports with `./` for local server modules:**

```typescript
// ✅ Correct - using relative paths
import { storage } from './storage';
import { getStockPrice } from './serpapi';
import { checkRateLimit } from './rateLimiter';

// ❌ Incorrect - these are local modules, not external packages
import { storage } from 'storage';
```

**Use `@shared/` alias for shared code:**

```typescript
// ✅ Correct - using @shared alias
import { type User, type Watchlist } from '@shared/schema';

// ❌ Incorrect - using relative path to shared
import { type User } from '../shared/schema';
```

### Shared Code (`shared/`)

Shared code is imported using the `@shared/` path alias:

```typescript
// From server
import { type User } from '@shared/schema';

// From client  
import { type User } from '@shared/schema';
```

## TypeScript Path Configuration

Path aliases are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

## File Organization Guidelines

### Component Files
- Main components: `client/src/components/`
- UI primitives: `client/src/components/ui/`
- Component examples: `client/src/components/examples/`

### Server Modules
- Keep related functionality in focused modules
- Each module should have a single responsibility
- Use clear, descriptive names (e.g., `rateLimiter.ts`, `priceCache.ts`)

### Shared Code
- Only put code in `shared/` if it's used by both client and server
- Currently contains database schemas and TypeScript types

## Migration Completed

All files have been updated to follow these conventions:
- ✅ 12 example component files updated to use `@/` imports
- ✅ Server files use relative `./` imports for local modules
- ✅ Server files use `@shared/` for shared code
- ✅ Client files consistently use `@/` for all internal imports

## Benefits of This Organization

1. **Consistency**: Clear rules for when to use which import style
2. **Maintainability**: Easier to refactor and move files
3. **Readability**: Imports clearly show where code comes from
4. **Type Safety**: TypeScript understands all path aliases
5. **Scalability**: Easy to add new modules following the same patterns
