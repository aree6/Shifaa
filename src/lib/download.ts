export function downloadTextFile(filename: string, contents: string, mime = 'text/plain') {
  const blob = new Blob([contents], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadJson(filename: string, data: unknown) {
  downloadTextFile(filename, JSON.stringify(data, null, 2), 'application/json')
}

function pdfEscape(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function toBytes(s: string) {
  return new TextEncoder().encode(s)
}

function createSimplePdfBytes(lines: string[]) {
  const safeLines = lines.map((l) => pdfEscape(l))

  const contentLines = safeLines
    .map((l, idx) => {
      const y = 760 - idx * 16
      return `BT /F1 12 Tf 50 ${y} Td (${l}) Tj ET`
    })
    .join('\n')

  const contentBytes = toBytes(contentLines)

  const objects: string[] = []
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n')
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
  )
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n')

  const contentHeader = `5 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`
  const contentFooter = '\nendstream\nendobj\n'

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = [0]

  for (const obj of objects) {
    offsets.push(pdf.length)
    pdf += obj
  }

  offsets.push(pdf.length)
  pdf += contentHeader

  const headerBytes = toBytes(pdf)
  const footerBytes = toBytes(contentFooter)

  const xrefOffset = headerBytes.length + contentBytes.length + footerBytes.length

  const xrefEntries: string[] = []
  xrefEntries.push('0000000000 65535 f ')
  for (let i = 1; i < offsets.length; i++) {
    xrefEntries.push(String(offsets[i]).padStart(10, '0') + ' 00000 n ')
  }

  const xref =
    `xref\n0 ${offsets.length}\n` +
    xrefEntries.join('\n') +
    `\ntrailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`

  const xrefBytes = toBytes(xref)

  const out = new Uint8Array(xrefOffset + xrefBytes.length)
  out.set(headerBytes, 0)
  out.set(contentBytes, headerBytes.length)
  out.set(footerBytes, headerBytes.length + contentBytes.length)
  out.set(xrefBytes, xrefOffset)
  return out
}

export function downloadPdfText(filename: string, lines: string[]) {
  const bytes = createSimplePdfBytes(lines)
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
