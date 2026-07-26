export default defineNuxtConfig({
	app: {
		baseURL: '/nuxt/'
	},
	ssr: true,
	nitro: {
		preset: 'static'
	},
	routeRules: {
		'/api/**': {
			proxy: 'http://localhost:3001/api/**'
		}
	}
})
