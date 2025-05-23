const weatherApiKey = "7c12485a133444a89a7165859252105"; // Your WeatherAPI key
const openWeatherApiKey = "8d158ca37bd2b937de0cb23bb5f24c18"; // Put your OpenWeatherMap API key here for AQI

const weatherContainer = document.getElementById("weather-container");

// Coordinates for Assam Engineering College
const latitude = 26.15789628555117;
const longitude = 91.6746041874584;

async function getWeatherFixedLocation() {
    try {
        const query = `${latitude},${longitude}`;

        // Current Weather (WeatherAPI)
        const currentUrl = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${query}`;

        // 5-Day Forecast (WeatherAPI)
        const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${query}&days=5`;

        // AQI (OpenWeatherMap Air Pollution API)
        const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${openWeatherApiKey}`;

        // Fetch all three in parallel
        const [currentRes, forecastRes, aqiRes] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl),
            fetch(aqiUrl)
        ]);

        if (!currentRes.ok) throw new Error(`Current API error: ${currentRes.status}`);
        if (!forecastRes.ok) throw new Error(`Forecast API error: ${forecastRes.status}`);
        if (!aqiRes.ok) throw new Error(`AQI API error: ${aqiRes.status}`);

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();
        const aqiData = await aqiRes.json();

        displayWeather(currentData, forecastData, aqiData);
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load data. Please check your API keys and internet connection.");
    }
}

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

    weatherContainer.innerHTML = `
        <div class="card float-card">
            <h2 class="weather-heading"><i class="bx bx-cloud"></i> Weather at Assam Engineering College</h2>
            <h3>${today}</h3>
            <h1 class="temperature-display">${current.current.temp_c}°C</h1>
            <p>${current.current.condition.text}</p>
            <p>Humidity: ${current.current.humidity}%</p>
            <p>Sunrise: ${forecast.forecast.forecastday[0].astro.sunrise}</p>
            <p>Sunset: ${forecast.forecast.forecastday[0].astro.sunset}</p>
        </div>
        <div class="card">
            <h3>5-Day Forecast - Assam Engineering College</h3>
            <div style="display: flex; flex-wrap: wrap;">
                ${forecast.forecast.forecastday
                    .map(day => `
                        <div style="margin: 10px; text-align: center;">
                            <p>${day.date}</p>
                            <img src="https:${day.day.condition.icon}" alt="icon">
                            <p>${day.day.avgtemp_c}°C</p>
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

window.onload = () => {
    getWeatherFixedLocation(); // Initial fetch
    setupAutoRefreshControls(); // Add buttons and logic
};

function setupAutoRefreshControls() {
    let intervalId = null;
    let countdown = 5;
    let countdownInterval = null;

    // Create a styled card container like your other cards
    const controlCard = document.createElement("div");
    controlCard.className = "card float-card";
    controlCard.style.textAlign = "center";
    controlCard.style.marginTop = "20px";
    controlCard.style.padding = "20px";

    controlCard.innerHTML = `
        <h3><i class="bx bx-sync"></i> Auto-Refresh Controls</h3>
        <button id="toggle-refresh" style="
            padding: 10px 20px;
            font-size: 16px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 10px;
        ">Start Auto-Refresh</button>
        <p id="countdown" style="
            font-size: 14px;
            color: #555;
            margin-top: 10px;
        ">Auto-refresh is off</p>
    `;

    document.body.appendChild(controlCard);

    const toggleButton = document.getElementById("toggle-refresh");
    const countdownDisplay = document.getElementById("countdown");

    toggleButton.addEventListener("click", () => {
        if (intervalId === null) {
            startAutoRefresh();
            toggleButton.textContent = "Stop Auto-Refresh";
            toggleButton.style.backgroundColor = "#f44336"; // Red
        } else {
            stopAutoRefresh();
            toggleButton.textContent = "Start Auto-Refresh";
            toggleButton.style.backgroundColor = "#4CAF50"; // Green
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
