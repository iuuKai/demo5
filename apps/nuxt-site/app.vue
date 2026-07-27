<template>
	<div class="p-6">
		<h1>Nuxt3 SSG 页面 | 用户列表</h1>
		<p v-if="users.length === 0">加载中...</p>
		<ul v-else style="list-style: none; padding: 0">
			<li v-for="item in users" :key="item.id" style="margin: 8px 0">
				用户名：{{ item.username }} | 邮箱：{{ item.email }}
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { API_BASE, User } from '@repo/shared'
// server: false 避免 SSG 构建时请求后端失败导致 payload 为空
// 客户端 hydration 时直接请求 /api/users（Vercel Function 处理）
const { data } = await useFetch(`${API_BASE}/users`, { baseURL: '/', server: false })
const users = computed(() => (data.value?.data as User[]) ?? [])
</script>
