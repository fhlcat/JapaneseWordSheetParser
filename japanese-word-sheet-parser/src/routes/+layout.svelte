<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	// Material Web Component registrations
	import '@material/web/button/filled-button.js';
	import '@material/web/button/outlined-button.js';
	import '@material/web/button/text-button.js';
	import '@material/web/iconbutton/icon-button.js';
	import '@material/web/textfield/outlined-text-field.js';
	import '@material/web/dialog/dialog.js';
	import '@material/web/progress/linear-progress.js';
	import '@material/web/icon/icon.js';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<main>{@render children()}</main>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Noto Sans JP', 'Noto Sans', sans-serif;
		background: var(--md-sys-color-surface-container, #f5f5f5);
		color: var(--md-sys-color-on-surface, #1a1a1a);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(*) {
		box-sizing: border-box;
	}
</style>
