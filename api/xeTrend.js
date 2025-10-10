// api/xeTimeseries.js
export default async function handler(req, res) {
    const { base, symbols, start, end } = req.query;
  
    if (!base || !symbols || !start || !end) {
      return res.status(400).json({ error: "Missing required parameters: base, symbols, start, end" });
    }
  
    const apiId = process.env.XE_API_ID;
    const apiKey = process.env.XE_API_KEY;
  
    if (!apiId || !apiKey) {
      console.error("Missing XE API credentials in environment variables");
      return res.status(500).json({ error: "API credentials not configured" });
    }
  
    // XE API endpoint for historical period/timeseries
    const url = `https://xecdapi.xe.com/v1/historic_rate/period/?from=${base}&to=${symbols}&start_timestamp=${start}T00:00:00Z&end_timestamp=${end}T23:59:59Z&interval=daily&amount=1`;
  
    try {
      console.log(`Fetching timeseries: ${url}`);
  
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
        return res.status(response.status).json({ error: data.message || "Failed to fetch timeseries data" });
      }
  
      // Transform XE API response to the format expected by your frontend
      // XE returns an array of { timestamp, mid } entries
      const rates = {};
      if (data.quotes && Array.isArray(data.quotes)) {
        data.quotes.forEach(quote => {
          const dateStr = quote.timestamp.split('T')[0]; // Extract YYYY-MM-DD
          rates[dateStr] = {
            [symbols]: quote.mid
          };
        });
      }
  
      res.status(200).json({
        base,
        to: symbols,
        start,
        end,
        rates
      });
  
    } catch (error) {
      console.error('Timeseries error:', error);
      res.status(500).json({ error: "Server error fetching timeseries data" });
    }
  }