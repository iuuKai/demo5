import express from "express"
import Mock from "mockjs"
import { User } from "@repo/shared"

const app = express()
app.use(express.json())

// Mock生成10条用户数据接口
app.get("/api/users", (req, res) => {
  const list: User[] = Mock.mock({
    "list|10": [
      {
        "id|+1": 1,
        username: "@cname",
        email: "@email",
        avatar: Mock.Random.image("100x100")
      }
    ]
  }).list

  res.json({
    code: 200,
    data: list
  })
})

// 本地开发启动；Vercel Serverless 环境不执行 listen，仅导出 app 实例
if (process.env.NODE_ENV !== "production") {
  const port = Number(process.env.PORT) || 3001
  app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}/api/users`)
  })
}

// Vercel Serverless Node必须导出app实例
export default app
