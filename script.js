const apiKey = "7c12485a133444a89a7165859252105"; // Replace with your WeatherAPI key
const weatherContainer = document.getElementById("weather-container");

// Coordinates for Assam Engineering College
const latitude = 26.15789628555117;
const longitude = 91.6746041874584;

async function getWeatherFixedLocation() {
    try {
        const query = `${latitude},${longitude}`;

        // Current Weather
        const currentUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}`;

        // 5-Day Forecast
        const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=5`;

        const [currentRes, forecastRes] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl)
        ]);

        if (!currentRes.ok) throw new Error(`Current API error: ${currentRes.status}`);
        if (!forecastRes.ok) throw new Error(`Forecast API error: ${forecastRes.status}`);

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        displayWeather(currentData, forecastData);
    } catch (error) {
        console.error("Error fetching WeatherAPI data:", error);
        alert("Failed to load data. Please check your API key and internet connection.");
    }
}

function displayWeather(current, forecast) {
    const today = new Date().toDateString();

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
    `;
}

// Run on page load
window.onload = getWeatherFixedLocation;
