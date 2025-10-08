/* script.js */
(() => {
    // ---------- Data ----------
    const currencyList = ["USD","EUR","GBP","INR","JPY","AUD","CAD","CNY","SGD","CHF","NZD","HKD","MXN"];
    const currencyToCountry = {
      USD: "US", EUR:"EU", GBP:"GB", INR:"IN", JPY:"JP", AUD:"AU",
      CAD:"CA", CNY:"CN", SGD:"SG", CHF:"CH", NZD:"NZ", HKD:"HK", MXN:"MX"
    };
  
    const measurementUnits = {
      length: {
        base: "m",
        units: {
          mm: 0.001,
          cm: 0.01,
          m: 1,
          km: 1000,
          in: 0.0254,
          ft: 0.3048,
          yd: 0.9144,
          mi: 1609.344
        }
      },
      weight: {
        base: "kg",
        units: {
          g: 0.001,
          kg: 1,
          oz: 0.028349523125,
          lb: 0.45359237
        }
      },
      volume: {
        base: "l",
        units: {
          ml: 0.001,
          l: 1,
          cup: 0.2365882365,
          pt: 0.473176473,
          gal: 3.785411784,
          floz: 0.0295735295625
        }
      }
    };
  
    // ---------- Helpers ----------
    function el(id){ return document.getElementById(id) }
  
    function countryCodeToEmoji(cc){
      if(!cc) return "🏳️";
      // Return emoji flag for 2-letter country codes (A-Z)
      return [...cc.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
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
    function populateCurrencySelects(){
      for(const code of currencyList){
        const o1 = new Option(code, code);
        const o2 = new Option(code, code);
        fromCurrency.add(o1);
        toCurrency.add(o2);
      }
      fromCurrency.value = "USD";
      toCurrency.value = "INR";
      updateFlags();
    }
  
    function updateFlags(){
      fromFlag.textContent = countryCodeToEmoji(currencyToCountry[fromCurrency.value] || '');
      toFlag.textContent   = countryCodeToEmoji(currencyToCountry[toCurrency.value] || '');
    }
  
    fromCurrency.addEventListener('change', updateFlags);
    toCurrency.addEventListener('change', updateFlags);
  
    // ---------- Currency conversion ----------
    // ---------- Currency conversion ----------
async function convertCurrency() {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const amount = parseFloat(amountInput.value) || 0;

  currencyResult.textContent = "Fetching…";

  try {
    // Call your backend function
    const url = `/api/convert?from=${from}&to=${to}&amount=${amount}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      currencyResult.textContent = data.error;
    } else {
      const result = Number(data.converted).toLocaleString(undefined, { maximumFractionDigits: 6 });
      currencyResult.textContent = `${amount} ${from} → ${result} ${to} (rate: ${data.rate})`;
    }
  } catch (err) {
    currencyResult.textContent = "Server error — please try again.";
    console.error(err);
  }
}

  
    convertCurrencyBtn.addEventListener('click', convertCurrency);
    // also real-time conversion when inputs change
    amountInput.addEventListener('input', () => { convertCurrency(); });
  
    swapCurrencyBtn.addEventListener('click', () => {
      const a = fromCurrency.value;
      fromCurrency.value = toCurrency.value;
      toCurrency.value = a;
      updateFlags();
      convertCurrency();
    });
  
    // ---------- Measurement: populate units ----------
    function populateUnits(){
      const type = measureType.value;
      const units = Object.keys(measurementUnits[type].units);
      fromUnit.innerHTML = "";
      toUnit.innerHTML = "";
      for(const u of units){
        fromUnit.add(new Option(u,u));
        toUnit.add(new Option(u,u));
      }
      // sensible defaults
      if (type === 'length'){ fromUnit.value='m'; toUnit.value='cm'; }
      if (type === 'weight'){ fromUnit.value='kg'; toUnit.value='g'; }
      if (type === 'volume'){ fromUnit.value='l'; toUnit.value='ml'; }
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
  
    // ---------- Measurement conversion ----------
    function convertMeasurement(){
      const type = measureType.value;
      const units = measurementUnits[type].units;
      const val = parseFloat(measureValue.value) || 0;
      const from = fromUnit.value, to = toUnit.value;
      // convert: value (from) -> base -> to
      const baseVal = val * units[from]; // e.g. meters
      const result = baseVal / units[to];
      measureResult.textContent = `${val} ${from} → ${Number(result.toPrecision(12))} ${to}`;
    }
  
    convertMeasureBtn.addEventListener('click', convertMeasurement);
    measureValue.addEventListener('input', convertMeasurement);
    fromUnit.addEventListener('change', convertMeasurement);
    toUnit.addEventListener('change', convertMeasurement);
  
    // ---------- Theme ----------
    function loadTheme(){
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') document.documentElement.classList.add('dark');
    }
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  
    // ---------- Init ----------
    function init(){
      populateCurrencySelects();
      populateUnits();
      loadTheme();
      // initial conversions
      convertCurrency();
      convertMeasurement();
    }
  
    document.addEventListener('DOMContentLoaded', init);
  })();
  