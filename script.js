// Replace with your actual API keys
const accuweatherApiKey = "RpRlHf0IzBICaHbpAynyrbG2V1jlIRCi";
const openWeatherApiKey = "022267a673a319a6da4bf15f53706e37";

// Coordinates for Assam Engineering College
const latitude = 26.15789628555117;
const longitude = 91.6746041874584;

// DOM element to display weather information
const weatherContainer = document.getElementById("weather-container");

// Function to fetch weather data
async function getWeatherFixedLocation() {
    try {
        // Step 1: Get location key from AccuWeather
        const locationUrl = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${accuweatherApiKey}&q=${latitude},${longitude}`;
        const locationRes = await fetch(locationUrl);
        if (!locationRes.ok) throw new Error(`AccuWeather Location API error: ${locationRes.status}`);
        const locationData = await locationRes.json();
        const locationKey = locationData.Key;

        // Step 2: Fetch current conditions from AccuWeather
        const currentUrl = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${accuweatherApiKey}&details=true`;
        const currentRes = await fetch(currentUrl);
        if (!currentRes.ok) throw new Error(`AccuWeather Current Conditions API error: ${currentRes.status}`);
        const currentData = await currentRes.json();

        // Step 3: Fetch 5-day forecast from AccuWeather
        const forecastUrl = `https://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}?apikey=${accuweatherApiKey}&metric=true`;
        const forecastRes = await fetch(forecastUrl);
        if (!forecastRes.ok) throw new Error(`AccuWeather Forecast API error: ${forecastRes.status}`);
        const forecastData = await forecastRes.json();

        // Step 4: Fetch AQI data from OpenWeatherMap
        const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}`;
        const aqiRes = await fetch(aqiUrl);
        if (!aqiRes.ok) throw new Error(`OpenWeatherMap AQI API error: ${aqiRes.status}`);
        const aqiData = await aqiRes.json();

        // Display the fetched data
        displayWeather(currentData[0], forecastData, aqiData);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Failed to load weather data. Please check API keys or network.");
    }
}

// Function to display weather data
function displayWeather(current, forecast, aqiData) {
    const today = new Date().toDateString();

    // AQI value and mapping
    const aqi = aqiData.list[0].main.aqi;
    const aqiText = {
        1: "Good",
        2: "Fair",
        3: "Moderate",
        4: "Poor",
        5: "Very Poor"
    };
    const aqiColor = {
        1: "#009966",
        2: "#ffde33",
        3: "#ff9933",
        4: "#cc0033",
        5: "#660099"
    };

    // Construct HTML content
    weatherContainer.innerHTML = `
        <div class="card float-card">
            <h2 class="weather-heading"><i class="bx bx-cloud"></i> Weather at Assam Engineering College</h2>
            <h3>${today}</h3>
            <h1 class="temperature-display">${current.Temperature.Metric.Value}°C</h1>
            <p>${current.WeatherText}</p>
            <p>Humidity: ${current.RelativeHumidity}%</p>
            <p>Wind: ${current.Wind.Speed.Metric.Value} ${current.Wind.Speed.Metric.Unit}</p>
        </div>

        <div class="card">
            <h3>5-Day Forecast - Assam Engineering College</h3>
            <div class="forecast-days">
                ${forecast.DailyForecasts.map(day => `
                    <div class="forecast-day-card">
                        <p class="forecast-date">${new Date(day.Date).toDateString()}</p>
                        <img class="forecast-icon" src="https://developer.accuweather.com/sites/default/files/${String(day.Day.Icon).padStart(2, '0')}-s.png" alt="icon" />
                        <p class="forecast-temp">${day.Temperature.Minimum.Value}°C - ${day.Temperature.Maximum.Value}°C</p>
                    </div>
                `).join("")}
            </div>
        </div>

        <div class="card">
            <h3>Air Quality Index (AQI)</h3>
            <p style="color: ${aqiColor[aqi]}; font-weight: bold; font-size: 1.2rem;">
                ${aqiText[aqi]} (AQI: ${aqi})
            </p>
            <p>AQI levels range from 1 (Good) to 5 (Very Poor).</p>
        </div>
    `;
}

// Function to set up auto-refresh controls
function setupAutoRefreshControls() {
    let intervalId = null;
    let countdown = 5;
    let countdownInterval = null;

    // Create control card
    const controlCard = document.createElement("div");
    controlCard.className = "card float-card";
    controlCard.style.textAlign = "center";
    controlCard.style.marginTop = "20px";
    controlCard.style.padding = "20px";

    controlCard.innerHTML = `
        <h3><i class="bx bx-sync"></i> Auto-Refresh Controls</h3>
        <button id="toggle-refresh" class="auto-refresh-button">Start Auto-Refresh</button>
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
        countdown = 5;
        countdownDisplay.textContent = `Next update in ${countdown} seconds`;

        intervalId = setInterval(() => {
            getWeatherFixedLocation();
            countdown = 5;
        }, 5000);

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

// Initialize on window load
window.onload = () => {
    getWeatherFixedLocation();
    setupAutoRefreshControls();
};
