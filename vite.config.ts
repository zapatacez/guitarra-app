import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			// We already have static/manifest.webmanifest — don't generate another
			manifest: false,
			workbox: {
				// Precache all client-side assets (JS bundles, CSS, icons)
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
				navigateFallback: null,
				runtimeCaching: [
					{
						// Hashed SvelteKit bundles — immutable, cache forever
						urlPattern: /\/_app\/immutable\//,
						handler: 'CacheFirst',
						options: {
							cacheName: 'immutable',
							expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 }
						}
					},
					{
						// All same-origin GET requests: full pages AND SvelteKit's
						// client-side data fetches (/__data.json). StaleWhileRevalidate
						// means instant response from cache + background refresh when online,
						// and instant cache-only response when offline.
						urlPattern: ({ url, sameOrigin, request }) =>
							sameOrigin && request.method === 'GET',
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'app',
							cacheableResponse: { statuses: [200] }
						}
					}
				]
			}
		})
	]
});
