import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter()
	},
	onwarn: (warning, handler) => {
		// MWC custom elements are proper interactive elements; Svelte's analyzer doesn't know them
		if (warning.code.startsWith('a11y_')) return;
		handler(warning);
	}
};

export default config;
