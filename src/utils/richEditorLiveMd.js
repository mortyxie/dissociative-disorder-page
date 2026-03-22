/**
 * contenteditable 预览区内：即时把 Markdown 语法的块从 <p> 提升为标题/列表，
 * 并处理列表内 Enter 续行。
 */

function stripZwsp(s) {
  return String(s || '')
    .replace(/\u200b/g, '')
    .replace(/\u00a0/g, ' ')
}

/**
 * # / ## / ### 后接至少一个空格即升为标题（空格后即可渲染，正文可后补）
 */
export function promoteHashHeadings(shell) {
  const root = shell.querySelector?.('.compass-md-root') || shell
  if (!root) return
  const blocks = [...root.children]
  for (const el of blocks) {
    if (el.tagName !== 'P') continue
    const raw = stripZwsp(el.textContent).trimEnd()
    if (!raw || raw.includes('\n')) continue
    const m = /^(#{1,3})\s+(.*)$/.exec(raw)
    if (!m) continue
    const level = m[1].length
    const body = m[2].trimEnd()
    const h = document.createElement(`h${level}`)
    h.className = `compass-md-h${level}`
    if (body) {
      h.textContent = body
    } else {
      h.appendChild(document.createElement('br'))
    }
    el.replaceWith(h)
    placeCaretAtEnd(h)
  }
}

/**
 * 单行 `- ` + 空格后即无序列表；`数字.` + 空格后即有序列表（空格后即可渲染）
 */
export function promoteListParagraphs(shell) {
  const root = shell.querySelector?.('.compass-md-root') || shell
  if (!root) return
  const blocks = [...root.children]
  for (const el of blocks) {
    if (el.tagName !== 'P') continue
    const raw = stripZwsp(el.textContent).trimEnd()
    if (!raw || raw.includes('\n')) continue
    const ulM = /^-\s+(.*)$/.exec(raw)
    if (ulM) {
      const ul = document.createElement('ul')
      ul.className = 'compass-md-ul'
      const li = document.createElement('li')
      const item = ulM[1].trimEnd()
      if (item) li.textContent = item
      else li.appendChild(document.createElement('br'))
      ul.appendChild(li)
      el.replaceWith(ul)
      placeCaretAtEnd(li)
      continue
    }
    const olM = /^(\d+)\.\s+(.*)$/.exec(raw)
    if (olM) {
      const ol = document.createElement('ol')
      ol.className = 'compass-md-ol'
      const li = document.createElement('li')
      const item = olM[2].trimEnd()
      if (item) li.textContent = item
      else li.appendChild(document.createElement('br'))
      ol.appendChild(li)
      el.replaceWith(ol)
      placeCaretAtEnd(li)
    }
  }
}

export function applyLiveBlockTransforms(shell) {
  if (!shell) return
  promoteHashHeadings(shell)
  promoteListParagraphs(shell)
}

function placeCaretAtEnd(el) {
  const sel = window.getSelection()
  if (!sel) return
  const r = document.createRange()
  if (el.childNodes.length === 0) {
    el.appendChild(document.createTextNode(''))
  }
  r.selectNodeContents(el)
  r.collapse(false)
  sel.removeAllRanges()
  sel.addRange(r)
}

function placeCaretStart(el) {
  const sel = window.getSelection()
  if (!sel) return
  const r = document.createRange()
  if (el.childNodes.length === 0) {
    el.appendChild(document.createTextNode(''))
  }
  const first = el.firstChild
  r.setStart(first, 0)
  r.collapse(true)
  sel.removeAllRanges()
  sel.addRange(r)
}

/**
 * @returns {boolean} 是否已处理（应 preventDefault）
 */
export function handleRichEditorEnter(e, shell) {
  if (e.key !== 'Enter' || e.shiftKey) return false
  const sel = window.getSelection()
  if (!sel?.rangeCount) return false
  let n = sel.anchorNode
  if (n.nodeType === Node.TEXT_NODE) n = n.parentElement
  const li = n?.closest?.('li')
  if (!li || !shell?.contains(li)) return false

  const list = li.parentElement
  if (!list || (list.tagName !== 'UL' && list.tagName !== 'OL')) return false

  const liText = stripZwsp(li.textContent).trim()

  e.preventDefault()

  if (!liText) {
    const nextSib = li.nextElementSibling
    li.remove()
    if (!list.querySelector('li')) {
      const p = document.createElement('p')
      p.className = 'compass-md-p'
      p.appendChild(document.createElement('br'))
      list.replaceWith(p)
      placeCaretStart(p)
    } else if (nextSib && nextSib.tagName === 'LI') {
      placeCaretStart(nextSib)
    } else {
      const p = document.createElement('p')
      p.className = 'compass-md-p'
      p.appendChild(document.createElement('br'))
      list.parentNode?.insertBefore(p, list.nextSibling)
      placeCaretStart(p)
    }
    return true
  }

  const newLi = document.createElement('li')
  newLi.appendChild(document.createTextNode(''))
  if (li.nextSibling) list.insertBefore(newLi, li.nextSibling)
  else list.appendChild(newLi)
  placeCaretStart(newLi)
  return true
}
