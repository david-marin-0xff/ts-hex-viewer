import './style.css'

const fileInput = document.getElementById('fileInput') as HTMLInputElement
const offsets = document.getElementById('offsets') as HTMLPreElement
const hex = document.getElementById('hex') as HTMLPreElement
const ascii = document.getElementById('ascii') as HTMLPreElement

// ================= Selection logic =================

let selectedIndex: number | null = null

const clearSelection = () => {
  document
    .querySelectorAll('.selected')
    .forEach(el => el.classList.remove('selected'))
}

const selectByte = (index: number) => {
  clearSelection()
  selectedIndex = index

  const hexEl = document.querySelector(
    `.hex-byte[data-index="${index}"]`
  )
  const asciiEl = document.querySelector(
    `.ascii-byte[data-index="${index}"]`
  )

  hexEl?.classList.add('selected')
  asciiEl?.classList.add('selected')
}

// ================= Scroll sync =================

const syncScroll = (source: HTMLElement, targets: HTMLElement[]) => {
  source.addEventListener('scroll', () => {
    for (const t of targets) {
      t.scrollTop = source.scrollTop
    }
  })
}

// Set up scroll syncing ONCE
syncScroll(offsets, [hex, ascii])
syncScroll(hex, [offsets, ascii])
syncScroll(ascii, [offsets, hex])

// ================= Click handling =================

hex.addEventListener('click', e => {
  const target = e.target as HTMLElement
  const index = target.dataset.index
  if (!index) return

  selectByte(Number(index))
})

// ================= File loading =================

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0]
  if (!file) return

  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  const BYTES_PER_ROW = 16

  offsets.textContent = ''
  hex.innerHTML = ''
  ascii.innerHTML = ''

  for (let i = 0; i < bytes.length; i += BYTES_PER_ROW) {
    offsets.textContent += i.toString(16).padStart(8, '0') + '\n'

    const row = bytes.slice(i, i + BYTES_PER_ROW)

    // Hex column
    hex.innerHTML +=
      Array.from(row)
        .map((b, j) => {
          const index = i + j
          const hexByte = b.toString(16).padStart(2, '0')
          return `<span class="hex-byte" data-index="${index}">${hexByte}</span>`
        })
        .join(' ') + '<br>'

    // ASCII column
    ascii.innerHTML +=
      Array.from(row)
        .map((b, j) => {
          const index = i + j
          const char =
            b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'
          const cls =
            b >= 32 && b <= 126
              ? 'ascii-byte ascii-char'
              : 'ascii-byte ascii-dot'

          return `<span class="${cls}" data-index="${index}">${char}</span>`
        })
        .join('') + '<br>'
  }
})
