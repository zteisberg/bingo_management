import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const GUILD_ID='1229804943368523806', ROLE_ID='1523484700088467500'
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'}
Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response('ok',{headers:cors});try{
  const auth=req.headers.get('Authorization'); if(!auth)throw new Error('Missing Supabase authorization')
  const supabase=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}})
  const {data:{user},error}=await supabase.auth.getUser(auth.replace('Bearer ','')); if(error||!user)throw new Error('Invalid Supabase session')
  const {access_token}=await req.json(); if(!access_token)throw new Error('Missing Discord access token; sign in again')
  const response=await fetch(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`,{headers:{Authorization:`Bearer ${access_token}`}})
  const member=response.ok?await response.json():null; const verified=Boolean(member?.roles?.includes(ROLE_ID))
  const avatar=member?.avatar?`https://cdn.discordapp.com/guilds/${GUILD_ID}/users/${user.user_metadata.provider_id}/avatars/${member.avatar}.png`:user.user_metadata.avatar_url
  const {error:updateError}=await supabase.from('profiles').upsert({id:user.id,discord_username:member?.nick||user.user_metadata.full_name||user.user_metadata.name||'Discord user',avatar_url:avatar,is_verified:verified},{onConflict:'id'})
  if(updateError)throw updateError
  return new Response(JSON.stringify({verified}),{status:verified?200:403,headers:{...cors,'Content-Type':'application/json'}})
}catch(error){return new Response(JSON.stringify({error:error instanceof Error?error.message:'Verification failed'}),{status:401,headers:{...cors,'Content-Type':'application/json'}})}})
