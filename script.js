const openWeatherApiKey = "89e798baf769942793533270585500b2";

// Coordinates for Assam Engineering College
const latitude = 26.15789628555117;
const longitude = 91.6746041874584;

// DOM element to display weather information
const weatherContainer = document.getElementById("weather-container");

// Fetch weather, forecast, and AQI data from OpenWeatherMap
async function getWeatherFixedLocation() {
    try {
        // Fetch current weather
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}&units=metric`;
        const weatherRes = await fetch(weatherUrl);
        if (!weatherRes.ok) throw new Error(`Weather API error: ${weatherRes.status}`);
        const weatherData = await weatherRes.json();

        // Fetch 5-day forecast (3-hour intervals)
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}&units=metric`;
        const forecastRes = await fetch(forecastUrl);
        if (!forecastRes.ok) throw new Error(`Forecast API error: ${forecastRes.status}`);
        const forecastData = await forecastRes.json();

        // Fetch AQI data
        const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}`;
        const aqiRes = await fetch(aqiUrl);
        if (!aqiRes.ok) throw new Error(`AQI API error: ${aqiRes.status}`);
        const aqiData = await aqiRes.json();

        // Display everything
        displayWeather(weatherData, forecastData, aqiData);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Failed to load weather data. Please check API keys or network.");
    }
}

// Display data function
function displayWeather(current, forecast, aqiData) {
    const today = new Date().toDateString();

    // AQI mapping from OpenWeatherMap (1 to 5)
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

    // OpenWeatherMap icon URL helper
    function getIconUrl(iconCode) {
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    }

    // Group forecast by day (show 5 days)
    const dailyForecasts = {};
    forecast.list.forEach(item => {
        const dateStr = item.dt_txt.split(" ")[0];
        if (!dailyForecasts[dateStr]) {
            dailyForecasts[dateStr] = [];
        }
        dailyForecasts[dateStr].push(item);
    });

    // Reduce to one forecast per day (e.g. midday)
    const forecastDays = Object.keys(dailyForecasts).slice(0, 5).map(dateStr => {
        // Pick the forecast closest to 12:00 PM
        const dayForecasts = dailyForecasts[dateStr];
        let middayForecast = dayForecasts.reduce((prev, curr) => {
            const prevHour = parseInt(prev.dt_txt.split(" ")[1].split(":")[0]);
            const currHour = parseInt(curr.dt_txt.split(" ")[1].split(":")[0]);
            return Math.abs(currHour - 12) < Math.abs(prevHour - 12) ? curr : prev;
        });
        return {
            date: dateStr,
            temp_min: Math.min(...dayForecasts.map(f => f.main.temp_min)),
            temp_max: Math.max(...dayForecasts.map(f => f.main.temp_max)),
            icon: middayForecast.weather[0].icon,
            description: middayForecast.weather[0].description
        };
    });

    weatherContainer.innerHTML = `
        <div class="card float-card">
            <h2 class="weather-heading"><i class="bx bx-cloud"></i> Weather at Assam Engineering College</h2>
            <h3>${today}</h3>
            <h1 class="temperature-display">${current.main.temp.toFixed(1)}°C</h1>
            <p>${current.weather[0].description}</p>
            <p>Humidity: ${current.main.humidity}%</p>
            <p>Wind: ${current.wind.speed} m/s</p>
            <img src="${getIconUrl(current.weather[0].icon)}" alt="weather icon" />
        </div>

        <div class="card">
            <h3>5-Day Forecast - Assam Engineering College</h3>
            <div class="forecast-days" style="display: flex; gap: 10px;">
                ${forecastDays.map(day => `
                    <div class="forecast-day-card" style="text-align:center;">
                        <p class="forecast-date">${new Date(day.date).toDateString()}</p>
                        <img class="forecast-icon" src="${getIconUrl(day.icon)}" alt="icon" />
                        <p class="forecast-temp">${day.temp_min.toFixed(1)}°C - ${day.temp_max.toFixed(1)}°C</p>
                        <p style="text-transform: capitalize;">${day.description}</p>
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

// Auto-refresh controls (same as your previous code, adapted)
function setupAutoRefreshControls() {
    let intervalId = null;
    let countdown = 10;
    let countdownInterval = null;

    const controlCard = document.createElement("div");
    controlCard.className = "card float-card";
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

// Initialize on window load
window.onload = () => {
    getWeatherFixedLocation();
    setupAutoRefreshControls();
};
