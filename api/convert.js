// convert.js

const convertBtn = document.getElementById("convertBtn");
const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const resultDiv = document.getElementById("result");

// Replace with your actual API key
const apiKey = "YOUR_ACCESS_KEY";  

convertBtn.addEventListener("click", async () => {
  const amount = Number(amountInput.value);

  if (isNaN(amount) || amount <= 0) {
    resultDiv.textContent = "Please enter a valid amount!";
    return;
  }

  const from = fromCurrency.value;
  const to = toCurrency.value;

  try {
    const url = `https://api.exchangerate.host/latest?base=${from}&symbols=${to}`;
    const response = await fetch(url);
    const data = await response.json();

    // Check if rate exists
    const rate = data.rates[to];
    if (!rate) {
      resultDiv.textContent = "Conversion rate not available!";
      return;
    }

    const convertedAmount = (amount * rate).toFixed(2);
    resultDiv.textContent = `${amount} ${from} → ${convertedAmount} ${to} (rate: ${rate.toFixed(4)})`;

  } catch (error) {
    console.error("Error fetching conversion rate:", error);
    resultDiv.textContent = "Failed to fetch conversion rate. Please try again later.";
  }
});
