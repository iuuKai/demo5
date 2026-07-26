import express from 'express'
import Mock from 'mockjs'
import type { User } from '@repo/shared'

const app = express()
app.use(express.json())

// Mock生成10条用户数据接口
app.get('/users', (req, res) => {
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
