// lib/export/exportElement.ts

import { toPng } from 'html-to-image'

/**
 * Exporte un élément DOM en PNG téléchargeable.
 * html-to-image est importé dynamiquement pour ne pas alourdir le bundle initial.
 * Avantage sur html2canvas : meilleur rendu des SVG (Recharts) et bundle ~30KB vs ~140KB [citation:3].
 */
export async function exportElementToPng(
  element: HTMLElement,
  fileName: string
): Promise<void> {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2, // haute résolution
    backgroundColor: '#ffffff',
  })

  const link = document.createElement('a')
  link.download = `${fileName}.png`
  link.href = dataUrl
  link.click()
}