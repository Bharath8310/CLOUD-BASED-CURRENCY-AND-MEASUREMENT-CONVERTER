export default async function handler(req, res) {
    const { from, to, amount } = req.query;
  
    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }
  
    try {
      const apiUrl = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      if (!data.result) {
        return res.status(500).json({ error: 'Conversion failed.' });
      }
  
      res.status(200).json({
        from,
        to,
        amount,
        converted: data.result,
        rate: data.info.rate,
        date: data.date,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
  