<script lang="ts">
	import { onMount } from 'svelte';
	import { quintInOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { fade, fly } from 'svelte/transition';

	// Helper function to pause execution
	const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	// Reactive states to control the visibility of elements
	let showLogo = $state(false);
	let showText = $state(false);
	let showProgress = $state(false);
	let hiddenSplashScreen = $state(false);

	// Tweened store for the progress bar animation
	const progressVal = tweened(100, { duration: 3000, easing: quintInOut });

	// Animation sequence when the component mounts
	onMount(async () => {
		// Start the sequence
		showLogo = true;
		await sleep(700); // Wait for logo animation

		showText = true;
		await sleep(1000); // Wait for text animation

		showProgress = true;
		await sleep(200); // Short delay before progress starts

		// Start the progress bar tween
		$progressVal = 0;

		// Wait for the progress bar to finish
		await sleep(3000);

		// Hide the splash screen
		hiddenSplashScreen = true;
	});

	// The text to be animated
	const brandName = 'PuriOS';
</script>

<!-- The splash screen container -->
{#if !hiddenSplashScreen}
	<div transition:fade={{ duration: 500 }} class="splash-screen">

		<!-- Animated Logo -->
		{#if showLogo}
			<div in:fade={{ duration: 700, delay: 200 }} class="logo">
				<svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="50" cy="50" r="45" stroke="white" stroke-width="4"/>
					<path d="M40 30 V 70 H 55 C 65 70, 70 65, 70 50 C 70 35, 65 30, 55 30 H 40 Z M 52 40 V 60" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>
		{/if}

		<!-- Animated Text "PuriOS" -->
		<div class="brand-text">
			{#if showText}
				{#each brandName.split('') as char, i}
					<span
						in:fly={{ y: 20, duration: 500, delay: i * 100, easing: quintInOut }}
						class="char"
					>
						{char}
					</span>
				{/each}
			{/if}
		</div>

		<!-- Progress Bar -->
		{#if showProgress}
			<div
				in:fade={{ duration: 300 }}
				class="progress"
				role="progressbar"
				aria-valuenow={100 - $progressVal}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuetext="Loading up PuriOS"
			>
				<div class="indicator" style:transform="translateX(-{$progressVal}%)"></div>
			</div>
		{/if}

	</div>
{/if}

<!-- iframe to play startup sound, remains unchanged -->
{#if import.meta.env.PROD}
	<iframe id="audio" src="/sounds/mac-startup-sound.mp3" allow="autoplay" title="PuriOS Startup Sound"></iframe>
{/if}

<style>
	:root {
		--system-color-grey-800: #333;
		--system-color-grey-100: #f0f0f0;
	}

	.splash-screen {
		position: fixed;
		inset: 0;
		height: 100vh;
		width: 100vw;
		cursor: none;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1.5rem;
		background-color: #0a0a0a;
		z-index: 9999;
	}

	.logo {
		animation: pulse 2.5s infinite ease-in-out;
	}
	
	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.05);
			opacity: 0.8;
		}
	}

	.brand-text {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		font-size: 2.5rem;
		font-weight: 300;
		letter-spacing: 2px;
		color: var(--system-color-grey-100);
		height: 40px; /* Reserve space to prevent layout shift */
		display: flex;
	}
	
	.char {
		display: inline-block;
	}

	.progress {
		border-radius: 50px;
		height: 5px;
		width: 180px;
		overflow: hidden;
		background-color: var(--system-color-grey-800);
	}

	.indicator {
		background-color: var(--system-color-grey-100);
		border-radius: inherit;
		width: 100%;
		height: 100%;
		transition: transform 150ms linear;
	}

	#audio {
		position: absolute;
		z-index: -9999;
		opacity: 0;
		width: 0;
		height: 0;
	}
</style>
