const openWeatherApiKey = "89e798baf769942793533270585500b2";

// Coordinates for Assam Engineering College
const latitude = 26.15789628555117;
const longitude = 91.6746041874584;

// Container for weather info
const weatherContainer = document.getElementById("weather-container");

// Fetch weather data (current, forecast, AQI)
async function getWeatherFixedLocation() {
  try {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}&units=metric`;
    const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}`;

    const currentRes = await fetch(currentUrl);
    if (!currentRes.ok) throw new Error(`Current Weather API error: ${currentRes.status}`);
    const currentData = await currentRes.json();

    const forecastRes = await fetch(forecastUrl);
    if (!forecastRes.ok) throw new Error(`Forecast API error: ${forecastRes.status}`);
    const forecastData = await forecastRes.json();

    const aqiRes = await fetch(aqiUrl);
    if (!aqiRes.ok) throw new Error(`AQI API error: ${aqiRes.status}`);
    const aqiData = await aqiRes.json();

    displayWeather(currentData, forecastData, aqiData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    weatherContainer.innerHTML = `<p style="color:red; font-weight: bold;">Failed to load weather data. Please try again later.</p>`;
  }
}

function getOpenWeatherIconUrl(iconCode) {
  return `https://rodrigokamada.github.io/openweathermap/images/${iconCode}_t@2x.png`;
}

function displayWeather(current, forecast, aqiData) {
  const tzOffset = forecast.city.timezone;
  const today = new Date(Date.now() + tzOffset * 1000).toDateString();

  const aqi = aqiData.list[0].main.aqi;
  const aqiText = {
    1: "Good",
    2: "Fair",
    3: "Moderate",
    4: "Poor",
    5: "Very Poor",
  };
  const aqiColor = {
    1: "#009966",
    2: "#ffde33",
    3: "#ff9933",
    4: "#cc0033",
    5: "#660099",
  };

  const dailyForecasts = {};
  forecast.list.forEach((item) => {
    const localDt = new Date((item.dt + tzOffset) * 1000);
    const dateStr = localDt.toISOString().split("T")[0];
    if (!dailyForecasts[dateStr]) dailyForecasts[dateStr] = [];
    dailyForecasts[dateStr].push(item);
  });

  const forecastDays = Object.keys(dailyForecasts)
    .slice(0, 5)
    .map((dateStr) => {
      const dayForecasts = dailyForecasts[dateStr];
      const middayForecast = dayForecasts.reduce((prev, curr) => {
        const prevHour = new Date((prev.dt + tzOffset) * 1000).getHours();
        const currHour = new Date((curr.dt + tzOffset) * 1000).getHours();
        return Math.abs(currHour - 12) < Math.abs(prevHour - 12) ? curr : prev;
      });
      return {
        date: dateStr,
        temp_min: Math.min(...dayForecasts.map((f) => f.main.temp_min)),
        temp_max: Math.max(...dayForecasts.map((f) => f.main.temp_max)),
        icon: middayForecast.weather[0].icon,
        description: middayForecast.weather[0].description,
      };
    });

  weatherContainer.innerHTML = `
    <div class="main-weather-layout">
      <div class="left-column">
        <div class="card float-card">
          <h2 class="weather-heading"><i class="bx bx-cloud"></i> Weather at Assam Engineering College</h2>
          <h3>${today}</h3>
          <h1 class="temperature-display">${current.main.temp.toFixed(1)}°C</h1>
          <p style="text-transform: capitalize;">${current.weather[0].description}</p>
          <p>Humidity: ${current.main.humidity}%</p>
          <p>Wind: ${current.wind.speed} m/s</p>

          <div class="right-column">
            <div class="card">
              <h3>Air Quality Index (AQI)</h3>
              <p style="color: ${aqiColor[aqi]}; font-weight: bold; font-size: 1.2rem;">
                ${aqiText[aqi]} (AQI: ${aqi})
              </p>
              <p>AQI levels range from 1 (Good) to 5 (Very Poor).</p>
            </div>
          </div>

          <div class="map-embed" style="margin-top: 20px">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.123456789!2d91.65972!3d26.14278!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sAssam%20Engineering%20College!5e0!3m2!1sen!2sin!4v1234567890"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>

        <div class="card">
          <h3>5-Day Forecast - Assam Engineering College</h3>
          <div class="forecast-days">
            ${forecastDays
              .map(
                (day) => `
              <div class="forecast-day-card">
                <p class="forecast-date">${new Date(day.date).toDateString()}</p>
                <img class="forecast-icon" src="${getOpenWeatherIconUrl(day.icon)}" alt="icon" />
                <p class="forecast-temp">${day.temp_min.toFixed(1)}°C - ${day.temp_max.toFixed(1)}°C</p>
                <p style="text-transform: capitalize;">${day.description}</p>
              </div>`
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function setupAutoRefreshControls() {
  let intervalId = null;
  let countdown = 10;
  let countdownInterval = null;

  if (document.querySelector(".auto-refresh-control")) return;

  const controlCard = document.createElement("div");
  controlCard.className = "card float-card auto-refresh-control";
  controlCard.style.textAlign = "center";
  controlCard.style.marginTop = "20px";
  controlCard.style.padding = "20px";

  controlCard.innerHTML = `
    <h3><i class="bx bx-sync"></i> Auto-Refresh Controls</h3>
    <button id="toggle-refresh" class="auto-refresh-button" style="background-color:#0099cc; color:#fff; border:none; padding: 8px 16px; border-radius: 5px; cursor: pointer;">Start Auto-Refresh</button>
    <p id="countdown" style="font-size: 14px; color: #555; margin-top: 10px;">Auto-refresh is off</p>
  `;

  document.body.appendChild(controlCard);

  const toggleButton = document.getElementById("toggle-refresh");
  const countdownDisplay = document.getElementById("countdown");

  toggleButton.addEventListener("click", () => {
    if (intervalId === null) {
      startAutoRefresh();
      toggleButton.textContent = "Stop Auto-Refresh";
      toggleButton.style.backgroundColor = "#f44336";
    } else {
      stopAutoRefresh();
      toggleButton.textContent = "Start Auto-Refresh";
      toggleButton.style.backgroundColor = "#0099cc";
    }
  });

  function startAutoRefresh() {
    countdown = 10;
    countdownDisplay.textContent = `Next update in ${countdown} seconds`;

    intervalId = setInterval(() => {
      getWeatherFixedLocation();
      countdown = 10;
    }, 10000);

    countdownInterval = setInterval(() => {
      countdown--;
      countdownDisplay.textContent = `Next update in ${countdown} seconds`;
    }, 1000);
  }

  function stopAutoRefresh() {
    clearInterval(intervalId);
    clearInterval(countdownInterval);
    intervalId = null;
    countdownInterval = null;
    countdownDisplay.textContent = "Auto-refresh is off";
  }
}

window.onload = () => {
  getWeatherFixedLocation();
  setupAutoRefreshControls();
};
