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
				// Precache all client-side assets
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
				// SSR app — no single fallback page; unvisited routes stay server-rendered
				navigateFallback: null,
				runtimeCaching: [
					{
						// Pages: try network first, fall back to cache after 5s
						// This means songs viewed while online are available offline
						urlPattern: ({ request }) => request.mode === 'navigate',
						handler: 'NetworkFirst',
						options: {
							cacheName: 'pages',
							networkTimeoutSeconds: 5,
							cacheableResponse: { statuses: [200] }
						}
					},
					{
						// Static assets: serve from cache, refresh in background
						urlPattern: /\.(?:js|css|woff2?|png|svg|ico)$/,
						handler: 'StaleWhileRevalidate',
						options: {
							cacheName: 'assets',
							expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }
						}
					}
				]
			}
		})
	]
});
