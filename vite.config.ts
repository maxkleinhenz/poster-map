import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { cjsInterop } from 'vite-plugin-cjs-interop';

export default defineConfig({
	plugins: [
		sveltekit(),
		cjsInterop({
			dependencies: ['maplibre-gl']
		})
	]
});
