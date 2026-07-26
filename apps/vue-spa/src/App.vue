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
