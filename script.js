const apiKey = "4bcbafb80febfbd82f2a2f67e2b3d0ea";
const weatherContainer = document.getElementById("weather-container");
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("city_input");
const clockDisplay = document.getElementById("clock");
const notification = document.getElementById("notification");

let intervalId = null;
let lastWeather = null;

// Live clock update
setInterval(() => {
    const now = new Date();
    clockDisplay.textContent = `Local Time: ${now.toLocaleTimeString()}`;
}, 1000);

searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
        clearInterval(intervalId);
        getWeatherData(city);
        intervalId = setInterval(() => getWeatherData(city), 60000); // 60 seconds
    }
});

async function getWeatherData(city) {
    weatherContainer.innerHTML = `<p>Loading...</p>`;
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();
        if (data.cod === 200) {
            checkForChanges(data);
            displayWeather(data);
            lastWeather = data;
        } else {
            weatherContainer.innerHTML = `<p>City not found: ${data.message}</p>`;
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
        weatherContainer.innerHTML = `<p>Failed to load data.</p>`;
    }
}

function checkForChanges(newData) {
    if (!lastWeather) return;

    const tempDiff = Math.abs(newData.main.temp - lastWeather.main.temp);
    const conditionChanged = newData.weather[0].main !== lastWeather.weather[0].main;

    if (tempDiff >= 2 || conditionChanged) {
        showNotification("Weather has changed significantly!");
    }
}

function showNotification(message) {
    notification.textContent = message;
    notification.style.display = "block";
    setTimeout(() => {
        notification.style.display = "none";
    }, 5000);
}

function displayWeather(data) {
    const html = `
        <div class="card">
            <h2>Current Weather in ${data.name}, ${data.sys.country}</h2>
            <p><strong>Temperature:</strong> ${data.main.temp}&deg;C</p>
            <p><strong>Weather:</strong> ${data.weather[0].description}</p>
            <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
            <p><strong>Wind:</strong> ${data.wind.speed} m/s</p>
            <p><em>Last updated: ${new Date().toLocaleTimeString()}</em></p>
        </div>
    `;
    weatherContainer.innerHTML = html;
}
