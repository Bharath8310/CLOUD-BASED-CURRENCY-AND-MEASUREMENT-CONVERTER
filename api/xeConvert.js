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

  try {
    const url = `https://xecdapi.xe.com/v1/historic_rate/?from=${from}&to=${to}&date=${date}&amount=${amount}`;

    console.log(`[xeConvert] Fetching: ${url}`);
    
    const authHeader = 'Basic ' + Buffer.from(`${apiId}:${apiKey}`).toString('base64');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[xeConvert] Response status: ${response.status}`);

    const data = await response.json();
    console.log(`[xeConvert] Full response:`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('[xeConvert] XE API Error:', data);
      return res.status(response.status).json({ 
        error: data.message || "Failed to fetch historical rate",
        apiResponse: data
      });
    }

    // Extract rate from XE API response
    // XE API returns the rate in different formats, check all possibilities
    let rate = null;

    // Try all possible fields where the rate might be
    const possibleFields = [
      data.mid,
      data.rate,
      data.to,
      data.conversion,
      data.exchange_rate,
      data.value,
      data.quotes?.[0]?.mid,
      data.quotes?.[0]?.rate,
      data.rates?.[to],
      data.rates?.to?.[to]
    ];

    for (const field of possibleFields) {
      if (field !== undefined && field !== null && !isNaN(parseFloat(field))) {
        rate = parseFloat(field);
        console.log(`[xeConvert] Found rate: ${rate}`);
        break;
      }
    }

    if (rate === null || isNaN(rate)) {
      console.error("[xeConvert] Could not extract rate. Response keys:", Object.keys(data));
      console.error("[xeConvert] Full response data:", data);
      
      // Return the response so frontend can see what we got
      return res.status(500).json({ 
        error: "Could not parse exchange rate. Check the response structure.",
        responseKeys: Object.keys(data),
        fullResponse: data
      });
    }

    const result = (rate * parseFloat(amount)).toFixed(6);

    console.log(`[xeConvert] Success: ${amount} ${from} = ${result} ${to} (rate: ${rate})`);

    res.status(200).json({
      from,
      to,
      date,
      amount,
      result,
      rate: rate.toFixed(6)
    });

  } catch (error) {
    console.error('[xeConvert] Server error:', error.message);
    console.error('[xeConvert] Stack:', error.stack);
    res.status(500).json({ 
      error: "Server error fetching historical rate", 
      details: error.message,
      stack: error.stack
    });
  }
}