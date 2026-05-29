export interface WordEntry {
	word: string;
	reading: string;
	meaning: string;
	partOfSpeech: string;
}

export type AppState = 'idle' | 'file-selected' | 'extracting' | 'success' | 'error';

export interface ExtractionError {
	code: string;
	message: string;
}
