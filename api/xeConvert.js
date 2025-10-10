// /api/xeConvert.js
export default async function handler(req, res) {
  const { from, to, amount } = req.query;

  const apiKey = process.env.XE_API_KEY; // Your Vercel environment variable name
  const apiId = process.env.XE_API_ID;

  if (!apiKey || !apiId) {
    return res.status(500).json({ error: "API credentials not found" });
  }

  try {
    const response = await fetch(
      `https://xecdapi.xe.com/v1/convert_from.json/?from=${from}&to=${to}&amount=${amount}`,
      {
        headers: {
          Authorization: "Basic " + Buffer.from(`${apiId}:${apiKey}`).toString("base64"),
        },
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch conversion data" });
  }
}
