const apiKey = "8d158ca37bd2b937de0cb23bb5f24c18"; // Replace with your actual API key
const weatherContainer = document.getElementById("weather-container");

// Fixed coordinates for Assam Engineering College
const latitude = 26.15789628555117;
const longitude = 91.6746041874584; 

async function getWeatherFixedLocation() {
    try {
        // Reverse geocoding to verify coordinates
        const reverseGeocodeUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
        
        const response = await fetch(reverseGeocodeUrl);
        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status}`);
        }
        
        const locationData = await response.json();
        console.log("Location Data:", locationData); // Log the location data

        // Current weather data
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        // 5-day / 3-hour forecast data
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        const [weatherRes, forecastRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl)
        ]);

        // Check if the responses are ok
        if (!weatherRes.ok) {
            throw new Error(`Weather API error: ${weatherRes.status}`);
        }
        if (!forecastRes.ok) {
            throw new Error(`Forecast API error: ${forecastRes.status}`);
        }

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

    // Display the location name from the weather data
    weatherContainer.innerHTML = `
        <div class="card">
            <h2>${current.name}, ${current.sys.country}</h2> <!-- Display city and country -->
            <p>${today}</p>
            <h1>${current.main.temp.toFixed(1)}°C</h1> <!-- Display temperature with one decimal -->
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
                            <p>${item.temp.toFixed(1)}°C</p> <!-- Display temperature with one decimal -->
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
