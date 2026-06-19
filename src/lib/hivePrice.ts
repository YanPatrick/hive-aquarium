export async function fetchHivePrice(): Promise<number | null> {
  // Strategy 1: CoinGecko
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd',
      { headers: { Accept: 'application/json' } }
    )
    const data = await res.json()
    const price = data?.hive?.usd
    if (price && price > 0) return price
  } catch {}

  // Strategy 2: Hive internal price feed
  try {
    const res = await fetch('https://api.hive.blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'condenser_api.get_current_median_history_price',
        params: [],
        id: 1,
      }),
    })
    const data = await res.json()
    if (data.result) {
      const base = parseFloat(data.result.base.replace(' HBD', ''))
      const quote = parseFloat(data.result.quote.replace(' HIVE', ''))
      if (quote > 0) return base / quote
    }
  } catch {}

  // Strategy 3: CoinCap
  try {
    const res = await fetch('https://api.coincap.io/v2/assets/hive')
    const data = await res.json()
    if (data?.data?.priceUsd) return parseFloat(data.data.priceUsd)
  } catch {}

  return null
}
