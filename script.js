/* script.js */
(() => {
  // ---------- Data ----------
  const currencyList = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CNY", "SGD", "CHF", "NZD", "HKD", "MXN"];
  const currencyToCountry = {
    USD: "US", EUR: "EU", GBP: "GB", INR: "IN", JPY: "JP", AUD: "AU",
    CAD: "CA", CNY: "CN", SGD: "SG", CHF: "CH", NZD: "NZ", HKD: "HK", MXN: "MX"
  };

  const measurementUnits = {
    length: {
      base: "m",
      units: {
        mm: 0.001, cm: 0.01, m: 1, km: 1000,
        in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344
      }
    },
    weight: {
      base: "kg",
      units: {
        g: 0.001, kg: 1, oz: 0.028349523125, lb: 0.45359237
      }
    },
    volume: {
      base: "l",
      units: {
        ml: 0.001, l: 1, cup: 0.2365882365, pt: 0.473176473,
        gal: 3.785411784, floz: 0.0295735295625
      }
    }
  };

  // ---------- Helpers ----------
  function el(id) { return document.getElementById(id) }

  function countryCodeToEmoji(cc) {
    if (!cc) return "🏳️";
    return [...cc.toUpperCase()]
      .map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
      .map(cp => String.fromCodePoint(cp)).join('');
  }

  // ---------- DOM refs ----------
  const fromCurrency = el('fromCurrency'), toCurrency = el('toCurrency'),
    fromFlag = el('fromFlag'), toFlag = el('toFlag'),
    amountInput = el('amount'), convertCurrencyBtn = el('convertCurrencyBtn'),
    currencyResult = el('currencyResult'), swapCurrencyBtn = el('swapCurrency');

  const measureValue = el('measureValue'), measureType = el('measureType'),
    fromUnit = el('fromUnit'), toUnit = el('toUnit'),
    convertMeasureBtn = el('convertMeasureBtn'), measureResult = el('measureResult'),
    swapMeasureBtn = el('swapMeasure');

  const themeToggle = el('themeToggle');

  // ---------- Populate currency selects ----------
  function populateCurrencySelects() {
    for (const code of currencyList) {
      const o1 = new Option(code, code);
      const o2 = new Option(code, code);
      fromCurrency.add(o1);
      toCurrency.add(o2);
    }
    fromCurrency.value = "USD";
    toCurrency.value = "INR";
    updateFlags();
  }

  function updateFlags() {
    fromFlag.textContent = countryCodeToEmoji(currencyToCountry[fromCurrency.value] || '');
    toFlag.textContent = countryCodeToEmoji(currencyToCountry[toCurrency.value] || '');
  }

  fromCurrency.addEventListener('change', updateFlags);
  toCurrency.addEventListener('change', updateFlags);

  // ---------- Currency conversion ----------
  async function convertCurrency() {
    const from = fromCurrency.value;
    const to = toCurrency.value;
    const amount = parseFloat(amountInput.value) || 0;

    currencyResult.textContent = "Fetching…";

    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
      const data = await res.json();

      if (!data.rates || !data.rates[to]) {
        currencyResult.textContent = "Invalid currency code";
        return;
      }

      const rate = data.rates[to];
      const converted = (amount * rate).toFixed(6);

      currencyResult.textContent = `${amount} ${from} → ${converted} ${to} (rate: ${rate})`;
    } catch (err) {
      currencyResult.textContent = "Server error — please try again.";
      console.error(err);
    }
  }

  convertCurrencyBtn.addEventListener('click', convertCurrency);
  amountInput.addEventListener('input', convertCurrency);

  swapCurrencyBtn.addEventListener('click', () => {
    const a = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = a;
    updateFlags();
    convertCurrency();
  });

  // ---------- Measurement ----------
  function populateUnits() {
    const type = measureType.value;
    const units = Object.keys(measurementUnits[type].units);
    fromUnit.innerHTML = "";
    toUnit.innerHTML = "";
    for (const u of units) {
      fromUnit.add(new Option(u, u));
      toUnit.add(new Option(u, u));
    }
    if (type === 'length') { fromUnit.value = 'm'; toUnit.value = 'cm'; }
    if (type === 'weight') { fromUnit.value = 'kg'; toUnit.value = 'g'; }
    if (type === 'volume') { fromUnit.value = 'l'; toUnit.value = 'ml'; }
  }

  measureType.addEventListener('change', () => {
    populateUnits();
    convertMeasurement();
  });

  swapMeasureBtn.addEventListener('click', () => {
    const a = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = a;
    convertMeasurement();
  });

  function convertMeasurement() {
    const type = measureType.value;
    const units = measurementUnits[type].units;
    const val = parseFloat(measureValue.value) || 0;
    const from = fromUnit.value, to = toUnit.value;
    const baseVal = val * units[from];
    const result = baseVal / units[to];
    measureResult.textContent = `${val} ${from} → ${Number(result.toPrecision(12))} ${to}`;
  }

  convertMeasureBtn.addEventListener('click', convertMeasurement);
  measureValue.addEventListener('input', convertMeasurement);
  fromUnit.addEventListener('change', convertMeasurement);
  toUnit.addEventListener('change', convertMeasurement);

  // ---------- Theme ----------
  function loadTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') document.documentElement.classList.add('dark');
  }
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // ---------- Init ----------
  function init() {
    populateCurrencySelects();
    populateUnits();
    loadTheme();
    convertCurrency();
    convertMeasurement();
  }

  document.addEventListener('DOMContentLoaded', init);

//   // ---------- Historical Currency Data + 1-Month Graph ----------
// const showHistoryBtn = document.getElementById("showHistoryBtn");
// const historyCanvas = document.getElementById("historyChart");
// let historyChart;

// showHistoryBtn.addEventListener("click", async () => {
//   const from = fromCurrency.value.toUpperCase();
//   const to = toCurrency.value.toUpperCase();

//   if (from === to) {
//     alert("Please select two different currencies.");
//     return;
//   }

//   showHistoryBtn.textContent = "Loading...";
//   showHistoryBtn.disabled = true;

//   try {
//     const end = new Date();
//     const start = new Date();
//     start.setDate(end.getDate() - 30);

//     const startDate = start.toISOString().split("T")[0];
//     const endDate = end.toISOString().split("T")[0];

//     // ✅ Updated endpoint with version prefix
//     const url = `https://api.exchangerate.host/v1/timeseries?start_date=${startDate}&end_date=${endDate}&base=${from}&symbols=${to}`;
//     const res = await fetch(url);
//     const data = await res.json();

//     if (!data.success || !data.rates) {
//       alert("No data available for this currency pair.");
//       return;
//     }

//     const labels = Object.keys(data.rates);
//     const values = labels.map(date => data.rates[date][to]);

//     if (!values.some(v => v)) {
//       alert("No historical data found for this currency pair.");
//       return;
//     }

//     if (historyChart) historyChart.destroy();

//     historyChart = new Chart(historyCanvas, {
//       type: "line",
//       data: {
//         labels,
//         datasets: [{
//           label: `${from} → ${to} (Last 30 Days)`,
//           data: values,
//           borderColor: "#00BFFF",
//           borderWidth: 2,
//           fill: false,
//           tension: 0.2
//         }]
//       },
//       options: {
//         responsive: true,
//         plugins: {
//           legend: { display: true },
//           title: {
//             display: true,
//             text: `Exchange Rate Trend: ${from} → ${to}`
//           }
//         },
//         scales: {
//           y: { beginAtZero: false }
//         }
//       }
//     });
//   } catch (err) {
//     console.error(err);
//     alert("Failed to load historical data.");
//   } finally {
//     showHistoryBtn.textContent = "Show 1-Month Trend";
//     showHistoryBtn.disabled = false;
//   }
// });
// ---------- Reliable USD Exchange Rate Graph (Last 30 Days) ----------
const showUSDGraphBtn = document.getElementById("showUSDGraphBtn");
const usdChartCanvas = document.getElementById("usdChart");
let usdChart;

showUSDGraphBtn.addEventListener("click", async () => {
  const to = toCurrency.value.toUpperCase();
  const base = "USD";

  if (base === to) {
    alert("Please select a different currency to compare with USD.");
    return;
  }

  showUSDGraphBtn.textContent = "Loading...";
  showUSDGraphBtn.disabled = true;

  try {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    const startDate = start.toISOString().split("T")[0];
    const endDate = end.toISOString().split("T")[0];

    // ✅ Use the proper exchangerate.host timeseries endpoint
    const url = `https://api.exchangerate.host/timeseries?start_date=${startDate}&end_date=${endDate}&base=${base}&symbols=${to}`;

    const res = await fetch(url);
    const data = await res.json();

    // Check if API returned rates properly
    if (!data || !data.rates || Object.keys(data.rates).length === 0) {
      alert("No data available for this currency pair.");
      return;
    }

    // Extract dates and corresponding values
    const labels = Object.keys(data.rates).sort();
    const values = labels.map(date => data.rates[date][to]);

    if (values.every(v => v == null)) {
      alert("No valid exchange rate data available for this currency pair.");
      return;
    }

    // Destroy any existing chart
    if (usdChart) usdChart.destroy();

    // Create new chart
    usdChart = new Chart(usdChartCanvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: `USD → ${to} (Last 30 Days)`,
          data: values,
          borderColor: "#4A90E2",
          borderWidth: 2,
          pointRadius: 2,
          fill: false,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `USD to ${to} Exchange Rate Trend (Past 30 Days)`
          },
          legend: { display: false }
        },
        scales: {
          x: { title: { display: true, text: "Date" } },
          y: { title: { display: true, text: "Exchange Rate" } }
        }
      }
    });
  } catch (err) {
    console.error("Error fetching exchange rates:", err);
    alert("Error fetching data. Please try again later.");
  } finally {
    showUSDGraphBtn.textContent = "Show USD 1-Month Trend";
    showUSDGraphBtn.disabled = false;
  }
});


})();
