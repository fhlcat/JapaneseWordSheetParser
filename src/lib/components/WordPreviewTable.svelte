<script lang="ts">
	import type { WordEntry } from '$lib/types.js';

	interface Props {
		words: WordEntry[];
		onopenresults: () => void;
		onreset: () => void;
	}

	let { words, onopenresults, onreset }: Props = $props();
</script>

<div class="results">
	<p class="summary">Found {words.length} word{words.length !== 1 ? 's' : ''}</p>

	<div class="table-wrapper">
		<table>
			<thead>
				<tr>
					<th>#</th>
					<th>Word</th>
					<th>Reading</th>
					<th>Meaning</th>
					<th>Part of Speech</th>
				</tr>
			</thead>
			<tbody>
				{#each words as word, i}
					<tr>
						<td class="num">{i + 1}</td>
						<td lang="ja">{word.word}</td>
						<td lang="ja">{word.reading}</td>
						<td>{word.meaning}</td>
						<td>{word.partOfSpeech}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="actions">
		<md-filled-button onclick={onopenresults}>Open Full Results Page</md-filled-button>
		<md-outlined-button onclick={onreset}>Extract Another File</md-outlined-button>
	</div>
</div>

<style>
	.results {
		margin-top: 1.5rem;
		font-family: 'Noto Sans JP', 'Noto Sans', sans-serif;
	}
	.summary {
		font-weight: 600;
		font-size: 1.05rem;
		margin-bottom: 0.75rem;
	}
	.table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--md-sys-color-outline-variant, #e0e0e0);
		border-radius: 8px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		background: var(--md-sys-color-surface, #fff);
	}
	thead {
		background: var(--md-sys-color-primary, #1a73e8);
		color: #fff;
	}
	th, td {
		padding: 0.6rem 0.75rem;
		text-align: left;
		font-size: 0.9rem;
	}
	th {
		font-weight: 600;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	tbody tr:nth-child(even) {
		background: var(--md-sys-color-surface-container-low, #f8f9fa);
	}
	tbody tr:hover {
		background: var(--md-sys-color-primary-container, #e8f0fe);
	}
	td.num {
		color: #999;
		font-size: 0.8rem;
		width: 2.5rem;
	}
	.actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 1.25rem;
		flex-wrap: wrap;
	}
</style>
