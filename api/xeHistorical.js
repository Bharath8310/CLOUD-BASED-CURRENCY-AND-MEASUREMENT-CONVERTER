export default async function handler(req, res) {
    const { from, to, date } = req.query;
  
    if (!from || !to || !date) {
      return res.status(400).json({ error: "Missing parameters" });
    }
  
    const apiId = process.env.XE_API_ID;
    const apiKey = process.env.XE_API_KEY;
  
    try {
      const response = await fetch(
        `https://xecdapi.xe.com/v1/historic_rate/?from=${from}&to=${to}&date=${date}`,
        {
          headers: {
            Authorization: "Basic " + Buffer.from(`${apiId}:${apiKey}`).toString("base64"),
          },
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        return res.status(response.status).json({ error: data });
      }
  
      res.status(200).json(data);
    } catch (error) {
      console.error("XE Historical API Error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
  