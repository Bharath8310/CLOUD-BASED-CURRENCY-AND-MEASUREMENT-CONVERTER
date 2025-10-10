// api/xeConvert.js
export default async function handler(req, res) {
  const { from, to, date, amount = 1 } = req.query;

  if (!from || !to || !date) {
    return res.status(400).json({ error: "Missing required parameters: from, to, date" });
  }

  const apiId = process.env.XE_API_ID;
  const apiKey = process.env.XE_API_KEY;

  if (!apiId || !apiKey) {
    console.error("Missing XE API credentials in environment variables");
    return res.status(500).json({ error: "API credentials not configured" });
  }

  // XE API endpoint for historical rates
  const url = `https://xecdapi.xe.com/v1/historic_rate/?from=${from}&to=${to}&date=${date}&amount=${amount}`;

  try {
    console.log(`Fetching: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${apiId}:${apiKey}`).toString('base64'),
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('XE API Error:', data);
      return res.status(response.status).json({ error: data.message || "Failed to fetch historical rate" });
    }

    // XE API returns structure like: { from, to, timestamp, mid, amount, ...}
    const result = data.mid * amount;

    res.status(200).json({
      from,
      to,
      date,
      amount,
      result: result.toFixed(6),
      rate: data.mid
    });

  } catch (error) {
    console.error('Historical conversion error:', error);
    res.status(500).json({ error: "Server error fetching historical rate" });
  }
}