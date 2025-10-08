// api/symbols.js
export default async function handler(req, res) {
    try {
      const r = await fetch('https://api.exchangerate.host/symbols');
      if (!r.ok) throw new Error('Failed to fetch symbols');
      const data = await r.json();
  
      // Cache on Vercel CDN for 24 hours (s-maxage) with SWR
      res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
  
      // data.symbols is an object like { USD: { description: "US Dollar", code: "USD" }, ... }
      res.status(200).json(data.symbols);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Could not load currency symbols' });
    }
  }
  