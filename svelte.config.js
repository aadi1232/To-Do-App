import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
	kit: {
		adapter: adapter(),
		alias: {
			$lib: path.resolve(__dirname, './src/lib'),
			'$lib/*': path.resolve(__dirname, './src/lib/*'),
			$backend: path.resolve(__dirname, './src/backend'),
			'$backend/*': path.resolve(__dirname, './src/backend/*')
		}
	},
	preprocess: vitePreprocess()
};

export default config;
