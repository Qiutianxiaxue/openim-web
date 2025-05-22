<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { ref, computed } from 'vue'
import type { LanguageOption, LanguageOptions, Language } from '@/types/language'
import VxeUI, { type VxePulldownEvents } from 'vxe-pc-ui'

defineOptions({
  name: 'LanguageSelector'
})

const settingsStore = useSettingsStore()

const availableLanguages = ref<LanguageOptions>([
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' }
])

const currentLanguage = computed(() => {
  return availableLanguages.value.find(lang => lang.value === settingsStore.language)?.label || '中文'
})

const handleLanguageChange: VxePulldownEvents.OptionClick = ({ option }) => {
  const lang = option as LanguageOption
  settingsStore.setLanguage(lang.value as Language)
  VxeUI.setLanguage(lang.value as Language)
}
</script>

<template>
  <vxe-pulldown :options="availableLanguages" trigger="click" @option-click="handleLanguageChange">
    <template #default>
      <vxe-button mode="text" icon="vxe-icon-language-switch">
        {{ currentLanguage }}
      </vxe-button>
    </template>
  </vxe-pulldown>
</template>
<style lang="scss"></style>