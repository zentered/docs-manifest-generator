import matter from 'gray-matter'
import prettier from 'prettier'
import { readFileSync } from 'fs'
import dree from 'dree'
import strip from 'remove-markdown'

const substitutions = {}
const docs = {}

export default function readMarkdownFiles(folderPath, options) {
  // build tree from original docs folder
  const tree = dree.scan(folderPath, {
    normalize: true,
    followLinks: false,
    size: false,
    hash: true,
    stat: false,
    depth: 5,
    extensions: ['md']
  })

  traverse(tree, options)

  return {
    docs,
    substitutions
  }
}

function traverse(node, options) {
  if (
    node &&
    node.type === 'directory' &&
    node.children &&
    node.children.length > 0
  ) {
    node.children.forEach((item, idx) => {
      if (item.extension === 'md') {
        item.raw = readFileSync(item.path, 'utf8')
        const { data, content } = matter(item.raw)
        const formatted = prettier.format(content, {
          parser: 'markdown',
          proseWrap: 'never'
        })
        const excerpt = strip(formatted.split('\n\n', 1)[0])
        item.fm = data
        item.md = formatted
        const newFrontMatter = {
          title: data.title,
          description: data.description ? data.description : excerpt
        }
        item.pretty = prettier.format(
          matter.stringify(formatted, newFrontMatter),
          options.prettier
        )
        item.parentHash = node.hash
        item.weight = item.fm.weight || idx
        if (
          node.children &&
          node.children.length === 1 &&
          node.children[0].name === '_index.md'
        ) {
          item.isSingleFile = true
        }
        if (item.name === '_index.md') {
          const relPath = item.relativePath.split('/')
          relPath.pop()
          substitutions[relPath.join('/')] = item.fm.weight || idx
        }
        docs[item.relativePath] = item
      }
      if (item.children && item.children.length > 0) {
        traverse(item, options)
      }
    })
  }
}
