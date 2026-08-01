import { Flag, LockKeyhole, Users } from 'lucide-react'
import type { Section, Tile } from '../types'

const colors={open:'bg-stone-500',in_progress:'bg-amber-400',complete:'bg-emerald-500'}

export function Board({sections,tiles,onTile,isAdmin,onToggle}:{sections:Section[];tiles:Tile[];onTile:(t:Tile,s:Section)=>void;isAdmin:boolean;onToggle:(s:Section)=>void}){
  const cols=Math.max(1,...sections.map(s=>s.col)),rows=Math.max(1,...sections.map(s=>s.row))
  return <div className="scrollbar overflow-auto pb-6"><div className="grid min-w-[1460px] gap-4" style={{gridTemplateColumns:`repeat(${cols},minmax(260px,1fr))`,gridTemplateRows:`repeat(${rows},auto)`}}>
    {sections.map(s=><section key={s.id} style={{gridColumn:s.col,gridRow:s.row}} className={`relative self-center rounded-xl border p-3 shadow-insetgold ${s.unlocked?'border-gold/25 bg-panel/80':'border-white/5 bg-black/30'}`}>
      <header className="relative z-10 mb-3 flex items-center justify-between px-1"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-stone-500">{s.id.replace(/_/g,' ')}</p><h2 className={`font-display text-lg ${s.unlocked?'text-parchment':'text-stone-600'}`}>{s.name}</h2></div>{isAdmin?<button onClick={()=>onToggle(s)} className="rounded-md border border-white/10 bg-ink/80 p-2 text-stone-500 hover:text-gold" title={s.unlocked?'Lock section':'Unlock section'}><LockKeyhole size={15}/></button>:!s.unlocked&&<LockKeyhole size={18} className="text-stone-600"/>}</header>
      <div className="grid gap-2" style={{gridTemplateColumns:`repeat(${s.tile_cols||3},minmax(0,1fr))`}}>
        {s.id==='center'&&<div style={{gridColumn:2,gridRow:2}} className="grid min-h-24 place-items-center overflow-hidden rounded-lg border border-gold/40 bg-gold/[.07]"><img src="https://raw.githubusercontent.com/zteisberg/bingo_management/main/public/banana-hammocks-logo.png" alt="Banana Hammocks team logo" className="h-full min-h-24 w-full object-cover"/></div>}
        {tiles.filter(t=>t.section_id===s.id).sort((a,b)=>a.row-b.row||a.col-b.col).map(t=>{const secret=t.name.toLowerCase()==='top secret';return <button key={t.id} style={{gridColumn:t.col,gridRow:t.row}} disabled={!s.unlocked||secret} onClick={()=>onTile(t,s)} className={`min-h-24 rounded-lg border p-3 text-left transition ${secret?'border-red-900/50 bg-[#211716]':s.unlocked?'border-white/10 bg-[#20291e] hover:-translate-y-0.5 hover:border-gold/50':'cursor-not-allowed border-white/[.04] bg-black/20 opacity-35'}`}><div className="flex justify-between"><span className={`mt-1 h-2 w-2 rounded-full ${secret?'bg-red-700':colors[t.status]}`}/>{t.tile_gateways.length>0&&<Flag size={13} className="text-gold/70"/>}</div><p className={`mt-2 line-clamp-3 text-xs font-semibold leading-4 ${secret?'uppercase tracking-widest text-red-500':'text-stone-200'}`}>{t.name}</p><div className="mt-3 flex items-center gap-1 text-[10px] text-stone-500"><Users size={12}/>{t.tile_contributors.length}</div></button>})}
      </div>{!s.unlocked&&<div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="rounded-full border border-white/10 bg-ink/90 p-3"><LockKeyhole size={20} className="text-stone-500"/></div></div>}
    </section>)}
  </div></div>
}
