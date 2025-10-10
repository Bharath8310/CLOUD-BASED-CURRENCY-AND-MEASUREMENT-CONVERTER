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
    // Convert date to timestamp format if needed
    const timestamp = new Date(date).toISOString();
    
    // Try the historic_rate endpoint
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
    console.log(`[xeConvert] Response body:`, JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('[xeConvert] XE API Error:', data);
      return res.status(response.status).json({ 
        error: data.message || "Failed to fetch historical rate",
        apiResponse: data
      });
    }

    // Extract rate from response
    let rate = null;

    // Check common response formats
    if (data.mid !== undefined && data.mid !== null) {
      rate = parseFloat(data.mid);
      console.log(`[xeConvert] Found rate in 'mid' field: ${rate}`);
    } else if (data.quotes && Array.isArray(data.quotes) && data.quotes.length > 0) {
      rate = parseFloat(data.quotes[0].mid);
      console.log(`[xeConvert] Found rate in 'quotes[0].mid': ${rate}`);
    } else if (data.rate !== undefined && data.rate !== null) {
      rate = parseFloat(data.rate);
      console.log(`[xeConvert] Found rate in 'rate' field: ${rate}`);
    }

    if (rate === null || isNaN(rate)) {
      console.error("[xeConvert] Could not extract valid rate from response:", data);
      return res.status(500).json({ 
        error: "Could not parse exchange rate from API response. The API may not have data for this date.",
        apiResponse: data 
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
    console.error('[xeConvert] Server error:', error);
    res.status(500).json({ 
      error: "Server error fetching historical rate", 
      details: error.message 
    });
  }
}