function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatInline(t) {
  let s = escapeHtml(t)
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>')
  s = s.replace(/`([^`]+)`/g, '<code class="compass-md-code">$1</code>')
  s = s.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img class="compass-md-img" alt="$1" src="$2" loading="lazy" />',
  )
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a class="compass-md-a" href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  )
  return s
}

export function renderSimpleMarkdown(md) {
  let s = String(md || '')
  const placeholders = []
  s = s.replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) => {
    const i = placeholders.length
    placeholders.push(
      `<pre class="compass-md-pre"><code>${escapeHtml(code.trimEnd())}</code></pre>`,
    )
    return `\n\n@@BLOCK${i}@@\n\n`
  })

  const parts = s.split(/\n{2,}/)
  const chunks = []
  for (const part of parts) {
    const block = part.trim()
    if (!block) continue
    if (/^@@BLOCK\d+@@$/.test(block)) {
      const m = /^@@BLOCK(\d+)@@$/.exec(block)
      if (m) chunks.push(placeholders[Number(m[1])])
      continue
    }
    const lines = block.split('\n')
    if (lines.every((ln) => /^\d+\.\s+/.test(ln))) {
      chunks.push(
        '<ol class="compass-md-ol">' +
          lines
            .map((ln) => {
              const m = /^\d+\.\s+(.*)$/.exec(ln)
              return `<li>${formatInline((m && m[1]) || '')}</li>`
            })
            .join('') +
          '</ol>',
      )
      continue
    }
    if (lines.every((ln) => /^-\s+/.test(ln))) {
      chunks.push(
        '<ul class="compass-md-ul">' +
          lines
            .map((ln) => `<li>${formatInline(ln.replace(/^-\s+/, ''))}</li>`)
            .join('') +
          '</ul>',
      )
      continue
    }
    if (lines.length === 1) {
      const ln = lines[0]
      if (ln.startsWith('### ')) {
        chunks.push(`<h3 class="compass-md-h3">${formatInline(ln.slice(4))}</h3>`)
        continue
      }
      if (ln.startsWith('## ')) {
        chunks.push(`<h2 class="compass-md-h2">${formatInline(ln.slice(3))}</h2>`)
        continue
      }
      if (ln.startsWith('# ')) {
        chunks.push(`<h1 class="compass-md-h1">${formatInline(ln.slice(2))}</h1>`)
        continue
      }
    }
    chunks.push(
      lines.map((ln) => `<p class="compass-md-p">${formatInline(ln)}</p>`).join(''),
    )
  }

  return `<div class="compass-md-root">${chunks.join('')}</div>`
}

export function excerptFromMarkdown(md, maxLen = 160) {
  const raw = String(md || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[[^\]]+\]\([^)]+\)/g, '$1')
    .replace(/[*_`#]/g, '')
    .split(/\n+/)
    .map((x) => x.trim())
    .filter(Boolean)
    .join(' ')
  if (!raw) return ''
  return raw.length <= maxLen ? raw : `${raw.slice(0, maxLen)}…`
}
