const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.getElementById("currentWeather");
const weatherCardsDiv = document.getElementById("weatherCards");

const initialCards = Array.from({
  length: 5
}, (_, index) => `
    <div class="card">
        <h3>( ______ )</h3>
        <h6>Temp: __C/F</h6>
        <h6>Wind: __ M/S</h6>
        <h6>Humidity: __%</h6>
    </div>
`).join("");
weatherCardsDiv.innerHTML = initialCards;

const API_KEY = "714137a7764187221c63bfd37cef54b8";

const createWeatherCard = (cityName, weatherItem, index) => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const date = new Date(weatherItem.dt_txt);
  const dayOfWeek = daysOfWeek[date.getDay()];
  const celsiusTemp = (weatherItem.main.temp - 273.15).toFixed(0);
  const fahrenheitTemp = ((celsiusTemp * 9) / 5 + 32).toFixed(0);

  if (index === 0) {
    return `
      <div class="current-weather">
        <h2>${cityName}, ${weatherItem.dt_txt.split(" ")[0]}</h2>
        <div class="details">
          <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
        </div>
        <div class="details">
        <h6>Temperature: ${celsiusTemp}°C / ${fahrenheitTemp}°F</h6>
        <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
        <h6>Humidity: ${weatherItem.main.humidity}%</h6>
      </div>
      </div>
    `;
  } else {
    return `<div class="card">
      <h3>${dayOfWeek} ${weatherItem.dt_txt.split(" ")[0]}</h3>
      <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
      <h6>Temp: ${celsiusTemp}°C / ${fahrenheitTemp}°F</h6>
      <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
      <h6>Humidity: ${weatherItem.main.humidity}%</h6>
    </div>`;
  }
};


const getWeatherDetails = (cityName, latitude, longitude) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then((response) => response.json())
    .then((data) => {
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML("beforeend", html);
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        }
      });
    })
    .catch(() => {
      alert("An error occurred while fetching the weather forecast!");
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (cityName === "") return;

  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data.length) return alert(`No coordinates found for ${cityName}`);
      const {
        lat,
        lon,
        name
      } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates!");
    });
};

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const {
        latitude,
        longitude
      } = position.coords;
      const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

      fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
          const {
            name
          } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("An error occurred while fetching the city name!");
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "Geolocation request denied. Please reset location permission to grant access again."
        );
      } else {
        alert("Geolocation request error. Please reset location permission.");
      }
    }
  );
};

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", (e) =>
  e.key === "Enter" && getCityCoordinates()
); 

