export default async function handler(req, res) {
    const { from, to, amount } = req.query;
  
    if (!from || !to || !amount) {
      return res.status(400).json({ error: "Missing parameters" });
    }
  
    try {
      // Free API (no API key needed)
      const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;
      const response = await fetch(url);
      const data = await response.json();
  
      if (!data || !data.result) {
        throw new Error("Invalid response from API");
      }
  
      res.status(200).json({ result: data.result });
    } catch (error) {
      console.error("Currency conversion failed:", error);
      res.status(500).json({ error: "Conversion failed" });
    }
  }
  