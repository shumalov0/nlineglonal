// Variantlı məhsulun və onun variation-larının strukturunu öyrən
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'NlineGlobal-Probe/1.0' },
  })
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  return res.json() as Promise<T>
}

interface P {
  id: number
  name: string
  type: string
  has_options?: boolean
  variations: unknown[]
  attributes: unknown[]
  prices: Record<string, unknown>
}

async function main() {
  const products = await fetchJson<P[]>(
    'https://mebaks.az/wp-json/wc/store/v1/products?per_page=100&page=1'
  )
  const variable = products.find((p) => p.type === 'variable' || (p.variations?.length ?? 0) > 0)
  if (!variable) {
    console.log('Variantlı məhsul tapılmadı (page 1). Tiplər:', [...new Set(products.map((p) => p.type))])
    return
  }
  console.log('═══ PARENT ═══')
  console.log('ad:', variable.name, '| type:', variable.type)
  console.log('attributes:', JSON.stringify(variable.attributes, null, 2))
  console.log('variations:', JSON.stringify(variable.variations, null, 2).slice(0, 1500))

  // İlk variation-ı standalone çək
  const firstVar = variable.variations[0] as { id?: number } | number
  const varId = typeof firstVar === 'number' ? firstVar : firstVar?.id
  if (varId) {
    const v = await fetchJson<Record<string, unknown>>(
      `https://mebaks.az/wp-json/wc/store/v1/products/${varId}`
    )
    console.log('\n═══ VARIATION standalone /products/' + varId + ' ═══')
    console.log('type:', v.type)
    console.log('attributes:', JSON.stringify(v.attributes, null, 2))
    console.log('prices:', JSON.stringify(v.prices))
    console.log('name:', v.name)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
