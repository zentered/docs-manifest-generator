import { resolve } from 'path'
import lodash from 'lodash'

import writeFile from './lib/write-file.mjs'
import removeNull from './lib/remove-null.mjs'
import readMarkdownFiles from './lib/read-markdown-files.mjs'

const options = {
  docsFolder: '/docs',
  prettier: {
    parser: 'markdown',
    printWidth: 80,
    semi: false,
    proseWrap: 'always'
  }
}
const [docsFolder, outPath] = process.argv.slice(2)
const folderPath = resolve(process.cwd(), docsFolder)
const writeFolder = resolve(process.cwd(), outPath)

const { docs, substitutions } = readMarkdownFiles(folderPath, options)

/*
 * Loop through documents obj-array
 * Folders are substituted with the weight from the containing _index.md
 * Build lodash paths from "weight", ie. routes.10.routes.20
 */
const manifest = {}
for (const key in docs) {
  const doc = docs[key]
  const parts = doc.relativePath.split('/').slice(0, -1)
  const path = []
  for (let i = parts.length; i >= 0; i--) {
    const part = parts.slice(0, i).join('/')
    if (substitutions[part]) {
      path.push(substitutions[part])
      path.push('routes')
    }
  }
  path.unshift(doc.weight, 'routes')
  const setPath = path.reverse()
  if (doc.name === '_index.md') {
    if (doc.isSingleFile === true) {
      const newPath = doc.relativePath.split('/').slice(0, -1).join('/')
      writeFile(writeFolder, newPath + '.md', doc.pretty)
      lodash.set(manifest, setPath.slice(0, -2), {
        title: doc.fm.linkTitle ? doc.fm.linkTitle : doc.fm.title,
        path: `${options.docsFolder}/${newPath}.md`
      })
    } else {
      lodash.set(manifest, setPath.slice(0, -2), {
        title: doc.fm.linkTitle ? doc.fm.linkTitle : doc.fm.title
      })
      if (doc.pretty?.length > 0) {
        writeFile(
          writeFolder,
          doc.relativePath.replace('_index.md', 'README.md'),
          doc.pretty
        )
        setPath.pop()
        setPath.push(0)
        lodash.set(manifest, setPath, {
          title: 'Introduction',
          path: `${options.docsFolder}/${doc.relativePath.replace(
            '_index.md',
            'README.md'
          )}`
        })
      }
    }
  } else {
    writeFile(writeFolder, doc.relativePath, doc.pretty)
    lodash.set(manifest, setPath, {
      title: doc.fm.linkTitle ? doc.fm.linkTitle : doc.fm.title,
      path: `${options.docsFolder}/${doc.relativePath}`
    })
  }
}

const cleanManifest = removeNull(manifest)
writeFile(writeFolder, 'manifest.json', cleanManifest)
