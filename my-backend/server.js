// server.js
const express = require("express");
const fetch = require("node-fetch"); // npm install node-fetch@2

const app = express();

app.get("/api/convert", async (req, res) => {
  const { from, to, amount } = req.query;
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await response.json();
    if (!data.rates || !data.rates[to]) {
      return res.status(400).json({ error: "Invalid currency code" });
    }
    const result = (amount * data.rates[to]).toFixed(2);
    res.json({ result });
  } catch (err) {
    console.error("Conversion failed:", err);
    res.status(500).json({ error: "Conversion failed" });
  }
});

app.listen(3000, () => console.log("✅ Server running at http://localhost:3000"));
