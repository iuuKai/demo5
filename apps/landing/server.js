const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')

const app = express()
const port = Number(process.env.PORT) || 8080

app.use('/', express.static(__dirname))

app.use(
	'/api',
	createProxyMiddleware({
		target: 'http://localhost:3001',
		changeOrigin: true,
		pathRewrite: { '^/': '/api/' }
	})
)

app.use(
	'/nuxt',
	createProxyMiddleware({
		target: 'http://localhost:3000',
		changeOrigin: true,
		ws: true,
		pathRewrite: { '^/': '/nuxt/' }
	})
)

app.use(
	'/vue',
	createProxyMiddleware({
		target: 'http://localhost:5173',
		changeOrigin: true,
		ws: true,
		pathRewrite: { '^/': '/vue/' }
	})
)

app.listen(port, () => {
	console.log(`Landing server running at http://localhost:${port}`)
	console.log(`  - 首页:   http://localhost:${port}/`)
	console.log(`  - Vue:    http://localhost:${port}/vue/`)
	console.log(`  - Nuxt:   http://localhost:${port}/nuxt/`)
	console.log(`  - API:    http://localhost:${port}/api/users`)
})
