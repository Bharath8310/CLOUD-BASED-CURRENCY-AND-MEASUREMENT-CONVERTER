const fetchFn = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
  
  module.exports = async (req, res) => {
    const { from, to, amount } = req.query;
  
    if (!from || !to || !amount) {
      return res.status(400).json({ error: "Missing parameters" });
    }
  
    try {
      const response = await fetchFn(
        `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`
      );
      const data = await response.json();
  
      if (!data || !data.result) {
        throw new Error("Invalid API response");
      }
  
      return res.status(200).json({
        converted: data.result,
        rate: data.info?.rate || "N/A",
      });
    } catch (error) {
      console.error("Currency conversion failed:", error);
      return res.status(500).json({ error: "Currency conversion failed" });
    }
  };
  