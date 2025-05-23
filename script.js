const weatherstackApiKey = "822281beda6fe9935910b8dab9b45d9e"; // Replace with your Weatherstack API key
const weatherApiKey = "RpRlHf0IzBICaHbpAynyrbG2V1jlIRCi"; // Replace with your WeatherAPI key
const openWeatherApiKey = "022267a673a319a6da4bf15f53706e37"; // Replace with your OpenWeatherMap API key

const weatherContainer = document.getElementById("weather-container");

// Assam Engineering College Coordinates
const latitude = 26.15789628555117;
const longitude = 91.6746041874584;

async function getWeatherFixedLocation() {
    try {
        const query = `${latitude},${longitude}`;

        const currentUrl = `http://api.weatherstack.com/current?access_key=${weatherstackApiKey}&query=${query}`;
        const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${query}&days=5`;
        const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}`;

        const [currentRes, forecastRes, aqiRes] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl),
            fetch(aqiUrl)
        ]);

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();
        const aqiData = await aqiRes.json();

        if (currentData.error) throw new Error(currentData.error.info);

        displayWeather(currentData, forecastData, aqiData);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Failed to load weather data. Please check API keys or network.");
    }
}

function displayWeather(current, forecast, aqiData) {
    const today = new Date().toDateString();
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

    weatherContainer.innerHTML = `
        <div class="card float-card">
            <h2 class="weather-heading"><i class="bx bx-cloud"></i> Weather at Assam Engineering College</h2>
            <h3>${today}</h3>
            <h1 class="temperature-display">${current.current.temperature}°C</h1>
            <p>${current.current.weather_descriptions[0]}</p>
            <p>Humidity: ${current.current.humidity}%</p>
            <p>Wind: ${current.current.wind_speed} km/h</p>
        </div>

        <div class="card">
            <h3>5-Day Forecast - Assam Engineering College</h3>
            <div class="forecast-days">
                ${forecast.forecast.forecastday
                    .map(day => `
                        <div class="forecast-day-card">
                            <p class="forecast-date">${day.date}</p>
                            <img class="forecast-icon" src="https:${day.day.condition.icon}" alt="icon" />
                            <p class="forecast-temp">${day.day.avgtemp_c}°C</p>
                        </div>
                    `)
                    .join("")}
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

function setupAutoRefreshControls() {
    let intervalId = null;
    let countdown = 5;
    let countdownInterval = null;

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

window.onload = () => {
    getWeatherFixedLocation();
    setupAutoRefreshControls();
};
