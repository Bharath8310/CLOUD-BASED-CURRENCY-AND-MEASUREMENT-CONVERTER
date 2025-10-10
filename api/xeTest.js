// api/xeTest.js - Test endpoint to verify XE API credentials work
export default async function handler(req, res) {
    const apiId = process.env.XE_API_ID;
    const apiKey = process.env.XE_API_KEY;
  
    console.log("[xeTest] apiId exists:", !!apiId);
    console.log("[xeTest] apiKey exists:", !!apiKey);
  
    if (!apiId || !apiKey) {
      return res.status(500).json({ 
        error: "XE API credentials not found in environment variables",
        apiIdExists: !!apiId,
        apiKeyExists: !!apiKey
      });
    }
  
    try {
      // Simple test: get current USD to INR rate
      const url = "https://xecdapi.xe.com/v1/historic_rate/?from=USD&to=INR&date=2025-10-08&amount=1";
      
      const authHeader = 'Basic ' + Buffer.from(`${apiId}:${apiKey}`).toString('base64');
      
      console.log("[xeTest] Sending request to:", url);
      console.log("[xeTest] Auth header set:", !!authHeader);
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });
  
      console.log("[xeTest] Response status:", response.status);
      console.log("[xeTest] Response headers:", Object.fromEntries(response.headers));
  
      const data = await response.json();
      
      console.log("[xeTest] Response body:", JSON.stringify(data, null, 2));
  
      res.status(200).json({
        success: true,
        statusCode: response.status,
        responseData: data,
        message: "XE API connection test successful"
      });
  
    } catch (error) {
      console.error("[xeTest] Error:", error.message);
      console.error("[xeTest] Stack:", error.stack);
      
      res.status(500).json({ 
        error: error.message,
        stack: error.stack 
      });
    }
  }