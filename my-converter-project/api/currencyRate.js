// api/currencyRate.js
export default async function handler(req, res) {
    try {
      const base = req.query.base || "USD";
      const symbols = req.query.symbols; // e.g. "INR"
      const url = `https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}${symbols ? `&symbols=${encodeURIComponent(symbols)}` : ""}`;
  
      const r = await fetch(url);
      if (!r.ok) return res.status(502).json({ error: "Upstream failed" });
      const data = await r.json();
  
      // Cache on Vercel edge for a bit (s-maxage)
      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=59");
      return res.status(200).json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
  