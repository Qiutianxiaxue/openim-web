import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'
import relativeTime from 'dayjs/plugin/relativeTime'
import calendar from 'dayjs/plugin/calendar'
import duration from 'dayjs/plugin/duration'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// 扩展插件
dayjs.extend(relativeTime)
dayjs.extend(calendar)
dayjs.extend(duration)
dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

// 设置默认时区
dayjs.tz.setDefault('Asia/Shanghai')

export default dayjs
