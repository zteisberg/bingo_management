import { Compass, LockKeyhole, Users } from 'lucide-react'
import type { Section, Tile } from '../types'

const statusColors={open:'bg-stone-400',in_progress:'bg-amber-400',complete:'bg-emerald-500'}
const directionColors={north:'bg-sky-400',east:'bg-orange-400',south:'bg-emerald-400',west:'bg-violet-400'} as const
const cornerIds=new Set(['northwest','northeast','southwest','southeast'])
const routeTargets=[['Center','center'],['North','north_gate'],['East','east_gate'],['South','south_gate'],['West','west_gate']] as const

export function Board({sections,tiles,onTile,isAdmin,onToggle,needsHelpOnly}:{sections:Section[];tiles:Tile[];onTile:(t:Tile,s:Section)=>void;isAdmin:boolean;onToggle:(s:Section)=>void;needsHelpOnly:boolean}){
  const cols=Math.max(1,...sections.map(s=>s.col)),rows=Math.max(1,...sections.map(s=>s.row))
  const sectionNames=new Map(sections.map(section=>[section.id,section.name]))

  function jumpTo(id:string){document.getElementById(`section-${id}`)?.scrollIntoView({behavior:'smooth',block:'center',inline:'center'})}

  return <div>
    <nav className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-white/[.07] bg-panel/50 p-2" aria-label="Board navigation">
      <span className="flex items-center gap-2 px-2 text-[10px] font-bold uppercase tracking-[.18em] text-stone-500"><Compass size={14} className="text-gold"/>Jump to</span>
      {routeTargets.map(([label,id])=><button key={id} onClick={()=>jumpTo(id)} className="rounded-lg border border-white/[.08] px-3 py-1.5 text-xs text-stone-300 hover:border-gold/40 hover:text-gold">{label}</button>)}
      <span className="ml-auto flex items-center gap-2 px-2 text-[10px] text-stone-500"><span className="text-sky-300">N</span><span className="text-orange-300">E</span><span className="text-emerald-300">S</span><span className="text-violet-300">W</span>Colored edges connect unlock routes</span>
      {needsHelpOnly?<span className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-200">Highlighting tiles with no volunteers</span>:null}
    </nav>
    <div className="scrollbar overflow-auto pb-6"><div className="grid min-w-[1460px] gap-5" style={{gridTemplateColumns:`repeat(${cols},minmax(260px,1fr))`,gridTemplateRows:`repeat(${rows},auto)`}}>
      {sections.map(section=>{
        const corner=cornerIds.has(section.id),gridColumn=corner?`${section.col===5?4:section.col} / span 2`:section.col
        const gatewayTiles=tiles.filter(tile=>tile.tile_gateways.some(gateway=>gateway.section_id===section.id))
        const gatewayComplete=gatewayTiles.filter(tile=>tile.status==='complete').length
        const sources=[...new Set(gatewayTiles.map(tile=>sectionNames.get(tile.section_id)||tile.section_id))]
        const dependency=section.id==='center'?'Starting point':sources.length?`Unlocked by ${sources.join(' + ')}`:'Outer objective region'
        return <section id={`section-${section.id}`} key={section.id} style={{gridColumn,gridRow:section.row}} className={`relative overflow-hidden self-center rounded-xl border p-3 shadow-insetgold ${section.unlocked?'border-gold/30 bg-panel/85':'border-stone-700/70 bg-[#171c16]'}`}>
          {section.row<3?<span className={`absolute inset-x-0 top-0 h-0.5 ${directionColors.north}`}/>:null}{section.col>3?<span className={`absolute inset-y-0 right-0 w-0.5 ${directionColors.east}`}/>:null}{section.row>3?<span className={`absolute inset-x-0 bottom-0 h-0.5 ${directionColors.south}`}/>:null}{section.col<3?<span className={`absolute inset-y-0 left-0 w-0.5 ${directionColors.west}`}/>:null}
          <header className="mb-3 flex min-h-12 items-start justify-between gap-3 px-1">
            <div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-stone-500">{dependency}</p><h2 className="font-display text-lg text-parchment">{section.name}</h2>{!section.unlocked&&gatewayTiles.length>0?<p className="mt-1 text-[10px] font-semibold text-gold/80">{gatewayComplete}/{gatewayTiles.length} gateway tiles complete</p>:null}</div>
            {isAdmin?<button onClick={()=>onToggle(section)} className="rounded-md border border-white/10 bg-ink/80 p-2 text-stone-400 hover:text-gold" title={section.unlocked?'Lock section':'Unlock section'}><LockKeyhole size={15}/></button>:!section.unlocked?<div className="flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-1 text-[10px] text-stone-400"><LockKeyhole size={12}/>Locked</div>:null}
          </header>
          <div className="grid gap-2" style={{gridTemplateColumns:`repeat(${section.tile_cols||3},minmax(0,1fr))`}}>
            {section.id==='center'?<div style={{gridColumn:2,gridRow:2}} className="grid min-h-24 place-items-center overflow-hidden rounded-lg border border-gold/40 bg-gold/[.07]"><img src="https://raw.githubusercontent.com/zteisberg/bingo_management/main/public/banana-hammocks-logo.png" alt="Banana Hammocks team logo" className="h-full min-h-24 w-full object-cover"/></div>:null}
            {tiles.filter(tile=>tile.section_id===section.id).sort((a,b)=>a.row-b.row||a.col-b.col).map(tile=>{
              const secret=tile.name.toLowerCase()==='top secret',gateway=tile.tile_gateways.length>0,count=tile.tile_contributors.length,covered=count>=3,uncovered=count===0
              const destinations=tile.tile_gateways.map(item=>sectionNames.get(item.section_id)||item.section_id).join(' + ')
              const directions=new Set(tile.tile_gateways.flatMap(item=>{const target=sections.find(candidate=>candidate.id===item.section_id);if(!target)return [];const result:string[]=[];if(target.row<section.row)result.push('north');if(target.row>section.row)result.push('south');if(target.col<section.col)result.push('west');if(target.col>section.col)result.push('east');return result}))
              const filtered=needsHelpOnly&&!uncovered&&!secret
              const directionLabel=[...directions].map(direction=>direction[0].toUpperCase()).join(' + ')
              return <button key={tile.id} aria-label={secret?'Mystery tile — revealed on bingo day':tile.name} style={{gridColumn:tile.col,gridRow:tile.row}} disabled={secret} onClick={()=>onTile(tile,section)} className={`group relative min-h-24 overflow-hidden rounded-lg border p-2.5 pl-3.5 text-left transition ${secret?'cursor-not-allowed border-violet-400/30 bg-violet-950/30':uncovered?'border-amber-400/45 bg-amber-950/10 hover:border-amber-300/70':'border-white/10 bg-[#20261f] hover:border-gold/50'} ${gateway?'bg-[#242a1e]':''} ${!section.unlocked&&!secret?'saturate-50':''} ${filtered?'opacity-20':''}`}>
                {directions.has('north')?<span className={`absolute inset-x-0 top-0 h-[3px] ${directionColors.north}`}/>:null}{directions.has('east')?<span className={`absolute inset-y-0 right-0 w-[3px] ${directionColors.east}`}/>:null}{directions.has('south')?<span className={`absolute inset-x-0 bottom-0 h-[3px] ${directionColors.south}`}/>:null}{directions.has('west')?<span className={`absolute inset-y-0 left-0 w-[3px] ${directionColors.west}`}/>:null}
                {!secret?<span className={`absolute bottom-3 left-1 top-3 w-1 rounded-full ${statusColors[tile.status]}`}/>:null}
                <p className={`line-clamp-3 text-[11px] font-semibold leading-[15px] ${secret?'text-center uppercase tracking-[.16em] text-violet-200':'text-stone-100'}`}>{secret?'?  Mystery tile':tile.name}</p>
                {gateway?<p className="mt-2 text-[8px] font-bold uppercase tracking-wide text-gold/80" aria-label={`Unlocks ${destinations}`}>Unlocks → {directionLabel}</p>:null}
                {!secret?<div className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${uncovered?'border-amber-300/50 bg-amber-400/15 text-amber-100':covered?'border-emerald-400/30 bg-emerald-500/10 text-emerald-200':'border-white/15 bg-black/20 text-stone-300'}`}><Users size={11}/>{count} · {uncovered?'needs coverage':covered?'covered':'contributor'+(count===1?'':'s')}</div>:null}
              </button>
            })}
          </div>
        </section>
      })}
    </div></div>
  </div>
}
