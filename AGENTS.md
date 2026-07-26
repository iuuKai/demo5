## 一、AI角色与总任务

你是资深前端全栈架构师，严格按照本文档所有约束、目录、代码内容，从零完整搭建一套固定架构 Monorepo 项目。

**执行规则：**

1. 必须严格逐段落依次构建，每创建完一类文件就自检语法、依赖引用；

2. 所有 TS 代码开启严格类型校验，前后端类型完全复用；

3. 禁止擅自修改技术栈、目录结构、Vercel 路由规则；

4. 全部文件创建完毕后，输出：本地启动命令、打包命令、线上访问地址清单、部署校验结果；

5. 遇到报错自动修复，修复完毕重新自检。

## 二、项目整体约束 \& 技术栈

### 核心架构约束（硬性不可更改）

1. 包管理器：pnpm workspace

2. 构建调度：Turbo 2\.x

3. 部署载体：单个 Vercel 项目 \+ 唯一免费二级域名

4. 运行时限制：仅允许1套 Express Node 服务端运行时（接口），其余全部静态产物（SSG/SPA），无任何额外SSR服务

5. 路由分发：通过 vercel\.json rewrites 路径转发，不搭建外部网关、不拆分多个Vercel项目

6. 代码复用：packages/shared 存放前后端共用TS类型、常量、基础配置

### 子项目清单（固定3个应用）

1. **apps/api**：Express \+ MockJS 后端接口服务，提供用户列表接口 `/api/users`

2. **apps/nuxt\-site**：Nuxt3 SSG 静态站点，请求接口渲染用户列表，访问路径 `/nuxt`

3. **apps/vue\-spa**：Vite\+Vue3 TS SPA项目，请求接口渲染用户列表，默认首页 `/`

### 全局访问路由映射（固定）

|访问路径|对应资源|
|---|---|
|域名/|vue\-spa 静态首页|
|域名/vue|vue\-spa 页面|
|域名/nuxt|nuxt3 SSG 页面|
|域名/api/users|Express 后端用户接口|

## 三、完整目录树（必须1:1复刻）

```Plain Text
project-root/
├── packages/
│   └── shared/                # 前后端公共代码包
│       ├── package.json
│       └── src/
│           ├── types.ts       # User 通用TS类型
│           ├── request.ts     # 接口基础路径常量
│           └── index.ts       # 统一导出入口
├── apps/
│   ├── api/                   # Express Mock 后端服务
│   │   ├── package.json
│   │   └── src/index.ts
│   ├── nuxt-site/             # Nuxt3 SSG 项目
│   │   ├── package.json
│   │   ├── nuxt.config.ts
│   │   └── app.vue
│   └── vue-spa/               # Vite Vue3 TS SPA
│       ├── index.html
│       ├── vite.config.ts
│       ├── package.json
│       └── src/
│           ├── main.ts
│           └── App.vue
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
├── vercel.json
└── .gitignore
```

## 四、分步构建执行清单

### 步骤1：创建根目录全局配置文件

#### 1\.1 pnpm\-workspace\.yaml

```Plain Text
packages:
  - "apps/*"
  - "packages/*"
```

#### 1\.2 根目录 package\.json

```Plain Text
{
  "name": "monorepo-root",
  "private": true,
  "packageManager": "pnpm@9.10.0",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.3.3"
  }
}
```

#### 1\.3 turbo\.json（Turbo任务流水线配置）

```Plain Text
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "outputs": ["dist/**", ".output/**"],
      "cache": true
    },
    "dev": {
      "persistent": true,
      "cache": false
    },
    "lint": {
      "cache": true
    }
  }
}
```

#### 1\.4 vercel\.json（线上路由\&构建核心）

```Plain Text
{
  "build": {
    "cmd": "pnpm turbo run build",
    "outputDirectory": "."
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/apps/api/src/index.ts"
    },
    {
      "source": "/nuxt/:path*",
      "destination": "/apps/nuxt-site/.output/public/:path*"
    },
    {
      "source": "/vue/:path*",
      "destination": "/apps/vue-spa/dist/:path*"
    },
    {
      "source": "/",
      "destination": "/apps/vue-spa/dist/index.html"
    }
  ]
}
```

#### 1\.5 \.gitignore

```Plain Text
node_modules
.turbo
dist
.nuxt
.output
.env
*.log
.DS_Store
```

### 步骤2：搭建公共包 packages/shared（前后端共用）

#### 2\.1 packages/shared/package\.json

```Plain Text
{
  "name": "@repo/shared",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

#### 2\.2 packages/shared/src/types\.ts

```Plain Text
export interface User {
  id: number
  username: string
  email: string
  avatar: string
}
```

#### 2\.3 packages/shared/src/request\.ts

```Plain Text
// 全局接口基础路径，前后端统一
export const API_BASE = "/api"
```

#### 2\.4 packages/shared/src/index\.ts

```Plain Text
export * from "./types"
export * from "./request"
```

### 步骤3：搭建后端 apps/api（Express\+MockJS）

#### 3\.1 apps/api/package\.json

```Plain Text
{
  "name": "@repo/api",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "lint": "eslint ."
  },
  "dependencies": {
    "express": "^4.21.1",
    "mockjs": "^1.1.0",
    "@repo/shared": "workspace:*"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/mockjs": "^1.0.10",
    "@types/node": "^22.7.5",
    "tsx": "^4.19.1",
    "typescript": "^5.6.3"
  }
}
```

#### 3\.2 apps/api/src/index\.ts

```Plain Text
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

// Vercel Serverless Node必须导出app实例
export default app
```

### 步骤4：搭建 Nuxt3 SSG 项目 apps/nuxt\-site

#### 4\.1 apps/nuxt\-site/package\.json

```Plain Text
{
  "name": "@repo/nuxt-site",
  "private": true,
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt generate",
    "lint": "nuxt lint"
  },
  "dependencies": {
    "@repo/shared": "workspace:*"
  },
  "devDependencies": {
    "nuxt": "^3.13.0"
  }
}
```

#### 4\.2 apps/nuxt\-site/nuxt\.config\.ts

```Plain Text
export default defineNuxtConfig({
  app: {
    baseURL: "/nuxt/"
  },
  ssr: true,
  nitro: {
    preset: "static"
  }
})
```

#### 4\.3 apps/nuxt\-site/app\.vue

```Plain Text
<template>
  <div class="p-6">
    <h1>Nuxt3 SSG 页面 | 用户列表</h1>
    <ul style="list-style: none; padding: 0;">
      <li v-for="item in users" :key="item.id" style="margin:8px 0;">
        用户名：{{ item.username }} | 邮箱：{{ item.email }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { API_BASE, User } from "@repo/shared"
const { data } = await useFetch(`${API_BASE}/users`)
const users = data.value?.data as User[]
</script>
```

### 步骤5：搭建 Vite Vue3 SPA 项目 apps/vue\-spa

#### 5\.1 apps/vue\-spa/package\.json

```Plain Text
{
  "name": "@repo/vue-spa",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "lint": "eslint ."
  },
  "dependencies": {
    "vue": "^3.5.8",
    "axios": "^1.7.7",
    "@repo/shared": "workspace:*"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.1.4",
    "typescript": "^5.6.3",
    "vite": "^5.4.8",
    "vue-tsc": "^2.1.6"
  }
}
```

#### 5\.2 apps/vue\-spa/vite\.config\.ts

```Plain Text
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
  plugins: [vue()],
  base: "/vue/"
})
```

#### 5\.3 apps/vue\-spa/index\.html

```Plain Text
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>Vue3 SPA 首页</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

#### 5\.4 apps/vue\-spa/src/main\.ts

```Plain Text
import { createApp } from "vue"
import App from "./App.vue"
createApp(App).mount("#app")
```

#### 5\.5 apps/vue\-spa/src/App\.vue

```Plain Text
<template>
  <div class="p-6">
    <h1>Vue3 SPA 首页 | 用户列表</h1>
    <ul style="list-style: none; padding: 0;">
      <li v-for="u in userList" :key="u.id" style="margin:8px 0;">
        用户名：{{ u.username }} | 邮箱：{{ u.email }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import axios from "axios"
import { API_BASE, User } from "@repo/shared"

const userList = ref<User[]>([])

onMounted(async () => {
  const res = await axios.get(`${API_BASE}/users`)
  userList.value = res.data.data
})
</script>
```

### 步骤6：本地环境校验规则（AI搭建完毕必须自检）

1. 执行安装依赖：`pnpm install` 无报错

2. 执行开发启动：`pnpm dev` 可同时拉起后端、Nuxt、Vue三个服务

3. 执行整体打包：`pnpm build` 全部项目打包产物生成正常

    - vue\-spa：apps/vue\-spa/dist

    - nuxt\-site：apps/nuxt\-site/\.output/public

    - api：TS编译完成

4. 接口访问：本地请求 `/api/users` 可正常返回Mock用户数据

5. 前端页面均可拉取接口数据渲染列表

### 步骤7：Vercel线上部署配置说明

1. Vercel新建项目关联代码仓库

2. 构建设置：
        

    - Framework Preset：Other

    - Install Command：`pnpm install`

    - Build Command：留空（vercel\.json接管构建）

3. 部署完成访问地址清单：
        

    - 首页：xxx\.vercel\.app

    - Vue页面：xxx\.vercel\.app/vue

    - Nuxt页面：xxx\.vercel\.app/nuxt

    - 接口：xxx\.vercel\.app/api/users

## 五、禁止修改条款（AI必须遵守）

1. 不得新增/删减任何子项目；

2. 不得修改vercel\.json路由rewrites规则；

3. 不得拆分多个Vercel项目、不得添加反向代理网关；

4. 所有前后端类型必须统一复用 @repo/shared，禁止重复定义；

5. 只能保留唯一一套Express Node运行时，无其他SSR服务。

