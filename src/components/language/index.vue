<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { ref } from 'vue'
import VxeUI from 'vxe-pc-ui'
defineOptions({
  name: 'LanguageSelector'
})

const settingsStore = useSettingsStore()
const language = ref(settingsStore.language)

function handleLanguageChange() {
  settingsStore.setLanguage(language.value)
  VxeUI.setLanguage(language.value)
}
</script>

<template>
  <select v-model="language" @change="handleLanguageChange">
    <option value="zh-CN">中文</option>
    <option value="en-US">English</option>
  </select>
</template>
