export default async function handler(req, res) {
    const { from, to, amount } = req.query;
  
    try {
      // Fetch rates for the base currency
      const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
      const data = await response.json();
  
      // Check if the response is valid
      if (!data || !data.rates || !data.rates[to]) {
        throw new Error("Invalid API response");
      }
  
      // Calculate converted value
      const result = (amount * data.rates[to]).toFixed(2);
  
      // Return conversion result
      res.status(200).json({ result });
    } catch (error) {
      console.error("Currency conversion failed:", error);
      res.status(500).json({ error: "Currency conversion failed" });
    }
  }
  