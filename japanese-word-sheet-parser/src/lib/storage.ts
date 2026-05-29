const STORAGE_KEY = 'gemini-api-key';

export function getApiKey(): string | null {
	if (typeof localStorage === 'undefined') return null;
	return localStorage.getItem(STORAGE_KEY);
}

export function saveApiKey(key: string): void {
	localStorage.setItem(STORAGE_KEY, key.trim());
}

export function deleteApiKey(): void {
	localStorage.removeItem(STORAGE_KEY);
}

export function hasApiKey(): boolean {
	const key = getApiKey();
	return key !== null && key.length > 0;
}
