# Banana Hammocks Bingo

A private, realtime OSRS bingo dashboard and persistent team chat built with React, TypeScript, Tailwind, Supabase, and Vercel. Discord is the only login method; a server-side Edge Function checks the required guild role before RLS allows any team data to be read.

## 1. Create and configure Supabase

1. Create a Supabase project.
2. In the SQL Editor, run the files in `supabase/migrations` in filename order, then customize and run `supabase/seed.sql`.
3. In Authentication → Providers → Discord, enable Discord and enter your Discord OAuth client ID and secret.
4. In Authentication → URL Configuration, set the Site URL to the production Vercel URL. Add `http://localhost:5173` and your Vercel URL to Redirect URLs.
5. Deploy the function:

   ```bash
   supabase functions deploy verify-discord-role
   ```

   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are supplied to hosted Edge Functions by Supabase. Never add the service role key to Vite or Vercel client variables.

6. After your first login, make your organizer account an admin in the SQL Editor:

   ```sql
   update public.profiles set is_admin = true
   where discord_username = 'YOUR_DISCORD_DISPLAY_NAME';
   ```

The migrations enable RLS on every table. Verified users can read board and chat data, post messages, and manage their own contributions and chat messages. Admins can moderate chat and update tiles and sections. Profile verification itself is written only by the Edge Function with the service role.

## 2. Configure Discord

1. In the [Discord Developer Portal](https://discord.com/developers/applications), create or select an application.
2. Under OAuth2, add this Supabase callback URL exactly:

   ```text
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

3. Supabase requests `identify guilds.members.read` during sign-in. The latter scope lets the user-authorized token read that user's member record in guild `1229804943368523806`.
4. Ensure approved users hold role `1523484700088467557` in that guild.

The Discord access token is sent over HTTPS to the verification function after login and is never stored in Postgres. The function validates the caller's Supabase JWT, calls Discord, and uses the server-only service role key to update the matching profile.

## 3. Run locally

Copy `.env.example` to `.env.local` and fill in the public project values from Supabase Project Settings → API:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Then run:

```bash
npm install
npm run dev
```

The anon key is safe for the browser; RLS provides authorization. Never use `SUPABASE_SERVICE_ROLE_KEY` in a `VITE_` variable.

## 4. Customize the board

Edit `supabase/seed.sql`. Section `row` and `col` place sections on the overall board. Tile `row` and `col` place tiles within each section. Only the center section should initially have `unlocked = true`.

Gateway relationships live in `tile_gateways`. Add one row for every tile → destination relationship. A tile may have several rows, so a center corner objective can count toward both the north and west routes, for example. A destination unlocks only after every tile mapped to it is complete. Admins can also override a section's lock state in the interface.

The supplied seed matches the final revealed board: only the white center starts unlocked, every objective starts `open`, and the center logo is not stored as an objective.

## 5. Deploy to Vercel

1. Import the repository in Vercel. Framework Preset should detect **Vite**.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Project Settings → Environment Variables.
3. Deploy. The included `vercel.json` sends client-side routes to `index.html`.
4. Add the final Vercel domain to Supabase's Redirect URLs and update the Supabase Site URL.

## Realtime note

The migrations add `sections`, `tiles`, `tile_contributors`, and `chat_messages` to the `supabase_realtime` publication. If they were already added manually, remove the matching final `alter publication` line before rerunning a migration. Realtime change delivery still respects RLS.
