export type TileStatus = 'open' | 'in_progress' | 'complete'
export interface Profile { id:string; discord_username:string; avatar_url:string|null; is_verified:boolean; is_admin:boolean }
export interface Section { id:string; name:string; unlocked:boolean; row:number; col:number; tile_cols:number }
export interface Contributor { tile_id:string; profile_id:string; note:string; profiles: Pick<Profile,'discord_username'|'avatar_url'> | null }
export interface Tile { id:string; section_id:string; name:string; description:string; row:number; col:number; status:TileStatus; time_estimate:string; strategy:string; tile_gateways:{section_id:string}[]; tile_contributors:Contributor[] }
export interface ChatMessage { id:string; profile_id:string; body:string; created_at:string; profiles:Pick<Profile,'discord_username'|'avatar_url'>|null }
