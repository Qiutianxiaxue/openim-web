export function formatChatTime(timeStr: string): string {
  const date = new Date(timeStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  // 小于1小时
  if (diffMinutes < 60) {
    return diffMinutes <= 0 ? '刚刚' : `${diffMinutes}分钟前`
  }

  // 判断是否为今天
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  const pad = (n: number) => n.toString().padStart(2, '0')
  const timeStrSimple = `${pad(date.getHours())}:${pad(date.getMinutes())}`

  if (isToday) {
    return timeStrSimple
  }

  // 今天之前
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${timeStrSimple}`
}
