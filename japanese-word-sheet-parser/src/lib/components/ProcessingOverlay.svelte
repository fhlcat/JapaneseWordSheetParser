<script lang="ts">
	interface Props {
		visible: boolean;
	}

	let { visible }: Props = $props();

	const messages = ['Sending to Gemini...', 'Processing image...', 'Extracting words...', 'Generating results...'];
	let messageIndex = $state(0);
	let timer: ReturnType<typeof setInterval> | null = null;

	$effect(() => {
		if (visible) {
			messageIndex = 0;
			timer = setInterval(() => {
				messageIndex = (messageIndex + 1) % messages.length;
			}, 2000);
		} else {
			if (timer) {
				clearInterval(timer);
				timer = null;
			}
		}

		return () => {
			if (timer) {
				clearInterval(timer);
				timer = null;
			}
		};
	});
</script>

{#if visible}
	<div class="overlay">
		<div class="content">
			<md-linear-progress indeterminate></md-linear-progress>
			<p class="status">{messages[messageIndex]}</p>
		</div>
	</div>
{/if}

<style>
	.overlay {
		margin-top: 1.5rem;
	}
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
	}
	.status {
		font-size: 0.9rem;
		color: #666;
		margin: 0;
		font-family: 'Noto Sans JP', 'Noto Sans', sans-serif;
	}
</style>
