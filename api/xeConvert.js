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

    console.log("XE API Response:", data);

    if (!response.ok) {
      console.error('XE API Error:', data);
      return res.status(response.status).json({ error: data.message || "Failed to fetch historical rate" });
    }

    // XE API can return data in different formats depending on the endpoint
    // Try to extract the rate from various possible locations
    let rate = null;

    if (data.mid !== undefined) {
      rate = data.mid;
    } else if (data.quotes && Array.isArray(data.quotes) && data.quotes.length > 0) {
      rate = data.quotes[0].mid;
    } else if (data.rate !== undefined) {
      rate = data.rate;
    }

    if (rate === null || isNaN(rate)) {
      console.error("Could not extract rate from response:", data);
      return res.status(500).json({ 
        error: "Could not parse exchange rate from API response",
        debug: data 
      });
    }

    const result = (rate * parseFloat(amount)).toFixed(6);

    res.status(200).json({
      from,
      to,
      date,
      amount,
      result,
      rate: rate.toFixed(6)
    });

  } catch (error) {
    console.error('Historical conversion error:', error);
    res.status(500).json({ error: "Server error fetching historical rate", details: error.message });
  }
}