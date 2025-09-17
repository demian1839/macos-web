<script lang="ts">
	import { untrack } from 'svelte';
	import { apps_config } from '🍎/configs/apps/apps-config';
	import { apps } from '🍎/state/apps.svelte';

	// Immer wenn ein Fenster aktiv wird → Z-Index erhöhen
	$effect(() => {
		apps.active;
		untrack(() => (apps.active_z_index += 1));
	});

	// Clamp: sorgt dafür, dass keine Z-Indices über 50 bleiben
	$effect(() => {
		const values = Object.values(apps.z_indices);
		if (!values.some((z) => z > 50)) return;

		// Kleinsten nicht-Null-Z-Index finden
		const lowest = Math.min(...values.filter((z) => z !== 0));

		// Alles um (lowest - 10) nach unten verschieben
		untrack(() => (apps.active_z_index -= lowest - 10));

		for (const app of Object.keys(apps.z_indices)) {
			if (apps.z_indices[app] >= lowest) {
				untrack(() => (apps.z_indices[app] -= lowest - 10));
			}
		}
	});
</script>

<section id="windows-area">
	{#each Object.keys(apps_config) as app_id}
		{#if apps.open[app_id] && apps_config[app_id].should_open_window}
			{#await import('./Window.svelte') then { default: Window }}
				<Window {app_id} />
			{/await}
		{/if}
	{/each}
</section>

<style>
	#windows-area {
		position: absolute;
		top: 1.7rem;    /* Platz für Header */
		bottom: 5.25rem; /* Platz für Dock */
		left: 0;
		right: 0;

		width: 100%;
		height: auto;

		overflow: visible; /* Fenster dürfen leicht drüberziehen */
		display: block;
		justify-self: center;
	}
</style>
