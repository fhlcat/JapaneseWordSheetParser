<script lang="ts">
	import { hasApiKey, getApiKey, saveApiKey, deleteApiKey } from '$lib/storage.js';
	import { extractWords } from '$lib/gemini.js';
	import { generateResultsHtml } from '$lib/generateResultsHtml.js';
	import type { WordEntry, AppState, ExtractionError } from '$lib/types.js';

	import AppHeader from '$lib/components/AppHeader.svelte';
	import ApiKeyDialog from '$lib/components/ApiKeyDialog.svelte';
	import FileUploadZone from '$lib/components/FileUploadZone.svelte';
	import ProcessingOverlay from '$lib/components/ProcessingOverlay.svelte';
	import WordPreviewTable from '$lib/components/WordPreviewTable.svelte';

	let appState = $state<AppState>('idle');
	let selectedFile = $state<File | null>(null);
	let extractedWords = $state<WordEntry[]>([]);
	let extractionError = $state<ExtractionError | null>(null);
	let showApiKeyDialog = $state(!hasApiKey());
	let storedKey = $state<string | null>(getApiKey());

	function handleOpenSettings() {
		storedKey = getApiKey();
		showApiKeyDialog = true;
	}

	function handleCloseDialog() {
		showApiKeyDialog = false;
	}

	function handleSaveKey(key: string) {
		saveApiKey(key);
		storedKey = key;
		showApiKeyDialog = false;
	}

	function handleDeleteKey() {
		deleteApiKey();
		storedKey = null;
		showApiKeyDialog = false;
	}

	function handleSelectFile(file: File) {
		selectedFile = file;
		appState = 'file-selected';
		extractionError = null;
	}

	function handleRemoveFile() {
		selectedFile = null;
		appState = 'idle';
		extractionError = null;
	}

	async function handleExtract() {
		if (!selectedFile) return;
		const key = getApiKey();
		if (!key) {
			showApiKeyDialog = true;
			return;
		}

		appState = 'extracting';
		extractionError = null;

		try {
			const words = await extractWords(selectedFile, key);
			extractedWords = words;
			appState = 'success';
		} catch (e) {
			extractionError = e as ExtractionError;
			appState = 'error';
		}
	}

	function handleOpenResults() {
		if (!selectedFile) return;
		const html = generateResultsHtml(extractedWords, selectedFile.name);
		const blob = new Blob([html], { type: 'text/html' });
		const url = URL.createObjectURL(blob);
		window.open(url, '_blank');
		setTimeout(() => URL.revokeObjectURL(url), 60000);
	}

	function handleReset() {
		selectedFile = null;
		extractedWords = [];
		extractionError = null;
		appState = 'idle';
	}
</script>

<AppHeader onopensettings={handleOpenSettings} />

<ApiKeyDialog
	open={showApiKeyDialog}
	existingKey={storedKey}
	onsave={handleSaveKey}
	ondelete={handleDeleteKey}
	onclose={handleCloseDialog}
/>

<div class="page-content">
	<FileUploadZone
		disabled={appState === 'extracting'}
		onselectfile={handleSelectFile}
		onremovefile={handleRemoveFile}
	/>

	{#if appState !== 'extracting' && appState !== 'success' && appState !== 'error'}
		<div class="extract-action">
			<md-filled-button
				disabled={appState !== 'file-selected'}
				onclick={handleExtract}
			>
				Extract Words
			</md-filled-button>
			{#if appState === 'idle'}
				<p class="hint">Upload a file and click to extract</p>
			{/if}
			{#if !storedKey && appState === 'file-selected'}
				<p class="hint">Set your API key in settings first</p>
			{/if}
		</div>
	{/if}

	<ProcessingOverlay visible={appState === 'extracting'} />

	{#if appState === 'success'}
		<WordPreviewTable
			words={extractedWords}
			onopenresults={handleOpenResults}
			onreset={handleReset}
		/>
	{/if}

	{#if appState === 'error' && extractionError}
		<div class="error-card">
			<md-icon>error</md-icon>
			<div>
				<p class="error-title">Extraction Failed</p>
				<p class="error-message">{extractionError.message}</p>
			</div>
			<div class="error-actions">
				<md-outlined-button onclick={handleExtract}>Try Again</md-outlined-button>
				<md-text-button onclick={handleReset}>Cancel</md-text-button>
			</div>
		</div>
	{/if}
</div>

<style>
	.page-content {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1.25rem;
	}
	.extract-action {
		margin-top: 1.5rem;
		text-align: center;
	}
	.hint {
		font-size: 0.85rem;
		color: #999;
		margin: 0.5rem 0 0;
	}
	.error-card {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		margin-top: 1.5rem;
		padding: 1.25rem;
		background: var(--md-sys-color-error-container, #fce8e6);
		border-radius: 8px;
		font-family: 'Noto Sans JP', 'Noto Sans', sans-serif;
	}
	.error-title {
		font-weight: 600;
		margin: 0;
	}
	.error-message {
		margin: 0.25rem 0 0;
		font-size: 0.85rem;
		color: #666;
	}
	.error-actions {
		margin-left: auto;
		display: flex;
		gap: 0.5rem;
	}
</style>
