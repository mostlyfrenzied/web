const apiKey = "7222f4612b4123ade9532cc64a7dad09";
const weatherContainer = document.getElementById("weather-container");

// Fixed coordinates for Assam Engineering College
const latitude = 26.14287227388668;
const longitude = 91.6597967797107;

async function getWeatherFixedLocation() {
    try {
        // Current weather data
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        // 5-day / 3-hour forecast data
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        const [weatherRes, forecastRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl)
        ]);

        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();

        displayWeather(weatherData, forecastData);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Failed to load weather data. Please check your API key and internet connection.");
    }
}

function displayWeather(current, forecast) {
    const today = new Date().toDateString();

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
                ${getDailyForecast(forecast.list)
                    .map(item => `
                        <div style="margin: 10px;">
                            <p>${item.date}</p>
                            <img src="http://openweathermap.org/img/wn/${item.icon}@2x.png" alt="icon">
                            <p>${item.temp}°C</p>
                        </div>
                    `)
                    .join("")}
            </div>
        </div>
    `;
}

// Extract one forecast per day around 12:00 PM
function getDailyForecast(list) {
    const result = [];
    const seenDates = new Set();

    for (let i = 0; i < list.length; i++) {
        const dt = new Date(list[i].dt_txt);
        const dateStr = dt.toDateString();

        if (dt.getHours() === 12 && !seenDates.has(dateStr)) {
            seenDates.add(dateStr);
            result.push({
                date: dateStr,
                temp: list[i].main.temp,
                icon: list[i].weather[0].icon
            });
        }

        if (result.length === 5) break;
    }

    return result;
}

// Run on page load
window.onload = getWeatherFixedLocation;
