
const API_KEY = "80cb8368cec1da6260aabefe161c3d2d";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const unitBtn = document.getElementById("unitBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("errorMsg");
const weatherCard = document.getElementById("weatherCard");
const historyList = document.getElementById("historyList");

const cityNameEl = document.getElementById("cityName");
const weatherIconEl = document.getElementById("weatherIcon");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("description");
const humidityEl = document.getElementById("humidity");

let isCelsius = true;
let lastTempCelsius = null;

// ambil riwayat dari localStorage, kalau belum ada bikin array kosong
let searchHistory = JSON.parse(localStorage.getItem("history")) || [];

const showLoading = (state) => {
  loadingEl.classList.toggle("hidden", !state);
};

const showError = (msg) => {
  errorEl.textContent = msg;
  errorEl.classList.remove("hidden");
  weatherCard.classList.add("hidden");
};

const hideError = () => {
  errorEl.classList.add("hidden");
};

const getWeather = async (city) => {
  hideError();
  showLoading(true);
  weatherCard.classList.add("hidden");

  try {
    const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=id`;
    const res = await fetch(url);

    if (res.status === 404) {
      throw new Error("Kota tidak ditemukan, coba cek lagi nama kotanya");
    }

    if (!res.ok) {
      throw new Error("Terjadi kesalahan pada server, coba lagi nanti");
    }

    const data = await res.json();
    displayWeather(data);
    saveHistory(data.name);
  } catch (err) {
    
    if (err.message === "Failed to fetch") {
      showError("Tidak ada koneksi internet, cek jaringan kamu");
    } else {
      showError(err.message);
    }
  } finally {
    showLoading(false);
  }
};

const displayWeather = (data) => {
  lastTempCelsius = data.main.temp;

  cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
  weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  descEl.textContent = data.weather[0].description;
  humidityEl.textContent = `Kelembaban: ${data.main.humidity}%`;

  updateTempDisplay();

  weatherCard.classList.remove("hidden");
};

const updateTempDisplay = () => {
  if (lastTempCelsius === null) return;

  if (isCelsius) {
    tempEl.textContent = `${Math.round(lastTempCelsius)}°C`;
  } else {
    const fahrenheit = (lastTempCelsius * 9) / 5 + 32;
    tempEl.textContent = `${Math.round(fahrenheit)}°F`;
  }
};

const saveHistory = (city) => {
  
  searchHistory = searchHistory.filter((item) => item.toLowerCase() !== city.toLowerCase());
  searchHistory.unshift(city);

  
  if (searchHistory.length > 5) {
    searchHistory = searchHistory.slice(0, 5);
  }

  localStorage.setItem("history", JSON.stringify(searchHistory));
  renderHistory();
};

const renderHistory = () => {
  historyList.innerHTML = searchHistory
    .map((city) => `<li>${city}</li>`)
    .join("");
};

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city === "") {
    showError("Nama kota belum diisi");
    return;
  }
  getWeather(city);
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

historyList.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    cityInput.value = e.target.textContent;
    getWeather(e.target.textContent);
  }
});

clearHistoryBtn.addEventListener("click", () => {
  searchHistory = [];
  localStorage.removeItem("history");
  renderHistory();
});

unitBtn.addEventListener("click", () => {
  isCelsius = !isCelsius;
  unitBtn.textContent = isCelsius ? "Tampilkan dalam °F" : "Tampilkan dalam °C";
  updateTempDisplay();
});


renderHistory();
