// convert.js

const convertBtn = document.getElementById("convertBtn");
const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const resultDiv = document.getElementById("result");

convertBtn.addEventListener("click", async () => {
  const amount = Number(amountInput.value);

  // Input validation
  if (isNaN(amount) || amount <= 0) {
    resultDiv.textContent = "Please enter a valid amount!";
    return;
  }

  const from = fromCurrency.value;
  const to = toCurrency.value;

  try {
    const url = `https://api.exchangerate.host/latest?base=${from}&symbols=${to}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const rate = data.rates[to];
    if (!rate) {
      resultDiv.textContent = "Conversion rate not available!";
      return;
    }

    const convertedAmount = (amount * rate).toFixed(2);
    resultDiv.textContent = `${amount} ${from} → ${convertedAmount} ${to} (Rate: ${rate.toFixed(4)})`;

  } catch (error) {
    console.error("Error fetching conversion rate:", error);
    resultDiv.textContent = "Server error. Please try again later.";
  }
});
