<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'ThemeSwitch'
})

const themeStore = useThemeStore()
const { t } = useI18n()
</script>

<template>
  <div class="theme-switch">
    <vxe-button mode="text" :icon="themeStore.theme === 'light' ? 'vxe-icon-sunny' : 'vxe-icon-moon'"
      @click="themeStore.toggleTheme" :title="t('settings.theme')" />
  </div>
</template>

<style scoped>
.theme-switch {
  display: inline-flex;
  align-items: center;
}

:deep(.vxe-button) {
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s;
}

:deep(.vxe-button:hover) {
  background-color: var(--vxe-button-default-background-color-hover);
}

/* 暗色主题样式 */
:root[data-theme='dark'] {
  --vxe-button-default-background-color-hover: rgba(255, 255, 255, 0.1);
}

/* 亮色主题样式 */
:root[data-theme='light'] {
  --vxe-button-default-background-color-hover: rgba(0, 0, 0, 0.1);
}
</style>
