<script lang="ts">
	interface Props {
		onopensettings: () => void;
	}

	let { onopensettings }: Props = $props();
</script>

<header>
	<h1>Japanese Word Sheet Parser</h1>
	<md-icon-button onclick={onopensettings}>
		<md-icon>settings</md-icon>
	</md-icon-button>
</header>

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.25rem;
		background: var(--md-sys-color-surface, #fff);
		border-bottom: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
	}
	h1 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		font-family: 'Noto Sans JP', 'Noto Sans', sans-serif;
	}
</style>
