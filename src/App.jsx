import { useEffect, useMemo, useState } from "react";
import "./App.css";

const profiles = {
  Fitness: {
    emoji: "🏃",
    title: "Outdoor conditions look good",
    description: "Your workout window is based on temperature, wind, UV and air quality.",
  },
  Health: {
    emoji: "❤️",
    title: "Your health weather summary",
    description: "Air quality, humidity and UV are prioritized for sensitive users.",
  },
  Travel: {
    emoji: "✈️",
    title: "Travel conditions for today",
    description: "Check rain, visibility, wind and weather before heading out.",
  },
  Family: {
    emoji: "👨‍👩‍👧",
    title: "Family-friendly weather",
    description: "Commute conditions, rain probability and alerts are highlighted.",
  },
};

const weatherText = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm + hail",
  99: "Severe thunderstorm",
};

const weatherEmoji = (code) => {
  if ([0, 1].includes(code)) return "☀️";
  if ([2, 3].includes(code)) return "⛅";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌤️";
};

function App() {
  const [profile, setProfile] = useState("Fitness");
  const [location, setLocation] = useState({
    name: "Faridabad",
    latitude: 28.4089,
    longitude: 77.3178,
  });

  const [weather, setWeather] = useState(null);
  const [air, setAir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [destinations, setDestinations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mausam-destinations")) || [
        { name: "New Delhi", latitude: 28.6139, longitude: 77.209 },
      ];
    } catch {
      return [];
    }
  });

  const currentProfile = profiles[profile];

  useEffect(() => {
    loadWeather(location);
  }, [location]);

  useEffect(() => {
    localStorage.setItem("mausam-destinations", JSON.stringify(destinations));
  }, [destinations]);

  async function loadWeather(place) {
    setLoading(true);
    setMessage("");

    try {
      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}` +
        `&longitude=${place.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation` +
        `&hourly=temperature_2m,precipitation_probability,uv_index,wind_speed_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset` +
        `&timezone=auto&forecast_days=7`;

      const airUrl =
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${place.latitude}` +
        `&longitude=${place.longitude}` +
        `&current=pm2_5,pm10,us_aqi,uv_index` +
        `&timezone=auto`;

      const [weatherResponse, airResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(airUrl),
      ]);

      if (!weatherResponse.ok || !airResponse.ok) {
        throw new Error("API error");
      }

      setWeather(await weatherResponse.json());
      setAir(await airResponse.json());
    } catch (error) {
      setMessage("Unable to load live weather. Check your internet connection.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setMessage("Location is not supported by this browser.");
      return;
    }

    setMessage("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`
          );
          const data = await response.json();

          setLocation({
            name: data.results?.[0]?.name || "Current Location",
            latitude: lat,
            longitude: lon,
          });
        } catch {
          setLocation({
            name: "Current Location",
            latitude: lat,
            longitude: lon,
          });
        }

        setMessage("");
      },
      () => {
        setMessage("Location permission denied. Showing Faridabad.");
      }
    );
  }

  async function searchLocation(event) {
    event.preventDefault();

    if (!search.trim()) return;

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          search
        )}&count=1&language=en&format=json`
      );

      const data = await response.json();

      if (!data.results?.length) {
        setMessage("Location not found.");
        return;
      }

      const result = data.results[0];

      setLocation({
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
      });

      setSearch("");
    } catch {
      setMessage("Could not search location.");
    }
  }

  function saveCurrentDestination() {
    const alreadySaved = destinations.some(
      (item) =>
        Math.abs(item.latitude - location.latitude) < 0.01 &&
        Math.abs(item.longitude - location.longitude) < 0.01
    );

    if (alreadySaved) {
      setMessage("Destination already saved.");
      return;
    }

    setDestinations((old) => [
      ...old,
      {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
      },
    ]);

    setMessage(`${location.name} saved successfully.`);
  }

  const current = weather?.current;
  const daily = weather?.daily;
  const hourly = weather?.hourly;

  const currentAQI = air?.current?.us_aqi ?? "--";
  const pm25 = air?.current?.pm2_5 ?? "--";
  const uv = air?.current?.uv_index ?? "--";

  const aqiLabel = (value) => {
    if (value === "--") return "Loading";
    if (value <= 50) return "Good";
    if (value <= 100) return "Moderate";
    if (value <= 150) return "Unhealthy for sensitive users";
    if (value <= 200) return "Unhealthy";
    return "Very unhealthy";
  };

  const rainProbability = daily?.precipitation_probability_max?.[0] ?? "--";

  const recommendation = useMemo(() => {
    if (!current) return "Loading your personalized recommendation...";

    const temp = current.temperature_2m;
    const wind = current.wind_speed_10m;

    if (profile === "Fitness") {
      if (currentAQI !== "--" && currentAQI > 100)
        return "Air quality is not ideal. Consider an indoor workout today.";
      if (uv !== "--" && uv >= 7)
        return "UV is high. Prefer an early morning or evening workout.";
      if (temp >= 35)
        return "It's hot outside. Exercise during the cooler morning or evening hours.";
      return "Conditions are suitable for outdoor exercise. Stay hydrated.";
    }

    if (profile === "Health") {
      if (currentAQI !== "--" && currentAQI > 100)
        return "Sensitive users should reduce prolonged outdoor exposure.";
      if (uv !== "--" && uv >= 7)
        return "High UV detected. Use sun protection when outdoors.";
      return "Current humidity and weather conditions are relatively comfortable.";
    }

    if (profile === "Travel") {
      if (rainProbability !== "--" && rainProbability >= 60)
        return "Rain is likely today. Carry rain protection before travelling.";
      if (wind >= 30)
        return "Strong winds are expected. Check travel conditions before departure.";
      return "Travel conditions look favourable. Keep checking alerts for changes.";
    }

    if (rainProbability !== "--" && rainProbability >= 60)
      return "Rain may affect school or family commute. Carry rain protection.";
    return "No major weather concern for the family commute right now.";
  }, [current, profile, currentAQI, uv, rainProbability]);

  const alerts = [];

  if (current?.weather_code >= 95) {
    alerts.push("Thunderstorm conditions detected. Stay indoors when possible.");
  }

  if (rainProbability !== "--" && rainProbability >= 70) {
    alerts.push(`High rain probability today: ${rainProbability}%.`);
  }

  if (currentAQI !== "--" && currentAQI > 150) {
    alerts.push("Air quality is unhealthy. Limit prolonged outdoor activity.");
  }

  if (!alerts.length) {
    alerts.push("No major weather alerts detected for your current location.");
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">☁️</div>
          <div>
            <strong>Mausam</strong>
            <small>Personal Weather Intelligence</small>
          </div>
        </div>

        <div className="nav-actions">
          <form className="search" onSubmit={searchLocation}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city..."
            />
            <button>🔎</button>
          </form>

          <button className="location-button" onClick={useMyLocation}>
            📍 My Location
          </button>

          <div className="avatar">RK</div>
        </div>
      </nav>

      <main>
        {message && <div className="message">{message}</div>}

        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">PERSONALIZED WEATHER INTELLIGENCE</p>

            <h1>
              Weather that
              <br />
              <span>understands you.</span>
            </h1>

            <p className="hero-description">
              Mausam adapts weather information to your lifestyle, health,
              travel and family needs.
            </p>

            <div className="profile-tabs">
              {Object.keys(profiles).map((item) => (
                <button
                  key={item}
                  className={profile === item ? "selected" : ""}
                  onClick={() => setProfile(item)}
                >
                  {profiles[item].emoji} {item}
                </button>
              ))}
            </div>
          </div>

          <div className="weather-orb">
            {loading ? (
              <div className="loader">Loading...</div>
            ) : (
              <>
                <div className="big-weather-icon">
                  {weatherEmoji(current?.weather_code)}
                </div>
                <strong>{Math.round(current?.temperature_2m)}°</strong>
                <p>{weatherText[current?.weather_code] || "Weather"}</p>
                <small>
                  Feels like {Math.round(current?.apparent_temperature)}°
                </small>
              </>
            )}
          </div>
        </section>

        <div className="location-row">
          <div>
            <span className="live-dot"></span>
            <strong>{location.name}</strong>
            <span>Live weather data</span>
          </div>

          <button onClick={saveCurrentDestination}>
            ☆ Save Destination
          </button>
        </div>

        <section className="section-heading">
          <div>
            <p>SMART INSIGHT</p>
            <h2>
              {currentProfile.emoji} {currentProfile.title}
            </h2>
          </div>
          <span>Updated live</span>
        </section>

        <section className="smart-card">
          <div className="smart-icon">{currentProfile.emoji}</div>

          <div className="smart-text">
            <h3>Personalized recommendation</h3>
            <p>{recommendation}</p>
          </div>

          <div className="best-time">
            <small>PROFILE</small>
            <strong>{profile}</strong>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <small>🌡️ TEMPERATURE</small>
              <span>LIVE</span>
            </div>
            <strong>{current ? `${Math.round(current.temperature_2m)}°C` : "--"}</strong>
            <p>Feels like {current ? `${Math.round(current.apparent_temperature)}°C` : "--"}</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <small>🌬️ AIR QUALITY</small>
              <span>AQI</span>
            </div>
            <strong>{currentAQI}</strong>
            <p>{aqiLabel(currentAQI)}</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <small>☀️ UV INDEX</small>
              <span>LIVE</span>
            </div>
            <strong>{uv}</strong>
            <p>{uv === "--" ? "Loading" : uv >= 7 ? "High" : uv >= 3 ? "Moderate" : "Low"}</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <small>💧 HUMIDITY</small>
              <span>LIVE</span>
            </div>
            <strong>
              {current ? `${current.relative_humidity_2m}%` : "--"}
            </strong>
            <p>Relative humidity</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <small>💨 WIND</small>
              <span>LIVE</span>
            </div>
            <strong>
              {current ? `${Math.round(current.wind_speed_10m)} km/h` : "--"}
            </strong>
            <p>Current wind speed</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <small>🌧️ RAIN CHANCE</small>
              <span>TODAY</span>
            </div>
            <strong>{rainProbability}%</strong>
            <p>Maximum probability</p>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel forecast-panel">
            <div className="panel-heading">
              <div>
                <p>WEATHER OUTLOOK</p>
                <h2>7-Day Forecast</h2>
              </div>
              <span>Next 7 days</span>
            </div>

            <div className="days">
              {daily?.time?.map((date, index) => (
                <div className="day" key={date}>
                  <small>
                    {index === 0
                      ? "Today"
                      : new Date(date).toLocaleDateString("en-IN", {
                          weekday: "short",
                        })}
                  </small>

                  <span>
                    {weatherEmoji(daily.weather_code[index])}
                  </span>

                  <strong>{Math.round(daily.temperature_2m_max[index])}°</strong>

                  <em>{Math.round(daily.temperature_2m_min[index])}°</em>

                  <label>
                    💧 {daily.precipitation_probability_max[index]}%
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="panel sun-panel">
            <div className="panel-heading">
              <div>
                <p>DAYLIGHT</p>
                <h2>Sunrise & Sunset</h2>
              </div>
              <span>Today</span>
            </div>

            <div className="sun-times">
              <div>
                <span>🌅</span>
                <small>Sunrise</small>
                <strong>
                  {daily?.sunrise?.[0]
                    ? new Date(daily.sunrise[0]).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--"}
                </strong>
              </div>

              <div>
                <span>🌇</span>
                <small>Sunset</small>
                <strong>
                  {daily?.sunset?.[0]
                    ? new Date(daily.sunset[0]).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--"}
                </strong>
              </div>
            </div>

            <div className="daylight-tip">
              💡 Best outdoor light is usually around sunrise and sunset.
            </div>
          </div>
        </section>

        <section className="content-grid second-grid">
          <div className="panel hourly-panel">
            <div className="panel-heading">
              <div>
                <p>HOURLY INTELLIGENCE</p>
                <h2>Next 12 Hours</h2>
              </div>
              <span>Temperature & UV</span>
            </div>

            <div className="hours">
              {hourly?.time?.slice(0, 12).map((time, index) => (
                <div className="hour" key={time}>
                  <small>
                    {new Date(time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>

                  <span>{weatherEmoji(hourly.weather_code?.[index] ?? 0)}</span>

                  <strong>
                    {Math.round(hourly.temperature_2m[index])}°
                  </strong>

                  <label>UV {hourly.uv_index[index]}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="panel destination-panel">
            <div className="panel-heading">
              <div>
                <p>TRAVEL</p>
                <h2>Saved Destinations</h2>
              </div>
              <span>📌</span>
            </div>

            {destinations.length ? (
              destinations.map((destination) => (
                <button
                  className="destination-item"
                  key={`${destination.name}-${destination.latitude}`}
                  onClick={() => setLocation(destination)}
                >
                  <div>
                    <strong>{destination.name}</strong>
                    <small>
                      {destination.latitude.toFixed(2)}°,{" "}
                      {destination.longitude.toFixed(2)}°
                    </small>
                  </div>
                  <span>→</span>
                </button>
              ))
            ) : (
              <p className="empty">No saved destinations yet.</p>
            )}
          </div>
        </section>

        <section className="alert-center">
          <div className="alert-header">
            <div>
              <p>SAFETY CENTER</p>
              <h2>🔔 Weather Alert Center</h2>
            </div>
            <span className="alert-status">● MONITORING</span>
          </div>

          {alerts.map((alert, index) => (
            <div className="alert-item" key={index}>
              <span>⚠️</span>
              <p>{alert}</p>
            </div>
          ))}
        </section>

        <section className="how-section">
          <div>
            <p className="eyebrow">HOW MAUSAM PERSONALIZES YOUR DAY</p>
            <h2>One dashboard. Different priorities.</h2>
          </div>

          <div className="logic-cards">
            <div>
              <span>01</span>
              <strong>Your profile</strong>
              <p>Fitness, Health, Travel or Family.</p>
            </div>

            <div>
              <span>02</span>
              <strong>Live conditions</strong>
              <p>Weather, AQI, UV, wind and rain.</p>
            </div>

            <div>
              <span>03</span>
              <strong>Smart action</strong>
              <