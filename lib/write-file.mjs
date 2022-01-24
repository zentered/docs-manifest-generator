import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export default function writeFile(root, path, content) {
  const parts = path.split('/')
  const file = parts.pop()
  const outPath = join(root, parts.join('/'))
  const outFile = join(outPath, file)
  try {
    if (!existsSync(outPath)) {
      mkdirSync(outPath, { recursive: true })
    } else {
      if (typeof content === 'object') {
        writeFileSync(outFile, JSON.stringify(content, null, 2))
      } else {
        writeFileSync(outFile, content)
      }
    }
  } catch (err) {
    console.log(err)
  }
}
