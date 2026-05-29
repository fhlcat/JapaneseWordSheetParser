import type { WordEntry, ExtractionError } from '$lib/types.js';

const EXTRACTION_PROMPT = `You are a Japanese language document parser. Analyze the provided image or PDF and extract ALL Japanese words and phrases visible in the document.

For each Japanese word or phrase found, provide:
- "word": the word/phrase exactly as written (kanji, kana, or mixed)
- "reading": the hiragana reading of the word
- "meaning": the English meaning/translation
- "partOfSpeech": the grammatical part of speech (noun, verb, adjective, etc.). Use "phrase" for multi-word expressions.

Return ONLY a JSON object with this exact structure:
{
  "words": [
    {
      "word": "...",
      "reading": "...",
      "meaning": "...",
      "partOfSpeech": "..."
    }
  ]
}

Important rules:
1. Extract EVERY Japanese word/phrase visible -- do not skip any.
2. If you cannot determine the reading for a word, provide your best guess.
3. If a word appears multiple times, include it only once.
4. Preserve the exact written form of each word.
5. For words written in kana only, the "word" and "reading" fields will be identical.

If no Japanese text is found in the document, return: { "words": [] }`;

const ALLOWED_TYPES = [
	'application/pdf',
	'image/png',
	'image/jpeg',
	'image/webp'
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function validateFile(file: File): ExtractionError | null {
	if (!ALLOWED_TYPES.includes(file.type)) {
		return {
			code: 'INVALID_FILE_TYPE',
			message: 'Unsupported file type. Please upload a PDF, PNG, JPEG, or WebP file.'
		};
	}
	if (file.size > MAX_FILE_SIZE) {
		return {
			code: 'FILE_TOO_LARGE',
			message: 'File is too large. Maximum size is 20 MB.'
		};
	}
	return null;
}

async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
	const buffer = await file.arrayBuffer();
	const bytes = new Uint8Array(buffer);
	const chunkSize = 8192;
	let binary = '';
	for (let i = 0; i < bytes.length; i += chunkSize) {
		const chunk = bytes.subarray(i, i + chunkSize);
		binary += String.fromCharCode(...chunk);
	}
	return { base64: btoa(binary), mimeType: file.type };
}

function parseGeminiResponse(text: string): WordEntry[] {
	try {
		const parsed = JSON.parse(text);
		if (parsed && Array.isArray(parsed.words)) {
			return parsed.words.filter(
				(w: unknown) =>
					typeof w === 'object' &&
					w !== null &&
					typeof (w as WordEntry).word === 'string' &&
					typeof (w as WordEntry).reading === 'string' &&
					typeof (w as WordEntry).meaning === 'string'
			);
		}
	} catch {
		// Fall through to regex extraction
	}

	// Regex fallback: try to find a JSON block
	const jsonMatch = text.match(/\{[\s\S]*"words"[\s\S]*\}/);
	if (jsonMatch) {
		try {
			const parsed = JSON.parse(jsonMatch[0]);
			if (parsed && Array.isArray(parsed.words)) {
				return parsed.words.filter(
					(w: unknown) =>
						typeof w === 'object' &&
						w !== null &&
						typeof (w as WordEntry).word === 'string'
				);
			}
		} catch {
			// Could not parse
		}
	}

	throw {
		code: 'JSON_PARSE_ERROR',
		message: 'Could not parse the extraction results. The AI response was not in the expected format.'
	} satisfies ExtractionError;
}

function mapApiError(status: number, message: string): ExtractionError {
	switch (status) {
		case 403:
			return { code: 'INVALID_API_KEY', message: 'Invalid API key. Please check your key and try again.' };
		case 429:
			return { code: 'RATE_LIMITED', message: 'Rate limit exceeded. Please wait a moment and try again.' };
		default:
			return { code: 'API_ERROR', message: `Gemini API error: ${message}` };
	}
}

export async function extractWords(file: File, apiKey: string): Promise<WordEntry[]> {
	const validationError = validateFile(file);
	if (validationError) throw validationError;

	let base64Data: string;
	let mimeType: string;
	try {
		const result = await fileToBase64(file);
		base64Data = result.base64;
		mimeType = result.mimeType;
	} catch {
		throw {
			code: 'FILE_READ_ERROR',
			message: 'Could not read the file. The file may be corrupted.'
		} satisfies ExtractionError;
	}

	try {
		const response = await fetch(
			`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					contents: [
						{
							parts: [
								{ inlineData: { mimeType, data: base64Data } },
								{ text: EXTRACTION_PROMPT }
							]
						}
					],
					generationConfig: {
						temperature: 0.1,
						maxOutputTokens: 8192,
						responseMimeType: 'application/json'
					}
				})
			}
		);

		if (!response.ok) {
			const errorBody = await response.text().catch(() => '');
			throw mapApiError(response.status, errorBody);
		}

		const data = await response.json();
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

		if (!text) {
			throw {
				code: 'EMPTY_RESPONSE',
				message: 'Gemini returned an empty response. Please try again.'
			} satisfies ExtractionError;
		}

		return parseGeminiResponse(text);
	} catch (e) {
		if (e && typeof e === 'object' && 'code' in e && 'message' in e) {
			throw e; // Already a structured ExtractionError
		}
		if (e instanceof TypeError && e.message === 'Failed to fetch') {
			throw {
				code: 'NETWORK_ERROR',
				message: 'Network error. Please check your internet connection and try again.'
			} satisfies ExtractionError;
		}
		throw {
			code: 'UNKNOWN_ERROR',
			message: e instanceof Error ? e.message : 'An unknown error occurred.'
		} satisfies ExtractionError;
	}
}
