export default async function handler(req, res) {
    const { from, to, amount } = req.query;
  
    if (!from || !to || !amount) {
      return res.status(400).json({ error: "Missing parameters" });
    }
  
    try {
      // Ensure fetch works on both local and Vercel
      const fetchFn = global.fetch || (await import('node-fetch')).default;
  
      const response = await fetchFn(
        `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`
      );
      const data = await response.json();
  
      if (!data || !data.result) {
        throw new Error("Invalid API response");
      }
  
      return res.status(200).json({
        result: data.result,
        rate: data.info?.rate || "N/A",
      });
    } catch (error) {
      console.error("Currency conversion failed:", error);
      return res.status(500).json({ error: "Currency conversion failed" });
    }
  }
  