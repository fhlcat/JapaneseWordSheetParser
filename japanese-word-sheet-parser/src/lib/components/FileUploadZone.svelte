<script lang="ts">
	interface Props {
		disabled: boolean;
		onselectfile: (file: File) => void;
		onremovefile: () => void;
	}

	let { disabled, onselectfile, onremovefile }: Props = $props();

	let fileInputRef = $state<HTMLInputElement | null>(null);
	let isDragging = $state(false);
	let selectedFile = $state<File | null>(null);
	let imagePreviewUrl = $state<string | null>(null);
	let validationError = $state<string | null>(null);

	const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
	const ALLOWED_EXTENSIONS = '.pdf,.png,.jpg,.jpeg,.webp';
	const MAX_FILE_SIZE = 20 * 1024 * 1024;

	function validate(file: File): string | null {
		if (!ALLOWED_TYPES.includes(file.type)) {
			return 'Unsupported file type. Please upload a PDF, PNG, JPEG, or WebP file.';
		}
		if (file.size > MAX_FILE_SIZE) {
			return 'File is too large. Maximum size is 20 MB.';
		}
		return null;
	}

	function handleFile(file: File) {
		validationError = null;
		const error = validate(file);
		if (error) {
			validationError = error;
			return;
		}
		selectedFile = file;
		if (file.type.startsWith('image/')) {
			imagePreviewUrl = URL.createObjectURL(file);
		} else {
			imagePreviewUrl = null;
		}
		onselectfile(file);
	}

	function handleInputChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) handleFile(file);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const file = e.dataTransfer?.files?.[0];
		if (file) handleFile(file);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleRemove() {
		if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
		selectedFile = null;
		imagePreviewUrl = null;
		validationError = null;
		if (fileInputRef) fileInputRef.value = '';
		onremovefile();
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}
</script>

{#if !selectedFile}
	<div
		class="drop-zone"
		class:disabled
		class:dragging={isDragging}
		role="button"
		tabindex={disabled ? -1 : 0}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		onclick={() => !disabled && fileInputRef?.click()}
		onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter' && !disabled) fileInputRef?.click(); }}
	>
		<md-icon>cloud_upload</md-icon>
		<p>Drag and drop a file here, or click to browse</p>
		<p class="hint">PDF, PNG, JPEG, WebP &mdash; Max 20 MB</p>
		<input
			bind:this={fileInputRef}
			type="file"
			accept={ALLOWED_EXTENSIONS}
			onchange={handleInputChange}
			hidden
			disabled={disabled}
		/>
	</div>
{:else}
	<div class="file-info">
		<div class="file-details">
			{#if imagePreviewUrl}
				<img src={imagePreviewUrl} alt="Preview" class="preview" />
			{:else}
				<md-icon class="file-icon">description</md-icon>
			{/if}
			<div>
				<p class="file-name">{selectedFile.name}</p>
				<p class="file-size">{formatSize(selectedFile.size)}</p>
			</div>
		</div>
		<md-outlined-button onclick={handleRemove} disabled={disabled}>Remove</md-outlined-button>
	</div>
{/if}

{#if validationError}
	<p class="error">{validationError}</p>
{/if}

<style>
	.drop-zone {
		border: 2px dashed var(--md-sys-color-outline, #ccc);
		border-radius: 12px;
		padding: 2.5rem 2rem;
		text-align: center;
		cursor: pointer;
		transition: border-color 0.2s, background 0.2s;
		font-family: 'Noto Sans JP', 'Noto Sans', sans-serif;
	}
	.drop-zone:hover, .drop-zone.dragging {
		border-color: var(--md-sys-color-primary, #1a73e8);
		background: var(--md-sys-color-primary-container, #e8f0fe);
	}
	.drop-zone.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.drop-zone p { margin: 0.5rem 0 0; color: #666; }
	.drop-zone .hint { font-size: 0.8rem; color: #999; }
	.file-info {
		border: 2px solid var(--md-sys-color-outline-variant, #e0e0e0);
		border-radius: 12px;
		padding: 1rem 1.25rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		font-family: 'Noto Sans JP', 'Noto Sans', sans-serif;
	}
	.file-details {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.preview {
		width: 60px;
		height: 60px;
		object-fit: cover;
		border-radius: 6px;
		border: 1px solid #e0e0e0;
	}
	.file-icon { font-size: 2.5rem; color: #666; }
	.file-name { margin: 0; font-weight: 500; word-break: break-all; }
	.file-size { margin: 0.25rem 0 0; font-size: 0.85rem; color: #666; }
	.error { color: #d93025; font-size: 0.85rem; margin: 0.5rem 0 0; }
</style>
