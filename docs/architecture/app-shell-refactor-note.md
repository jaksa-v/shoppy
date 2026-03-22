# App Shell Refactor Note

## Current responsibilities

Before this refactor, [`src/routes/app/+page.svelte`](/Users/jaksa/Code/shoppy/src/routes/app/+page.svelte) owned:

- auth bootstrap and Clerk mounts
- household bootstrap and pending-invite recovery
- Convex query and mutation orchestration
- shopping-list derivation and empty/loading states
- dialog-local state for edit, clear-bought, members, and categories
- standalone layout branching

[`src/routes/app/invite/[code]/+page.svelte`](/Users/jaksa/Code/shoppy/src/routes/app/invite/[code]/+page.svelte) also repeated invite persistence, auth UI mounting, accept flow, and redirect timing.

On the backend, household membership and invite lifecycle rules were repeated across multiple Convex modules.

## Target boundaries

The route layer should stay limited to composition and layout. Product behavior should live in:

- `src/lib/features/app-shell`
- `src/lib/features/household`
- `src/lib/features/shopping-list`
- `src/lib/features/categories`
- `src/lib/features/invites`
- `src/lib/frontend/auth`
- `src/lib/frontend/convex`

Convex handlers should remain client-stable but delegate repeated membership and household lifecycle rules to shared domain helpers under `src/convex/authed/domain`.

## First-pass constraints

- preserve UX and route behavior
- keep current Convex public function names and argument shapes
- add narrow boundary tests through pure helper seams first
- keep `/app/references` available without letting it drive product structure
