const apiKey = "8b0fd675aa66b485893a61b35853b812";
const weatherContainer = document.getElementById("weather-container");

// Fixed coordinates for Assam Engineering College
const latitude = 26.1433;
const longitude = 91.7898;

// Function to fetch and display weather data for fixed location
async function getWeatherFixedLocation() {
    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        const [weatherRes, forecastRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl)
        ]);

        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();

        displayWeather(weatherData, forecastData);
    } catch (error) {
        alert("Error fetching weather data. Please try again.");
        console.error(error);
    }
}

// Function to display current weather and 5-day forecast
function displayWeather(current, forecast) {
    const now = new Date();
    const today = now.toDateString();

    weatherContainer.innerHTML = `
        <div class="card">
            <h2>${current.name}</h2>
            <p>${today}</p>
            <h1>${current.main.temp}°C</h1>
            <p>${current.weather[0].description}</p>
            <p>Humidity: ${current.main.humidity}%</p>
            <p>Sunrise: ${new Date(current.sys.sunrise * 1000).toLocaleTimeString()}</p>
            <p>Sunset: ${new Date(current.sys.sunset * 1000).toLocaleTimeString()}</p>
        </div>
        <div class="card">
            <h3>5-Day Forecast</h3>
            <div style="display: flex; flex-wrap: wrap;">
                ${forecast.list
                    .filter(item => item.dt_txt.includes("12:00:00"))
                    .map(item => `
                        <div style="margin: 10px;">
                            <p>${new Date(item.dt_txt).toDateString()}</p>
                            <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="icon">
                            <p>${item.main.temp}°C</p>
                        </div>
                    `)
                    .join("")}
            </div>
        </div>
    `;
}

// Automatically load weather on page load
window.onload = getWeatherFixedLocation;
