<script lang="ts">
	import { onMount } from 'svelte';

	// Performance-Schalter
	let PERF_MODE = true; // bei Bedarf auf false setzen für „mehr Glanz“

	const sleep = (ms:number)=>new Promise(r=>setTimeout(r,ms));
	let reduced = false;

	type AppMeta = {
		id: string;
		name: string;
		category: string;
		rating: number;
		icon: string;
		badge?: string;
		price?: string;
		color?: string;
	};

	const categories = ['Alle','Produktivität','Spiele','Kreativ','Tools','Lernen','Sozial','System'];

	let apps: AppMeta[] = [
		{ id:'notes',  name:'Oregon Notes', category:'Produktivität', rating:4.8, icon:'/app-icons/notes/256.webp',  badge:'Top',  price:'Gratis',  color:'#8b5cf6' },
		{ id:'studio', name:'Pixel Studio', category:'Kreativ',       rating:4.6, icon:'/app-icons/studio/256.webp', badge:'Neu',  price:'Gratis',  color:'#06b6d4' },
		{ id:'drive',  name:'Drive X',      category:'Produktivität', rating:4.7, icon:'/app-icons/drive/256.webp',  price:'Gratis',  color:'#22c55e' },
		{ id:'chat',   name:'Oregon Chat',  category:'Sozial',        rating:4.8, icon:'/app-icons/chat/256.webp',   badge:'Top',   price:'Gratis',  color:'#6366f1' },
		{ id:'tasks',  name:'Flow Tasks',   category:'Produktivität', rating:4.9, icon:'/app-icons/tasks/256.webp',  price:'Gratis', color:'#3b82f6' },
		{ id:'arena',  name:'Drift Arena',  category:'Spiele',        rating:4.2, icon:'/app-icons/arena/256.webp',  price:'Gratis', color:'#a855f7' },
		{ id:'term',   name:'Terminus',     category:'System',        rating:4.6, icon:'/app-icons/terminal/256.webp', price:'Gratis', color:'#10b981' },
	];

	let q = '';
	let activeCategory = 'Alle';
	let sortMode:'Beliebt'|'Neu'|'Rating' = 'Beliebt';

	let featured = ['tasks','studio','chat'];
	let currentSlide = 0;
	let autoSlide = true;

	onMount(async () => {
		reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		// seltener wechseln = weniger Arbeit
		const interval = PERF_MODE ? 9000 : 5500;
		while (autoSlide && !reduced) {
			await sleep(interval);
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

	let installing: Record<string, boolean> = {};
	let installed: Record<string, boolean> = {};

	async function install(app:AppMeta) {
		if (installed[app.id] || installing[app.id]) return;
		installing[app.id] = true;
		await sleep(PERF_MODE ? 600 : 900);
		installing[app.id] = false;
		installed[app.id] = true;
	}
	function openApp(app:AppMeta) {
		// Hier deine echte Open-Logik einhängen
		alert(`${app.name} öffnen (Demo)`);
	}
</script>

<section class="store-root" data-perf={PERF_MODE ? 'on' : 'off'}>
	<header class="store-topbar">
		<div class="brand">
			<div class="logo" aria-hidden="true"></div>
			<strong>Oregon Store</strong>
		</div>

		<div class="search">
			<input placeholder="Apps suchen …" bind:value={q} aria-label="App-Suche" />
		</div>

		<nav class="filters">
			<div class="tabs">
				{#each categories as c}
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

	<section class="featured" aria-label="Empfehlungen">
		{#each featured as id, i}
			{#if i===currentSlide}
				{#each apps.filter(a=>a.id===id) as app}
				<article class="feature-card" style={`--accent:${app.color ?? '#6366f1'}`}>
					<img class="icon" src={app.icon} alt={app.name} width="84" height="84" loading="lazy" decoding="async" />
					<div class="meta">
						<h2>{app.name}</h2>
						<p>{app.category} • ★ {app.rating.toFixed(1)}</p>
						<div class="cta">
							{#if installed[app.id]}
								<button class="ghost" on:click={() => openApp(app)}>Öffnen</button>
							{:else if installing[app.id]}
								<button class="loading" disabled><span class="dot"></span> Installiere…</button>
							{:else}
								<button class="primary" on:click={() => install(app)}>Installieren {app.price ? `• ${app.price}` : ''}</button>
							{/if}
						</div>
					</div>
				</article>
				{/each}
			{/if}
		{/each}

		<div class="dots">
			{#each featured as id, i}
				<button class:active={i===currentSlide} on:click={() => currentSlide=i} aria-label={"Slide "+(i+1)} />
			{/each}
		</div>
	</section>

	<section class="grid">
		{#each filteredApps() as app (app.id)}
			<article class="card" style={`--accent:${app.color ?? '#6366f1'}`} >
				{#if app.badge}<span class="badge">{app.badge}</span>{/if}
				<img class="card-icon" src={app.icon} alt={app.name} width="64" height="64" loading="lazy" decoding="async" />
				<h3>{app.name}</h3>
				<p class="sub">{app.category} • ★ {app.rating.toFixed(1)}</p>
				<div class="actions">
					{#if installed[app.id]}
						<button class="ghost sm" on:click={() => openApp(app)}>Öffnen</button>
						<button class="outline sm" on:click={() => alert('Deinstallieren (Demo)')}>Deinstallieren</button>
					{:else if installing[app.id]}
						<button class="loading sm" disabled><span class="dot"></span> Installiere…</button>
					{:else}
						<button class="primary sm" on:click={() => install(app)}>Installieren</button>
						<button class="outline sm" on:click={() => alert('Details (Demo)')}>Details</button>
					{/if}
				</div>
			</article>
		{/each}
	</section>
</section>

<style>
	:root {
		/* neutrale, performante Farben */
		--bg: #0d0f16;
		--panel: #141824;
		--panel-2: #111522;
		--border: #242a3a;
		--txt: #e7ebff;
		--muted: #a9b0c6;
		--ring: #7c8cff;
	}

	.store-root {
		display:grid;
		grid-template-rows:auto auto 1fr;
		gap: 12px;
		height:100%;
		width:100%;
		padding: 14px;
		background: var(--bg);
		color: var(--txt);
		border-radius: inherit;
		/* Wichtig: Content-Visibility verhindert Offscreen-Rendering */
		content-visibility:auto;
		contain: layout paint style;
	}

	/* Topbar */
	.store-topbar {
		display:grid;
		grid-template-columns: 1fr 1.2fr auto;
		align-items:center;
		gap:10px;
	}
	.brand { display:flex; align-items:center; gap:8px; }
	.logo {
		width:18px; height:18px; border-radius:4px;
		background: linear-gradient(135deg, #7c8cff, #6ee7ff);
	}
	.search input {
		width:100%;
		padding:.7rem .9rem;
		border-radius:12px;
		background: var(--panel);
		border:1px solid var(--border);
		color: var(--txt);
		outline:none;
		transition: border-color .15s ease;
	}
	.search input:focus { border-color: var(--ring); }

	.filters { display:flex; align-items:center; gap:.7rem; }
	.tabs { display:flex; gap:.35rem; overflow:auto; scrollbar-width:none; }
	.tabs::-webkit-scrollbar{ display:none; }
	.tabs button {
		padding:.45rem .75rem;
		border-radius:999px;
		border:1px solid var(--border);
		background: var(--panel-2);
		color: var(--txt);
		transition: background .15s ease, border-color .15s ease, transform .12s ease;
	}
	.tabs button:hover { transform: translateY(-1px); }
	.tabs button.active { background:#1a2030; border-color:#2b3550; }
	.sort {
		padding:.45rem .6rem; border-radius:10px;
		background: var(--panel-2);
		border:1px solid var(--border);
		color: var(--txt);
	}

	/* Featured – bewusst simpel gehalten */
	.featured { position:relative; display:grid; grid-template-columns:1fr; gap:8px; }
	.feature-card {
		display:grid; grid-template-columns:auto 1fr; gap:12px; align-items:center;
		padding:12px;
		border-radius:16px;
		background: var(--panel);
		border:1px solid var(--border);
		/* kleine, performante Transition (nur Opacity/Transform) */
		transition: transform 140ms ease, opacity 140ms ease, border-color .15s ease;
		will-change: transform, opacity;
	}
	.store-root[data-perf="off"] .feature-card:hover { transform: translateY(-2px); }
	.icon { width:72px; height:72px; border-radius:14px; }

	.feature-card .meta h2 { margin:0; font-size:1.1rem; }
	.feature-card .meta p { margin:.2rem 0 .6rem; color:var(--muted); font-size:.92rem; }
	.cta { display:flex; gap:.5rem; flex-wrap:wrap; }

	.dots { display:flex; gap:.4rem; justify-content:center; }
	.dots button {
		width:8px; height:8px; border-radius:999px; border:none; background:#31384f; cursor:pointer;
		transition: transform .12s ease, background .15s ease;
	}
	.dots button.active { background:#7c8cff; transform: scale(1.05); }

	/* Grid */
	.grid {
		display:grid; gap:10px;
		grid-template-columns: repeat( auto-fill, minmax(210px, 1fr) );
		padding-bottom:8px;
	}
	.card {
		position:relative;
		padding:12px; border-radius:14px;
		background: var(--panel);
		border:1px solid var(--border);
		transition: transform 120ms ease, border-color .15s ease, opacity .15s ease;
		will-change: transform, opacity;
		content-visibility:auto;
		contain: content;
	}
	.store-root[data-perf="off"] .card:hover { transform: translateY(-2px); }
	.card .badge {
		position:absolute; top:8px; left:8px;
		font-size:.7rem; padding:.18rem .45rem; border-radius:999px;
		background:#1a2030; border:1px solid #2b3550;
	}
	.card-icon { width:56px; height:56px; border-radius:12px; }
	.card h3 { margin:.6rem 0 .15rem; font-size:1rem; }
	.card .sub { margin:0; color:var(--muted); font-size:.88rem; }

	.actions { display:flex; gap:.45rem; margin-top:.6rem; flex-wrap:wrap; }
	button {
		cursor:pointer; border:1px solid #2b3550; background:#1a2030; color:var(--txt);
		padding:.48rem .75rem; border-radius:10px; transition: transform 100ms ease, background .15s ease, border-color .15s ease;
	}
	button:hover { transform: translateY(-1px); }
	button:active { transform: translateY(0) scale(.98); }
	button.primary { background: var(--accent, #3846ff); border-color: #2b3cff; }
	button.ghost { background:#171d2b; }
	button.outline { background: transparent; }
	button.sm { padding:.4rem .65rem; font-size:.92rem; }

	/* sehr leichte Loader-Animation ohne Layout-Kosten */
	.loading .dot {
		display:inline-block; width:.6em; height:.6em; border-radius:50%;
		background:#cfd6ff; margin-right:.4em; vertical-align:middle;
		animation: pulse 1s ease-in-out infinite;
	}
	@keyframes pulse { 0%,100%{opacity:.4; transform: scale(.9);} 50%{opacity:1; transform: scale(1);} }

	/* Responsiv */
	@media (max-width: 1000px) {
		.store-topbar { grid-template-columns: 1fr; gap:8px; }
	}
</style>
