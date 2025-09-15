<script lang="ts">
  // --------- Daten & State ----------
  type Cat = 'Produktivität'|'Spiele'|'Kreativ'|'Tools'|'Lernen'|'Sozial'|'System';
  type App = {
    id: string; name: string; category: Cat; rating: number;
    price?: string; badge?: string; color?: string; icon?: string;
    width?: number; height?: number;
  };

  const CATS = ['Alle','Produktivität','Spiele','Kreativ','Tools','Lernen','Sozial','System'] as const;

  let apps: App[] = [
    { id:'notes',  name:'Oregon Notes', category:'Produktivität', rating:4.8, price:'Gratis', badge:'Top',  color:'#8b5cf6', icon:'📝', width:900, height:600 },
    { id:'chat',   name:'Oregon Chat',  category:'Sozial',        rating:4.8, price:'Gratis', badge:'Top',  color:'#6366f1', icon:'💬', width:900, height:620 },
    { id:'term',   name:'Terminus',     category:'System',        rating:4.6, price:'Gratis',              color:'#10b981', icon:'>_', width:880, height:520 },
    { id:'studio', name:'Pixel Studio', category:'Kreativ',       rating:4.6, price:'Gratis', badge:'Neu', color:'#06b6d4', icon:'🎨', width:960, height:640 },
    { id:'arena',  name:'Drift Arena',  category:'Spiele',        rating:4.2, price:'Gratis',              color:'#a855f7', icon:'🏁', width:960, height:640 },
    { id:'tasks',  name:'Flow Tasks',   category:'Produktivität', rating:4.9, price:'Gratis',              color:'#3b82f6', icon:'📋', width:900, height:600 },
  ];

  // Suche/Filter/Sortierung
  let q = '';
  let activeCategory: (typeof CATS)[number] = 'Alle';
  let sortMode: 'Beliebt'|'Neu'|'Rating' = 'Beliebt';

  // Installation & Launcher (persistiert)
  let installing: Record<string, boolean> = {};
  let progress:   Record<string, number>  = {};
  let installed:  Record<string, boolean> = loadInstalled();

  function loadInstalled() {
    try { return JSON.parse(localStorage.getItem('os.installed') || '{}'); } catch { return {}; }
  }
  function saveInstalled() {
    try { localStorage.setItem('os.installed', JSON.stringify(installed)); } catch {}
  }

  const sleep = (ms:number)=>new Promise(r=>setTimeout(r,ms));

  async function install(app:App) {
    if (installed[app.id] || installing[app.id]) return;
    installing[app.id] = true;
    progress[app.id] = 0;
    for (let i=0; i<=100; i+= Math.max(4, Math.round(Math.random()*12))) {
      progress[app.id] = Math.min(100, i);
      await sleep(70);
    }
    installing[app.id] = false;
    installed[app.id] = true;
    progress[app.id] = 100;
    saveInstalled();
  }

  // Offen angezeigte App (null = Store-Ansicht)
  let activeAppId: string | null = null;

  function openApp(id: string) {
    if (!installed[id]) return;
    activeAppId = id;
  }
  function closeApp() {
    activeAppId = null;
  }

  function filteredApps() {
    let list = apps.filter(a =>
      (activeCategory==='Alle' || a.category===activeCategory) &&
      (a.name.toLowerCase().includes(q.toLowerCase()) || a.category.toLowerCase().includes(q.toLowerCase()))
    );
    if (sortMode==='Rating') list = list.sort((a,b)=> b.rating - a.rating);
    if (sortMode==='Neu')    list = list.sort((a,b)=> (b.badge==='Neu'?1:0) - (a.badge==='Neu'?1:0));
    return list;
  }

  function appById(id:string) { return apps.find(a=>a.id===id)!; }

  // Notes
  let notes = (localStorage.getItem('os.notes')||'').toString();
  function saveNotes(){ try{ localStorage.setItem('os.notes', notes);}catch{} }

  // Chat
  type Msg = { id:number; who:'du'|'bot'; text:string; t:number };
  let chat: Msg[] = [];
  let input = '';

  function sendChat(){
    const t = Date.now();
    const me:Msg = { id:t, who:'du', text:input.trim(), t };
    if(!me.text) return;
    chat = [...chat, me];
    input = '';
    setTimeout(()=>{
      const reply:Msg = { id:t+1, who:'bot', text:`Echo: ${me.text}`, t:t+1 };
      chat = [...chat, reply];
      const scroller = document.querySelector('.chat-log') as HTMLElement;
      scroller?.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
    }, 300);
  }

  // Terminal
  let termOut:string[] = ['Willkommen in Terminus. Tippe "help".'];
  let termIn = '';
  function termExec(){
    const line = termIn.trim();
    if(!line) return;
    termOut = [...termOut, `> ${line}`];
    if(line==='help') termOut = [...termOut,'Befehle: help, echo <txt>, clear, time'];
    else if(line.startsWith('echo ')) termOut = [...termOut, line.slice(5)];
    else if(line==='time') termOut = [...termOut, new Date().toLocaleString()];
    else if(line==='clear') termOut = [''];
    else termOut = [...termOut, 'Unbekannter Befehl'];
    termIn = '';
    const box = document.querySelector('.term-box') as HTMLElement;
    box?.scrollTo({ top: box.scrollHeight });
  }

  // Pixel Studio – kleines Pixelpaint
  let brush = '#7c8cff', pxSize = 16;
  let drawing = false;
  let canvasEl: HTMLCanvasElement;

  function setupCanvas(node:HTMLCanvasElement){
    canvasEl = node;
    const dpr = Math.max(1, window.devicePixelRatio||1);
    const w = 40, h = 24;
    node.width  = w * pxSize * dpr;
    node.height = h * pxSize * dpr;
    node.style.width  = `${w*pxSize}px";
    node.style.height = `${h*pxSize}px`;
    const ctx = node.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#0f1424'; ctx.fillRect(0,0,w*pxSize,h*pxSize);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    for(let x=0;x<=w;x++){ ctx.beginPath(); ctx.moveTo(x*pxSize,0); ctx.lineTo(x*pxSize,h*pxSize); ctx.stroke(); }
    for(let y=0;y<=h;y++){ ctx.beginPath(); ctx.moveTo(0,y*pxSize); ctx.lineTo(w*pxSize,y*pxSize); ctx.stroke(); }
  }
  function paintAt(ev:MouseEvent){
    const rect = canvasEl.getBoundingClientRect();
    const x = Math.floor((ev.clientX-rect.left)/pxSize)*pxSize;
    const y = Math.floor((ev.clientY-rect.top)/pxSize)*pxSize;
    const ctx = canvasEl.getContext('2d')!;
    ctx.fillStyle = brush; ctx.fillRect(x,y,pxSize,pxSize);
  }
  function canvasInit(node:HTMLCanvasElement){ setupCanvas(node); return { destroy(){} }; }

  // Arena Animation
  let pos=50, dir=1, speed=2, raf:number|undefined;
  function tickArena(){
    pos += dir*speed;
    if(pos<0||pos>100){ dir*=-1; }
    raf = requestAnimationFrame(tickArena);
  }
  function startArena(){ if(!raf) raf = requestAnimationFrame(tickArena); }
  function stopArena(){ if(raf){ cancelAnimationFrame(raf); raf=undefined; } }
</script>

{#if !activeAppId}
  <!-- STORE / LAUNCHER -->
  <section class="store-root">
    <header class="store-topbar">
      <div class="brand">
        <div class="logo"></div>
        <strong>Oregon Store</strong>
      </div>
      <div class="search">
        <input placeholder="Apps suchen …" bind:value={q} aria-label="App-Suche" />
      </div>
      <nav class="filters">
        <div class="tabs">
          {#each CATS as c}
            <button class:active={activeCategory===c} on:click={() => activeCategory=c}>{c}</button>
          {/each}
        </div>
        <select class="sort" bind:value={sortMode} aria-label="Sortieren">
          <option>Beliebt</option>
          <option>Neu</option>
          <option>Rating</option>
        </select>
      </nav>
    </header>

    <section class="grid">
      {#each filteredApps() as app (app.id)}
        <article class="card">
          {#if app.badge}<span class="badge">{app.badge}</span>{/if}
          <div class="row">
            <div class="icon" style={`--accent:${app.color || '#7c8cff'}`}>{app.icon || '🟦'}</div>
            <div class="meta">
              <h3>{app.name}</h3>
              <p class="sub">{app.category} • ★ {app.rating.toFixed(1)}</p>
            </div>
          </div>
          <div class="actions">
            {#if installed[app.id]}
              <button class="primary sm" on:click={() => openApp(app.id)}>Öffnen</button>
              <button class="outline sm" on:click={() => { delete installed[app.id]; saveInstalled(); }}>Deinstallieren</button>
            {:else if installing[app.id]}
              <button class="loading sm" disabled>
                <span class="dot"></span> Lädt… {Math.min(100, (progress[app.id]||0)).toFixed(0)}%
              </button>
            {:else}
              <button class="primary sm" on:click={() => install(app)}>Installieren {app.price ? `• ${app.price}` : ''}</button>
              <button class="outline sm" on:click={() => alert('Details (Demo)')}>Details</button>
            {/if}
          </div>
        </article>
      {/each}
    </section>
  </section>
{:else}
  <!-- APP-ANSICHT IM SELBEN FENSTER -->
  {#key activeAppId}
    {@const app = appById(activeAppId)}
    <section class="app-shell">
      <header class="app-titlebar">
        <button class="back" on:click={closeApp} title="Zurück zum Store">←</button>
        <div class="app-head">
          <div class="icon" style={`--accent:${app.color || '#7c8cff'}`}>{app.icon || '🟦'}</div>
          <h2>{app.name}</h2>
        </div>
        <div></div>
      </header>

      <section class="app-body">
        {#if activeAppId==='notes'}
          <section class="notes-wrap">
            <div class="notes-toolbar">
              <button on:click={() => { notes=''; saveNotes(); }}>Leeren</button>
              <button class="primary" on:click={saveNotes}>Speichern</button>
            </div>
            <textarea class="notes-area" bind:value={notes} placeholder="Schreibe Notizen…"></textarea>
          </section>
        {:else if activeAppId==='chat'}
          <section class="chat-wrap">
            <div class="chat-log">
              {#each chat as m (m.id)}
                <div class="chat-msg {m.who==='du' ? 'you' : 'bot'}">
                  <span class="chip {m.who==='du' ? 'you' : 'bot'}">{m.text}</span>
                </div>
              {/each}
            </div>
            <div style="display:flex; gap:8px;">
              <input style="flex:1" placeholder="Nachricht…" bind:value={input} on:keydown={(e)=> e.key==='Enter' && sendChat()} />
              <button class="primary" on:click={sendChat}>Senden</button>
            </div>
          </section>
        {:else if activeAppId==='term'}
          <section class="term-wrap">
            <div class="term-box">
              {#each termOut as line, i}
                <div>{line}</div>
              {/each}
            </div>
            <div class="term-input">
              <input placeholder='Befehl (help, echo, time, clear)…' bind:value={termIn} on:keydown={(e)=> e.key==='Enter' && termExec()} />
              <button class="primary" on:click={termExec}>Run</button>
            </div>
          </section>
        {:else if activeAppId==='studio'}
          <section class="studio-wrap">
            <div class="tools">
              <div>Farbe</div>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                {#each ['#7c8cff','#eab308','#22c55e','#06b6d4','#ef4444','#ffffff','#000000'] as c}
                  <div class="color-swatch" style={`background:${c}`} on:click={()=>brush=c} title={c}></div>
                {/each}
              </div>
              <label style="margin-top:10px;">Pixelgröße
                <input type="range" min="8" max="24" step="2" bind:value={pxSize} />
              </label>
              <button style="margin-top:8px;" on:click={()=>setupCanvas(canvasEl)}>Neu</button>
            </div>
            <div class="canvas-box">
              <canvas bind:this={canvasEl}
                on:mousedown={() => drawing=true}
                on:mouseup={() => drawing=false}
                on:mouseleave={() => drawing=false}
                on:mousemove={(e)=> drawing && paintAt(e)}
                use:canvasInit />
            </div>
          </section>
        {:else if activeAppId==='arena'}
          <section class="arena-wrap" on:mouseenter={startArena} on:mouseleave={stopArena}>
            <div class="car" style={`--x:${pos}%`}></div>
            <div style="position:absolute; bottom:10px; left:10px; display:flex; gap:8px;">
              <button on:click={()=>{dir=1}}>►</button>
              <button on:click={()=>{dir=-1}}>◄</button>
              <button on:click={()=>{speed=Math.max(1, speed-1)}}>-</button>
              <button on:click={()=>{speed=Math.min(6, speed+1)}}>+</button>
            </div>
          </section>
        {:else if activeAppId==='tasks'}
          <section class="tasks-wrap">
            <div class="tasks-input">
              <input placeholder="Neue Aufgabe…" bind:value={todoInput} on:keydown={(e)=> e.key==='Enter' && addTodo()} />
              <button class="primary" on:click={addTodo}>Hinzufügen</button>
            </div>
            <div class="todo-list">
              {#each todos as t (t.id)}
                <div class="todo-item">
                  <input type="checkbox" bind:checked={t.done} on:change={()=>toggleTodo(t.id)} />
                  <span class:done={t.done}>{t.text}</span>
                  <div style="margin-left:auto; display:flex; gap:6px;">
                    <button class="outline sm" on:click={()=>delTodo(t.id)}>Löschen</button>
                  </div>
                </div>
              {/each}
              {#if !todos.length}<div style="color:var(--muted);">Keine Aufgaben.</div>{/if}
            </div>
          </section>
        {:else}
          <div class="placeholder">Diese App hat noch keinen Inhalt.</div>
        {/if}
      </section>
    </section>
  {/key}
{/if}

<style>
  :root {
    --bg: #0d0f16;
    --panel: #141824;
    --panel-2: #111522;
    --border: #242a3a;
    --txt: #e7ebff;
    --muted: #a9b0c6;
    --ring: #7c8cff;
  }

  * { box-sizing: border-box; }

  .store-root {
    display:grid;
    grid-template-rows:auto 1fr;
    gap: 12px;
    height: 100%;
    width: 100%;
    padding: 14px;
    background: var(--bg);
    color: var(--txt);
    border-radius: 16px;
  }
  .store-topbar {
    display:grid; grid-template-columns: 1fr 1.1fr auto; align-items:center; gap:10px;
  }
  .brand { display:flex; align-items:center; gap:8px; }
  .logo { width:18px; height:18px; border-radius:4px; background: linear-gradient(135deg,#7c8cff,#6ee7ff); }
  .search input {
    width:100%; padding:.7rem .9rem; border-radius:12px;
    background: var(--panel); border:1px solid var(--border); color: var(--txt);
  }
  .filters { display:flex; align-items:center; gap:.7rem; }
  .tabs { display:flex; gap:.35rem; overflow:auto; scrollbar-width:none; }
  .tabs::-webkit-scrollbar{ display:none; }
  .tabs button { padding:.45rem .75rem; border-radius:999px; border:1px solid var(--border); background: var(--panel-2); color: var(--txt); }
  .tabs button.active { background:#1a2030; border-color:#2b3550; }
  .sort { padding:.45rem .6rem; border-radius:10px; background: var(--panel-2); border:1px solid var(--border); color: var(--txt); }

  .grid {
    display:grid; gap:10px;
    grid-template-columns: repeat( auto-fill, minmax(220px, 1fr) );
  }
  .card {
    position: relative;
    background: var(--panel); border:1px solid var(--border); border-radius:14px; padding:12px;
  }
  .badge { position:absolute; top:8px; left:8px; font-size:.7rem; padding:.18rem .45rem; border-radius:999px; background:#1a2030; border:1px solid #2b3550; }
  .row { display:flex; gap:10px; align-items:center; }
  .icon { width:48px; height:48px; border-radius:12px; display:grid; place-items:center; background: color-mix(in oklab, var(--accent, #7c8cff), black 80%); color:white; font-weight:700; }
  .meta h3 { margin:.4rem 0 .1rem; font-size:1rem; }
  .sub { margin:0; color: var(--muted); font-size:.88rem; }
  .actions { margin-top:.6rem; display:flex; gap:.45rem; flex-wrap:wrap; }

  button { cursor:pointer; border:1px solid #2b3550; background:#1a2030; color:var(--txt); padding:.48rem .75rem; border-radius:10px; }
  button.primary { background: var(--accent, #3846ff); border-color:#2b3cff; }
  button.outline { background: transparent; }
  button.sm { padding:.4rem .65rem; font-size:.92rem; }
  .loading .dot { display:inline-block; width:.6em; height:.6em; border-radius:50%; background:#cfd6ff; margin-right:.4em; animation:pulse 1s ease-in-out infinite; vertical-align:middle; }
  @keyframes pulse { 0%,100%{opacity:.4; transform: scale(.9);} 50%{opacity:1; transform: scale(1);} }

  .app-shell { display:grid; grid-template-rows:auto 1fr; height:100%; width:100%; background: var(--bg); border-radius:16px; }
  .app-titlebar {
    display:grid; grid-template-columns:auto 1fr auto; align-items:center;
    gap:10px; padding:10px 12px; background: var(--panel); border-bottom:1px solid var(--border); border-top-left-radius:16px; border-top-right-radius:16px;
  }
  .back { border-radius:8px; }
  .app-head { display:flex; align-items:center; gap:8px; }
  .app-head .icon { width:24px; height:24px; border-radius:6px; font-size:.9rem; }

  .app-body { padding:12px; overflow:auto; }
  .placeholder { color:var(--muted); }

  .notes-wrap { display:grid; grid-template-rows:auto 1fr; gap:8px; height:100%; }
  .notes-toolbar { display:flex; gap:8px; }
  .notes-area {
    width:100%; height:100%; background: var(--panel); border:1px solid var(--border); border-radius:12px; padding:12px; color:var(--txt);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }

  .chat-wrap { display:grid; grid-template-rows: 1fr auto; gap:8px; height:100%; }
  .chat-log { background: var(--panel); border:1px solid var(--border); border-radius:12px; padding:10px; overflow:auto; }
  .chat-msg { display:flex; gap:8px; margin-bottom:6px; }
  .chat-msg.you { justify-content:flex-end; }
  .chip { padding:.2rem .5rem; border-radius:999px; font-size:.8rem; color:white; }
  .chip.you { background:#647dee; }
  .chip.bot { background:#50c9c3; }

  .term-wrap { display:grid; grid-template-rows: 1fr auto; gap:8px; height:100%; }
  .term-box { background:black; color:#aee3a5; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; border-radius:12px; padding:10px; overflow:auto; border:1px solid #2b3550; }
  .term-input { display:flex; gap:8px; }
  .term-input input { flex:1; padding:.6rem .7rem; border-radius:10px; border:1px solid var(--border); background: var(--panel); color: var(--txt); }

  .studio-wrap { display:grid; grid-template-columns:auto 1fr; gap:12px; }
  .canvas-box { background: var(--panel); border:1px solid var(--border); border-radius:12px; display:grid; place-items:center; padding:12px; }
  .tools { display:grid; gap:8px; align-content:start; }
  .color-swatch { width:28px; height:28px; border-radius:6px; border:1px solid var(--border); cursor:pointer; }

  .arena-wrap { background: var(--panel); border:1px solid var(--border); border-radius:12px; padding:12px; height:360px; position:relative; overflow:hidden; }
  .car { position:absolute; left:var(--x, 50%); top:50%; transform: translate(-50%, -50%); width:60px; height:26px; border-radius:6px; background: linear-gradient(90deg,#a855f7,#7c8cff); }

  .tasks-wrap { display:grid; grid-template-rows:auto 1fr; gap:8px; height:100%; }
  .tasks-input { display:flex; gap:8px; }
  .tasks-input input { flex:1; padding:.6rem .7rem; border-radius:10px; border:1px solid var(--border); background: var(--panel); color: var(--txt); }
  .todo-list { background: var(--panel); border:1px solid var(--border); border-radius:12px; padding:10px; overflow:auto; }
  .todo-item { display:flex; align-items:center; gap:8px; padding:6px 4px; border-bottom:1px dashed #22283a; }
  .todo-item:last-child { border-bottom:none; }
  .todo-item span.done { text-decoration: line-through; color: var(--muted); }
</style>
