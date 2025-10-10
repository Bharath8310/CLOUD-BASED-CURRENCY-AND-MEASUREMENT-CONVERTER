// api/xeTrend.js
export default async function handler(req, res) {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  const apiId = process.env.XE_API_ID;
  const apiKey = process.env.XE_API_KEY;

  if (!apiId || !apiKey) {
    return res.status(500).json({ error: "API credentials not set." });
  }

  // Adjust endpoint to your XE API access (example: historical rates)
  const url = `https://xecdapi.xe.com/v1/historic_rate/period/?from=${from}&to=${to}&interval=daily&amount=1`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: "Basic " + Buffer.from(`${apiId}:${apiKey}`).toString("base64"),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Trend API error:", error);
    res.status(500).json({ error: "Server error fetching trend" });
  }
}
