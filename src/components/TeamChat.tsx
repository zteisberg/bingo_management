import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, MessageCircle, Send, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { ChatMessage, Profile } from '../types'

const timeFormatter=new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'})

export function TeamChat({me}:{me:Profile}){
  const [open,setOpen]=useState(false),[messages,setMessages]=useState<ChatMessage[]>([]),[draft,setDraft]=useState(''),[sending,setSending]=useState(false),[error,setError]=useState('')
  const endRef=useRef<HTMLDivElement>(null)
  const loadMessages=useCallback(async()=>{
    const {data,error:loadError}=await supabase.from('chat_messages').select('id,profile_id,body,created_at,profiles(discord_username,avatar_url)').order('created_at',{ascending:false}).limit(100)
    if(loadError){setError(loadError.message);return}
    setMessages(((data||[]) as unknown as ChatMessage[]).reverse())
  },[])

  useEffect(()=>{void loadMessages();const channel=supabase.channel('team-chat').on('postgres_changes',{event:'*',schema:'public',table:'chat_messages'},()=>void loadMessages()).subscribe();return()=>{void supabase.removeChannel(channel)}},[loadMessages])
  useEffect(()=>{if(open)endRef.current?.scrollIntoView({behavior:'smooth'})},[open,messages])

  async function send(event:FormEvent){event.preventDefault();const body=draft.trim();if(!body||sending)return;setSending(true);setError('');const {error:sendError}=await supabase.from('chat_messages').insert({profile_id:me.id,body});if(sendError)setError(sendError.message);else{setDraft('');await loadMessages()}setSending(false)}
  async function remove(id:string){const {error:deleteError}=await supabase.from('chat_messages').delete().eq('id',id);if(deleteError)setError(deleteError.message);else await loadMessages()}

  if(!open)return <button onClick={()=>setOpen(true)} className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-gold/40 bg-[#172016] px-5 py-3 text-sm font-bold text-gold shadow-2xl hover:bg-[#202b1e]" aria-label="Open team chat"><MessageCircle size={19}/>Team chat{messages.length>0?<span className="rounded-full bg-gold px-2 py-0.5 text-[10px] text-ink">{messages.length}</span>:null}</button>

  return <aside className="fixed inset-x-3 bottom-3 z-40 flex h-[min(640px,calc(100vh-24px))] flex-col overflow-hidden rounded-2xl border border-gold/30 bg-[#151c14] shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[390px]">
    <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-gold/10 text-gold"><MessageCircle size={18}/></div><div><h2 className="font-display text-lg text-parchment">Team chat</h2><p className="text-[10px] uppercase tracking-[.16em] text-stone-500">Banana Hammocks</p></div><button onClick={()=>setOpen(false)} className="ml-auto rounded-md p-2 text-stone-500 hover:bg-white/5" aria-label="Close team chat"><ChevronDown size={19}/></button></header>
    <div className="scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
      {messages.length===0?<div className="grid h-full place-items-center text-center"><div><MessageCircle className="mx-auto text-stone-700" size={34}/><p className="mt-3 text-sm text-stone-500">No messages yet. Start the planning.</p></div></div>:messages.map(message=>{const mine=message.profile_id===me.id;return <article key={message.id} className={`group flex gap-2.5 ${mine?'flex-row-reverse':''}`}>
        {message.profiles?.avatar_url?<img src={message.profiles.avatar_url} alt="" className="h-8 w-8 shrink-0 rounded-full border border-white/10"/>:<div className="h-8 w-8 shrink-0 rounded-full bg-moss/40"/>}
        <div className={`min-w-0 max-w-[78%] ${mine?'text-right':''}`}><div className={`mb-1 flex items-center gap-2 text-[10px] text-stone-500 ${mine?'justify-end':''}`}><span className="truncate font-semibold text-stone-400">{message.profiles?.discord_username||'Team member'}</span><time dateTime={message.created_at}>{timeFormatter.format(new Date(message.created_at))}</time></div><div className={`relative rounded-xl px-3 py-2 text-left text-sm leading-5 ${mine?'rounded-tr-sm bg-gold text-ink':'rounded-tl-sm bg-[#232d21] text-stone-200'}`}><p className="whitespace-pre-wrap break-words">{message.body}</p>{(mine||me.is_admin)?<button onClick={()=>void remove(message.id)} className={`absolute -top-2 ${mine?'-left-2':'-right-2'} rounded-full border border-white/10 bg-ink p-1.5 text-stone-500 opacity-0 shadow-lg transition hover:text-red-300 group-hover:opacity-100 focus:opacity-100`} aria-label="Delete message"><Trash2 size={12}/></button>:null}</div></div>
      </article>})}
      <div ref={endRef}/>
    </div>
    {error?<div className="mx-4 mb-2 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200"><span className="flex-1">{error}</span><button onClick={()=>setError('')} aria-label="Dismiss error"><X size={14}/></button></div>:null}
    <form onSubmit={send} className="border-t border-white/10 p-3"><div className="flex items-end gap-2 rounded-xl border border-white/10 bg-black/20 p-2 focus-within:border-gold/40"><textarea value={draft} onChange={event=>setDraft(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();event.currentTarget.form?.requestSubmit()}}} maxLength={2000} rows={2} placeholder="Message the team…" className="max-h-28 flex-1 resize-none bg-transparent px-1 py-1 text-sm text-parchment outline-none placeholder:text-stone-600" aria-label="Chat message"/><button type="submit" disabled={!draft.trim()||sending} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold text-ink disabled:opacity-30" aria-label="Send message"><Send size={16}/></button></div><p className="mt-1.5 px-1 text-[9px] text-stone-600">Enter to send · Shift + Enter for a new line</p></form>
  </aside>
}
