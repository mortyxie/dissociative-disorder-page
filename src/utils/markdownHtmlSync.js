/**
 * 将 Compass 富文本编辑器内的 HTML（与 renderSimpleMarkdown 输出结构一致）还原为 Markdown。
 * 用于 contenteditable 预览编辑后写回 bodyMd。
 */
function serializeInline(el) {
  let s = ''
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      s += node.textContent
      continue
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue
    const t = node.tagName.toLowerCase()
    if (t === 'strong' || t === 'b') s += `**${serializeInline(node)}**`
    else if (t === 'em' || t === 'i') s += `*${serializeInline(node)}*`
    else if (t === 'code') s += `\`${node.textContent}\``
    else if (t === 'img') {
      const src = node.getAttribute('src') || ''
      const alt = node.getAttribute('alt') || ''
      s += `![${alt}](${src})`
    } else if (t === 'a') {
      s += `[${serializeInline(node)}](${node.getAttribute('href') || ''})`
    } else if (t === 'br') s += '\n'
    else s += serializeInline(node)
  }
  return s
}

function serializeBlocks(container) {
  const out = []
  for (const child of container.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const t = child.textContent
      if (t.trim()) out.push(`${t.trim()}\n\n`)
      continue
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue
    const el = child
    const tag = el.tagName.toLowerCase()
    if (tag === 'h1') out.push(`# ${serializeInline(el).trim()}\n\n`)
    else if (tag === 'h2') out.push(`## ${serializeInline(el).trim()}\n\n`)
    else if (tag === 'h3') out.push(`### ${serializeInline(el).trim()}\n\n`)
    else if (tag === 'p') {
      const inner = serializeInline(el).trimEnd()
      if (inner || el.querySelector('img')) out.push(`${inner}\n\n`)
    } else if (tag === 'ul') {
      for (const li of el.querySelectorAll(':scope > li')) {
        out.push(`- ${serializeInline(li).trim()}\n`)
      }
      out.push('\n')
    } else if (tag === 'ol') {
      let i = 1
      for (const li of el.querySelectorAll(':scope > li')) {
        out.push(`${i}. ${serializeInline(li).trim()}\n`)
        i += 1
      }
      out.push('\n')
    } else if (tag === 'pre') {
      const code = el.querySelector('code')
      const text = (code ? code.textContent : el.textContent).replace(/\n$/, '')
      out.push(`\`\`\`\n${text}\n\`\`\`\n\n`)
    } else if (tag === 'img') {
      const src = el.getAttribute('src') || ''
      const alt = el.getAttribute('alt') || ''
      out.push(`![${alt}](${src})\n\n`)
    } else if (tag === 'div') {
      out.push(serializeBlocks(el))
    } else if (tag === 'br') {
      out.push('\n')
    }
  }
  return out.join('')
}

/**
 * @param {string} html 编辑器根元素的 innerHTML（通常含 .compass-md-root）
 */
export function htmlToMarkdownFromEditor(html) {
  if (!html || !html.trim()) return ''
  const doc = new DOMParser().parseFromString(
    `<div id="wrap">${html}</div>`,
    'text/html',
  )
  const wrap = doc.getElementById('wrap')
  if (!wrap) return ''
  let root = wrap.querySelector('.compass-md-root')
  if (!root) root = wrap
  return serializeBlocks(root).replace(/\n{3,}/g, '\n\n').trimEnd()
}
