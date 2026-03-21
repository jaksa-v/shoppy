Project guidelines:

- use bun for the package manager
- when installing new packages, use `bun add` instead of manually editing the package.json file
- use modern svelte and sveltekit patterns and primitives
- avoid `as any` at all costs, try to infer types from functions as much as possible
- when defining convex actions, queries, and mutations that are exposed to the client use the `authed` setup in `src/convex/authed`
- when defining convex actions, queries, and mutations that are called from the backend use the `private` setup in `src/convex/private`
- use effect v4 for all backend code
- use the convex service for calling convex queries, actions, and mutations from the backend
- use tailwindcss for styling whenever possible, only resort to custom css if needed
- every svelte component should have `lang="ts"`
- after making changes to convex, run `bun run convex:gen` to generate the new api
- run `bun run lint` to check for linting errors, `bun run format`, and `bun run check` to check for errors after making changes

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
