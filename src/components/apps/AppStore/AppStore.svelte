<script lang="ts">
	// Optional: nutzt deine bestehenden Helpers/Stores, fällt aber automatisch zurück
	import { onMount } from 'svelte';
	let sleep = (ms:number)=>new Promise(r=>setTimeout(r,ms));
	let prefersReducedMotion = false;

	// Falls du diese Pfade im Projekt hast, aktivieren. Sonst bleiben die Fallbacks oben aktiv.
	// import { sleep } from '🍎/helpers/sleep';
	// import { preferences } from '🍎/state/preferences.svelte.ts';
	// $: prefersReducedMotion = preferences?.reduced_motion ?? false;

	type AppMeta = {
		id: string;
		name: string;
		category: string;
		rating: number;
		icon: string;     // Pfad zu 256.webp
		badge?: string;   // z.B. "Neu", "Top"
		price?: string;   // "Gratis", "2,99 €" etc.
		color?: string;   // Akzentfarbe für Card-Glow
	};

	const categories = ['Alle','Produktivität','Spiele','Kreativ','Tools','Lernen','Sozial','System'];

	let apps: AppMeta[] = [
		{ id:'notes',   name:'Oregon Notes', category:'Produktivität', rating:4.8, icon:'/app-icons/notes/256.webp',  badge:'Top', price:'Gratis', color:'#8b5cf6' },
		{ id:'studio',  name:'Pixel Studio', category:'Kreativ',       rating:4.6, icon:'/app-icons/studio/256.webp', badge:'Neu',  price:'Gratis', color:'#06b6d4' },
		{ id:'drive',   name:'Drive X',      category:'Produktivität', rating:4.7, icon:'/app-icons/drive/256.webp',  price:'Gratis', color:'#22c55e' },
		{ id:'orbit',   name:'Orbit Mail',   category:'Produktivität', rating:4.5, icon:'/app-icons/mail/256.webp',   price:'Gratis', color:'#f59e0b' },
		{ id:'synth',   name:'Synth Lab',    category:'Kreativ',       rating:4.4, icon:'/app-icons/synth/256.webp',  price:'2,99 €', color:'#ef4444' },
		{ id:'tasks',   name:'Flow Tasks',   category:'Produktivität', rating:4.9, icon:'/app-icons/tasks/256.webp',  badge:'Empfohlen', price:'Gratis', color:'#3b82f6' },
		{ id:'arena',   name:'Drift Arena',  category:'Spiele',        rating:4.2, icon:'/app-icons/arena/256.webp',  price:'Gratis', color:'#a855f7' },
		{ id:'term',    name:'Terminus',     category:'System',        rating:4.6, icon:'/app-icons/terminal/256.webp', price:'Gratis', color:'#10b981' },
		{ id:'school',  name:'Study Hub',    category:'Lernen',        rating:4.7, icon:'/app-icons/school/256.webp',   price:'Gratis', color:'#f97316' },
		{ id:'share',   name:'AirShare',     category:'Tools',         rating:4.5, icon:'/app-icons/share/256.webp',    price:'Gratis', color:'#14b8a6' },
		{ id:'chat',    name:'Oregon Chat',  category:'Sozial',        rating:4.8, icon:'/app-icons/chat/256.webp',     badge:'Top', price:'Gratis', color:'#6366f1' },
		{ id:'studio2', name:'Photo Forge',  category:'Kreativ',       rating:4.3, icon:'/app-icons/photo/256.webp',    price:'1,99 €', color:'#eab308' }
	];

	let q = '';
	let activeCategory = 'Alle';
	let sortMode:'Beliebt'|'Neu'|'Rating' = 'Beliebt';

	// Featured Carousel
	let featured = ['tasks','studio','chat'];
	let currentSlide = 0;
	let autoSlide = true;

	onMount(async () => {
		prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
		while (autoSlide) {
			await sleep(4500);
			currentSlide = (currentSlide + 1) % featured.length;
		}
	});

	function filteredApps() {
		let list = apps.filter(a =>
			(activeCategory==='Alle' || a.category===activeCategory) &&
			(a.name.toLowerCase().includes(q.toLowerCase()) || a.category.toLowerCase().includes(q.toLowerCase()))
		);
		if (sortMode==='Rating') list.sort((a,b)=>b.rating - a.rating);
		if (sortMode==='Neu') list.sort((a,b)=> (b.badge==='Neu'?1:0) - (a.badge==='Neu'?1:0));
		return list;
	}

	// Parallax hover tilt
	function handleMove(e:MouseEvent, el:HTMLElement) {
		const r = el.getBoundingClientRect();
		const px = (e.clientX - r.left) / r.width;
		const py = (e.clientY - r.top) / r.height;
		const rotX = (py - 0.5) * -10;
		const rotY = (px - 0.5) *  10;
		el.style.setProperty('--tilt-x', `${rotX}deg`);
		el.style.setProperty('--tilt-y', `${rotY}deg`);
		el.style.setProperty('--shine-x', `${px*100}%`);
		el.style.setProperty('--shine-y', `${py*100}%`);
	}
	function resetTilt(el:HTMLElement) {
		el.style.setProperty('--tilt-x', `0deg`);
		el.style.setProperty('--tilt-y', `0deg`);
	}

	// Install / Open simulation
	let installing: Record<string, boolean> = {};
	let installed: Record<string, boolean> = {};
	async function install(app:AppMeta) {
		if (installed[app.id] || installing[app.id]) return;
		installing[app.id] = true;
		await sleep(900);
		await sleep(600);
		installing[app.id] = false;
		installed[app.id] = true;
	}
	function openApp(app:AppMeta) {
		// Trigger dein App-Launcher-Event hier:
		// dispatch('open', { appId: app.id });
		alert(`${app.name} öffnen (Demo)`);
	}
</script>

<section class="store-window app-window-drag-handle"></section>

<section class="store-root">
	<header class="store-topbar">
		<div class="brand">
			<div class="logo-orb" aria-hidden="true"></div>
			<div class="brand-text">
				<strong>Oregon&nbsp;Store</strong>
				<span>Entdecke. Installiere. Starte.</span>
			</div>
		</div>

		<div class="search">
			<input
				placeholder="Apps, Kategorien, Tools …"
				bind:value={q}
				aria-label="App-Suche"
			/>
			<div class="kbd">
				<span>Ctrl</span><span>K</span>
			</div>
		</div>

		<nav class="filters">
			<div class="tabs">
				{#each categories as c}
					<button class:active={activeCategory===c} on:click={() => activeCategory=c}>
						{c}
					</button>
				{/each}
			</div>
			<div class="sort">
				<label>Sortieren</label>
				<select bind:value={sortMode} aria-label="Sortierung">
					<option>Beliebt</option>
					<option>Neu</option>
					<option>Rating</option>
				</select>
			</div>
		</nav>
	</header>

	<section class="featured">
		{#each featured as id, i}
			{#if i === currentSlide}
				{#each apps.filter(a => a.id===id) as app}
				<article class="feature-card"
					style={`--accent:${app.color ?? '#6366f1'}`}
					on:mousemove={(e)=>handleMove(e, e.currentTarget as HTMLElement)}
					on:mouseleave={(e)=>resetTilt(e.currentTarget as HTMLElement)}
				>
					<div class="fx-bg"></div>
					<div class="fx-glow"></div>
					<img class="icon" src={app.icon} alt={app.name} />
					<div class="meta">
						<h2>{app.name}</h2>
						<p>{app.category} • ★ {app.rating.toFixed(1)}</p>
						<div class="cta">
							{#if installed[app.id]}
								<button class="ghost" on:click={() => openApp(app)}>Öffnen</button>
							{:else if installing[app.id]}
								<button class="loading" disabled>
									<span class="spinner" aria-hidden="true"></span> Installiere…
								</button>
							{:else}
								<button on:click={() => install(app)}>Installieren {app.price ? `• ${app.price}` : ''}</button>
							{/if}
						</div>
					</div>
					<div class="shine" aria-hidden="true"
						style="left:var(--shine-x); top:var(--shine-y)"></div>
				</article>
				{/each}
			{/if}
		{/each}

		<div class="dots" role="tablist" aria-label="Featured wechseln">
			{#each featured as id, i}
				<button
					role="tab"
					aria-selected={i===currentSlide}
					class:active={i===currentSlide}
					on:click={() => currentSlide=i}
					title={apps.find(a=>a.id===id)?.name}
				/>
			{/each}
		</div>
	</section>

	<section class="grid">
		{#each filteredApps() as app (app.id)}
			<article class="card"
				style={`--accent:${app.color ?? '#6366f1'}`}
				on:mousemove={(e)=>handleMove(e, e.currentTarget as HTMLElement)}
				on:mouseleave={(e)=>resetTilt(e.currentTarget as HTMLElement)}
			>
				<div class="card-bg"></div>
				{#if app.badge}<span class="badge">{app.badge}</span>{/if}
				<img src={app.icon} alt={app.name} class="card-icon" />
				<h3>{app.name}</h3>
				<p class="sub">{app.category} • ★ {app.rating.toFixed(1)}</p>
				<div class="actions">
					{#if installed[app.id]}
						<button class="ghost sm" on:click={() => openApp(app)}>Öffnen</button>
						<button class="outline sm" on:click={() => alert('Deinstallieren (Demo)')}>Deinstallieren</button>
					{:else if installing[app.id]}
						<button class="loading sm" disabled>
							<span class="spinner" aria-hidden="true"></span>
							Installiere…
						</button>
					{:else}
						<button class="primary sm" on:click={() => install(app)}>Installieren</button>
						<button class="outline sm" on:click={() => alert('Details (Demo)')}>Details</button>
					{/if}
				</div>
				<div class="glare" aria-hidden="true"></div>
			</article>
		{/each}
	</section>
</section>

<style>
	:root {
		--bg: radial-gradient(1200px 800px at 10% 0%, #1f1147 0%, #0b1020 40%, #090a10 100%);
		--glass: hsla(0,0%,100%,0.08);
		--glass-2: hsla(0,0%,100%,0.06);
		--border: hsla(0,0%,100%,0.15);
		--txt: #eef2ff;
		--muted: #b7c0ff;
		--ring: #8b5cf6;
		--shadow: 0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
	}

	.store-root {
		position: relative;
		display: grid;
		grid-template-rows: auto auto 1fr;
		gap: 1.2rem;
		height: 100%;
		width: 100%;
		padding: 1.2rem 1.4rem 1.6rem;
		background: var(--bg);
		color: var(--txt);
		overflow: hidden;
		border-radius: inherit;
	}

	/* Topbar */
	.store-topbar {
		display: grid;
		grid-template-columns: 1fr 1.2fr auto;
		align-items: center;
		gap: 1rem;
	}

	.brand {
		display: flex; align-items: center; gap: .9rem;
	}
	.logo-orb {
		width: 36px; height: 36px; border-radius: 50%;
		background: conic-gradient(from 180deg at 50% 50%, #8b5cf6, #06b6d4, #22c55e, #f59e0b, #ef4444, #8b5cf6);
		filter: blur(.2px);
		box-shadow: 0 0 0 2px rgba(255,255,255,.08), 0 10px 30px rgba(139,92,246,.35);
		animation: orb 6s ease-in-out infinite alternate;
	}
	@keyframes orb {
		from { transform: translateY(0) rotate(0deg); }
		to   { transform: translateY(-2px) rotate(180deg); }
	}
	.brand-text { display:flex; flex-direction:column; line-height:1.1 }
	.brand-text strong { letter-spacing:.2px; font-weight:700 }
	.brand-text span { color: var(--muted); font-size:.88rem }

	.search {
		position: relative; display:flex; align-items:center;
	}
	.search input {
		width: 100%;
		padding: .9rem 3.2rem .9rem 1rem;
		border-radius: 16px;
		background: linear-gradient(180deg, var(--glass), var(--glass-2));
		border: 1px solid var(--border);
		backdrop-filter: blur(10px);
		outline: none; color: var(--txt); font-size:.98rem;
		box-shadow: var(--shadow);
		transition: border .2s, transform .15s;
	}
	.search input:focus { border-color: var(--ring); transform: translateY(-1px); }
	.kbd {
		pointer-events: none;
		position:absolute; right:.5rem;
		display:flex; gap:.25rem;
	}
	.kbd span {
		font-size:.72rem; padding:.25rem .35rem;
		border-radius:8px; background: rgba(255,255,255,.06);
		border:1px solid rgba(255,255,255,.18);
	}

	.filters { display:flex; align-items:center; gap:1rem; }
	.tabs { display:flex; gap:.4rem; overflow:auto; scrollbar-width:none; }
	.tabs::-webkit-scrollbar { display:none; }
	.tabs button {
		padding:.55rem .9rem; border-radius:999px; cursor:pointer;
		background: rgba(255,255,255,.06); border:1px solid var(--border); color:var(--txt);
		transition: transform .15s ease, background .2s, border .2s, box-shadow .2s;
		box-shadow: inset 0 0 0 0 rgba(139,92,246,.5);
	}
	.tabs button:hover { transform: translateY(-1px); }
	.tabs button.active {
		background: rgba(139,92,246,.18);
		border-color: rgba(139,92,246,.55);
		box-shadow: 0 8px 28px rgba(139,92,246,.25);
	}

	.sort { display:flex; align-items:center; gap:.5rem; }
	.sort label { color: var(--muted); font-size:.86rem; }
	.sort select {
		padding:.5rem .8rem; border-radius:10px;
		background: rgba(255,255,255,.06); border:1px solid var(--border);
		color: var(--txt);
	}

	/* Featured */
	.featured {
		position: relative;
		display: grid; grid-template-columns: 1fr;
	}
	.feature-card {
		position: relative;
		display:grid; grid-template-columns: auto 1fr; align-items:center; gap:1.2rem;
		padding: 1.2rem;
		border-radius: 20px;
		background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.05));
		border: 1px solid var(--border);
		backdrop-filter: blur(12px);
		box-shadow: var(--shadow);
		transform: perspective(900px) rotateX(var(--tilt-x,0)) rotateY(var(--tilt-y,0));
		transition: transform .15s ease;
		overflow: hidden;
	}
	.feature-card .icon {
		width: 84px; height: 84px; border-radius: 20px;
		box-shadow: 0 10px 30px rgba(0,0,0,.35);
	}
	.feature-card .meta h2 { margin:0; font-size:1.4rem }
	.feature-card .meta p { margin:.2rem 0 .8rem; color:var(--muted) }
	.feature-card .cta { display:flex; gap:.6rem; flex-wrap:wrap }

	.fx-bg {
		position:absolute; inset:-2px; z-index:-1;
		background:
			radial-gradient(800px 300px at 0% 0%, color-mix(in oklab, var(--accent), transparent 60%) 0%, transparent 70%),
			radial-gradient(800px 300px at 100% 100%, color-mix(in oklab, var(--accent), transparent 60%) 0%, transparent 70%);
		filter: blur(20px);
	}
	.fx-glow {
		position:absolute; inset:-1px; z-index:-2;
		background: radial-gradient(900px 300px at 50% 120%, color-mix(in oklab, var(--accent), transparent 70%) 0%, transparent 70%);
		filter: blur(30px);
	}
	.shine {
		position:absolute; width:240px; height:240px; border-radius:50%;
		background: radial-gradient(circle at center, rgba(255,255,255,.25), transparent 60%);
		transform: translate(-50%,-50%);
		mix-blend-mode: screen; pointer-events:none;
	}

	.dots { display:flex; gap:.4rem; justify-content:center; margin-top:.8rem; }
	.dots button {
		width:10px; height:10px; border-radius:999px; border:none; cursor:pointer;
		background: rgba(255,255,255,.25); transition: transform .15s, background .2s;
	}
	.dots button.active { background: var(--txt); transform: scale(1.1); }

	/* Grid */
	.grid {
		display:grid;
		grid-template-columns: repeat( auto-fill, minmax(220px, 1fr) );
		gap: 1rem;
		padding-bottom: .6rem;
	}
	.card {
		position: relative; overflow: hidden;
		padding: 1rem; border-radius: 18px;
		background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.04));
		border: 1px solid var(--border);
		backdrop-filter: blur(8px);
		box-shadow: var(--shadow);
		transform: perspective(800px) rotateX(var(--tilt-x,0)) rotateY(var(--tilt-y,0));
		transition: transform .18s ease, box-shadow .25s ease, border-color .25s ease;
	}
	.card:hover {
		box-shadow: 0 18px 50px rgba(0,0,0,.45), 0 0 0 1px color-mix(in oklab, var(--accent), transparent 45%);
		border-color: color-mix(in oklab, var(--accent), white 40%);
	}
	.card .card-bg {
		position:absolute; inset: -1px; z-index:-1;
		background:
			radial-gradient(600px 280px at 0% 0%, color-mix(in oklab, var(--accent), transparent 70%) 0%, transparent 70%),
			radial-gradient(600px 280px at 100% 100%, color-mix(in oklab, var(--accent), transparent 70%) 0%, transparent 70%);
		filter: blur(26px);
	}
	.card .badge {
		position:absolute; top:.65rem; left:.65rem;
		font-size:.72rem; padding:.25rem .5rem; border-radius:999px;
		background: rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2);
	}
	.card-icon {
		width:64px; height:64px; border-radius:16px; box-shadow: 0 8px 24px rgba(0,0,0,.35);
	}
	.card h3 { margin:.7rem 0 .2rem; font-weight:700; letter-spacing:.2px }
	.card .sub { margin:0; color: var(--muted); font-size:.9rem }

	.actions { display:flex; gap:.5rem; margin-top:.8rem; flex-wrap:wrap }
	button {
		cursor: pointer; border: 1px solid rgba(255,255,255,.2);
		background: rgba(255,255,255,.08); color: var(--txt);
		padding: .55rem .9rem; border-radius: 12px;
		backdrop-filter: blur(6px);
		transition: transform .12s ease, background .2s, border-color .2s, box-shadow .2s;
	}
	button:hover { transform: translateY(-1px) }
	button:active { transform: translateY(0) scale(.98) }

	button.primary {
		background: linear-gradient(180deg, color-mix(in oklab, var(--accent), white 25%), var(--accent));
		border-color: color-mix(in oklab, var(--accent), black 40%);
		box-shadow: 0 12px 30px color-mix(in oklab, var(--accent), black 70%);
	}
	button.primary:hover {
		box-shadow: 0 16px 40px color-mix(in oklab, var(--accent), black 70%);
	}
	button.ghost { background: rgba(255,255,255,.06) }
	button.outline { background: transparent }
	button.sm { padding: .45rem .75rem; border-radius: 10px; font-size:.92rem }

	button.loading { position:relative; padding-left: 2.1rem }
	.spinner {
		position:absolute; left:.6rem; top:50%; transform:translateY(-50%);
		width:16px; height:16px; border-radius:50%;
		border:2px solid rgba(255,255,255,.45);
		border-top-color: transparent;
		animation: spin 800ms linear infinite;
	}
	@keyframes spin { to { transform: translateY(-50%) rotate(360deg) } }

	.glare {
		position:absolute; inset:-60% -60% auto auto; height:140%;
		background: linear-gradient(120deg, rgba(255,255,255,.18), transparent 60%);
		transform: translateY(-40%) rotate(12deg);
		mix-blend-mode: screen; pointer-events:none;
		filter: blur(6px);
		opacity:.65;
	}

	/* Fensterrahmen (Titelbar bleibt leer, nur Drag-Handle) */
	.store-window {
		position:absolute; inset:0; border-radius: inherit; pointer-events:none;
	}

	/* Responsiv */
	@media (max-width: 1000px) {
		.store-topbar { grid-template-columns: 1fr; gap:.8rem }
	}
</style>
