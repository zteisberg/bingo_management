OSRS Bingo Team Board — Project Plan
1. Overview
A private team dashboard for an unlock-based OSRS bingo. The board starts at the center section; completing specific "gateway" tiles unlocks adjacent sections, progressing outward toward the corners. Team members log in via Discord and must hold a specific role in a specific server to access anything.

2. Goals
Access control: Discord OAuth login; verify membership + role in your team's Discord server before granting access.
Board visualization: Render the full board with sections visually locked/unlocked; show tile status (open / in progress / complete) at a glance.
Contributor signup: Any member can flag themselves as able to contribute to a tile, with an optional note (e.g., "have infernal already," "need 85 slayer").
Prioritization view: For each tile, see contributor count and names at a glance to decide what to push.
Admin annotations: You (admin role) can enter time estimates and strategy notes per tile.
Live updates: Changes appear in real time for all viewers (Supabase Realtime).
3. Tech Stack
Layer	Choice
Frontend	React (Vite) + Tailwind, hosted on Vercel
Backend/DB	Supabase (Postgres, Auth, Realtime, Edge Functions)
Auth	Supabase Discord provider with identify guilds.members.read scopes
Role check	Supabase Edge Function calling Discord API server-side, sets is_verified flag
4. Data Model (conceptual)
profiles — one per user; discord_username, is_verified, is_admin
sections — board regions (center, N, S, E, W, corners); unlocked flag
tiles — belong to a section; name, grid position, status, time_estimate, strategy, optional unlocks_section reference for gateway tiles
tile_contributors — join table: user ↔ tile, with a free-text note
All tables protected by RLS: only is_verified users can read; contributors can only edit their own signup rows; only is_admin can edit strategies/estimates/status.

5. Key Behaviors
Unlock logic: DB trigger — when a gateway tile is marked complete, its linked section flips to unlocked. (Adjust if your format requires multiple tiles to line up; make the rule configurable per section.)
Verification flow: On login, an edge function checks the Discord role and stamps the profile. Re-check periodically or on each session refresh in case someone leaves the team.
Locked sections: Rendered dimmed/greyed; tiles visible but not interactive (or hidden entirely — decide preference).
6. Milestones
Supabase project setup, Discord OAuth, role-verification edge function, RLS
Schema + seed script for your actual board layout
Board UI: grid rendering, section lock states, tile detail modal
Contributor signup + at-a-glance contributor badges on tiles
Admin editing (status, estimates, strategy)
Realtime sync, polish, deploy to Vercel