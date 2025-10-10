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
      units: { g: 0.001, kg: 1, oz: 0.028349523125, lb: 0.45359237 }
    },
    volume: {
      base: "l",
      units: {
        ml: 0.001, l: 1, cup: 0.2365882365, pt: 0.473176473,
        gal: 3.785411784, floz: 0.0295735295625
      }
    }
  };

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
      fromCurrency.add(new Option(code, code));
      toCurrency.add(new Option(code, code));
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

  // ---------- Currency conversion (current) ----------
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

  // ----------------- Historical Currency Value & Trend (XE API) -----------------
  const histFrom = el('histFromCurrency');
  const histTo = el('histToCurrency');
  const histDate = el('historicalDate');
  const fetchHistBtn = el('fetchHistoricalBtn');
  const histResult = el('historicalResult');

  const trendCurrency = el('trendCurrency');
  const showTrendBtn = el('showTrendBtn');
  const trendCanvas = el('trendChart');
  let trendChart;

  function populateHistoricalSelects() {
    for (const code of currencyList) {
      histFrom.add(new Option(code, code));
      histTo.add(new Option(code, code));
      trendCurrency.add(new Option(code, code));
    }
    histFrom.value = 'USD';
    histTo.value = 'INR';
    trendCurrency.value = 'INR';
  }
  populateHistoricalSelects();

  // Fetch Historical Rate using XE API (via your Vercel function)
  fetchHistBtn.addEventListener('click', async () => {
    const from = histFrom.value;
    const to = histTo.value;
    const date = histDate.value;
    if (!date) {
      alert('Please select a date.');
      return;
    }

    histResult.textContent = 'Fetching...';
    try {
      const res = await fetch(`/api/xeConvert?from=${from}&to=${to}&date=${date}&amount=1`);
      const data = await res.json();

      if (!data || !data.result) {
        histResult.textContent = 'No data available for this date.';
        return;
      }

      histResult.textContent = `On ${date}, 1 ${from} = ${data.result} ${to}`;
    } catch (err) {
      histResult.textContent = 'Error fetching data.';
      console.error(err);
    }
  });

  // Currency Trend (Past 30 Days) using XE API
  showTrendBtn.addEventListener('click', async () => {
    const to = trendCurrency.value;
    const base = 'USD';
    showTrendBtn.textContent = 'Loading...';
    showTrendBtn.disabled = true;

    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      const startDate = start.toISOString().split('T')[0];
      const endDate = end.toISOString().split('T')[0];

      const res = await fetch(`/api/xeTimeseries?base=${base}&symbols=${to}&start=${startDate}&end=${endDate}`);
      const data = await res.json();

      if (!data || !data.rates) {
        alert('No data found.');
        return;
      }

      const labels = Object.keys(data.rates).sort();
      const values = labels.map(date => data.rates[date][to]);

      if (trendChart) trendChart.destroy();

      trendChart = new Chart(trendCanvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: `${base} → ${to} (Last 30 Days)`,
            data: values,
            borderColor: '#4A90E2',
            borderWidth: 2,
            fill: false,
            tension: 0.3
          }]
        },
        options: {
          scales: {
            x: { title: { display: true, text: 'Date' } },
            y: { title: { display: true, text: 'Exchange Rate' } }
          }
        }
      });
    } catch (err) {
      console.error(err);
      alert('Error fetching data.');
    } finally {
      showTrendBtn.textContent = 'Show Trend';
      showTrendBtn.disabled = false;
    }
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
})();
