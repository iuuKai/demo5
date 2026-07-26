<template>
	<div class="p-6">
		<h1>Nuxt3 SSG 页面 | 用户列表</h1>
		<ul style="list-style: none; padding: 0">
			<li v-for="item in users" :key="item.id" style="margin: 8px 0">
				用户名：{{ item.username }} | 邮箱：{{ item.email }}
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { API_BASE, User } from '@repo/shared'
const { data } = await useFetch(`${API_BASE}/users`, { baseURL: '/' })
const users = data.value?.data as User[]
</script>
