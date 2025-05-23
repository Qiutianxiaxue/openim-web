import type { Directive, DirectiveBinding } from 'vue'

interface InputListenerOptions {
  onKeydown?: (event: KeyboardEvent) => void
  onKeyup?: (event: KeyboardEvent) => void
  onKeypress?: (event: KeyboardEvent) => void
}

const inputListener: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<InputListenerOptions>) {
    const options = binding.value || {}

    // 键盘事件监听
    const handleKeydown = (event: KeyboardEvent) => {
      console.log('全局按键事件触发:', event.key) // 添加调试日志

      // 忽略输入框中的按键事件
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      // 调用传入的处理函数
      options.onKeydown?.(event)
    }

    const handleKeyup = (event: KeyboardEvent) => {
      // 忽略输入框中的按键事件
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }
      options.onKeyup?.(event)
    }

    const handleKeypress = (event: KeyboardEvent) => {
      // 忽略输入框中的按键事件
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }
      options.onKeypress?.(event)
    }

    // 添加全局事件监听
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keyup', handleKeyup)
    window.addEventListener('keypress', handleKeypress)

    // 保存事件处理函数引用，以便在 unmounted 中移除
    el._keydownHandler = handleKeydown
    el._keyupHandler = handleKeyup
    el._keypressHandler = handleKeypress
  },

  unmounted(el: HTMLElement) {
    // 移除全局事件监听
    if (el._keydownHandler) {
      window.removeEventListener('keydown', el._keydownHandler)
    }
    if (el._keyupHandler) {
      window.removeEventListener('keyup', el._keyupHandler)
    }
    if (el._keypressHandler) {
      window.removeEventListener('keypress', el._keypressHandler)
    }
  },
}

// 扩展 HTMLElement 类型以包含事件处理函数
declare global {
  interface HTMLElement {
    _keydownHandler?: (event: KeyboardEvent) => void
    _keyupHandler?: (event: KeyboardEvent) => void
    _keypressHandler?: (event: KeyboardEvent) => void
  }
}

export default inputListener
