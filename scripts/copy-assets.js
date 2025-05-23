import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 复制字体文件
const copyFonts = async () => {
  const fontsDir = path.resolve(__dirname, '../dist/assets/font')
  const srcFontsDir = path.resolve(__dirname, '../src/assets/font')

  // 确保目标目录存在
  await fs.ensureDir(fontsDir)

  // 复制字体文件
  await fs.copy(srcFontsDir, fontsDir)
  console.log('Fonts copied successfully')
}

// 执行复制
copyFonts().catch((err) => {
  console.error('Error copying fonts:', err)
  process.exit(1)
})
