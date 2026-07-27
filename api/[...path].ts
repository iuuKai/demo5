import express from 'express'
import Mock from 'mockjs'
import type { User } from '@repo/shared'

const app = express()
app.use(express.json())

// 兼容 Vercel api/ 目录约定下 req.url 的不同形态
// 无论 req.url 是 /users 还是 /api/users，都统一补成 /api/users
app.use((req, _res, next) => {
	if (!req.url.startsWith('/api')) {
		req.url = `/api${req.url}`
	}
	next()
})

// Mock生成10条用户数据接口
app.get('/api/users', (req, res) => {
	const list: User[] = Mock.mock({
		'list|10': [
			{
				'id|+1': 1,
				username: '@cname',
				email: '@email',
				avatar: Mock.Random.image('100x100')
			}
		]
	}).list

	res.json({
		code: 200,
		data: list
	})
})

export default app
