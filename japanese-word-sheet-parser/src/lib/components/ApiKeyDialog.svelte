<script lang="ts">
	interface Props {
		open: boolean;
		existingKey: string | null;
		onsave: (key: string) => void;
		ondelete: () => void;
		onclose: () => void;
	}

	let { open, existingKey, onsave, ondelete, onclose }: Props = $props();

	let keyInput = $state('');

	function handleSave() {
		const trimmed = keyInput.trim();
		if (trimmed) {
			onsave(trimmed);
			keyInput = '';
		}
	}

	function handleDelete() {
		keyInput = '';
		ondelete();
	}

	function handleInput(e: Event) {
		keyInput = (e.target as HTMLInputElement).value;
	}
</script>

<md-dialog open={open} onclose={onclose}>
	<div slot="headline">Gemini API Key</div>
	<div slot="content">
		<div style="display: flex; flex-direction: column; gap: 1rem; min-width: 320px;">
			<md-outlined-text-field
				label="API Key"
				type="password"
				value={keyInput}
				oninput={handleInput}
			></md-outlined-text-field>

			{#if existingKey}
				<p style="font-size: 0.85rem; color: #666; margin: 0;">
					An API key is currently stored.
				</p>
			{/if}

			<p style="font-size: 0.8rem; color: #999; margin: 0;">
				Your API key is stored only in this browser's local storage and is sent only to Google's Gemini API.
				Get a key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>.
			</p>
		</div>
	</div>
	<div slot="actions">
		<md-text-button onclick={onclose}>Cancel</md-text-button>
		{#if existingKey}
			<md-outlined-button onclick={handleDelete}>Remove Key</md-outlined-button>
		{/if}
		<md-filled-button onclick={handleSave} disabled={!keyInput.trim()}>Save</md-filled-button>
	</div>
</md-dialog>
