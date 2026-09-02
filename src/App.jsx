import { useEffect, useMemo, useState } from "react";
import "./App.css";

const profiles = {
  Fitness: {
    icon: "🏃",
    title: "Outdoor fitness",
    subtitle: "Best conditions for your workout",
    recommendation:
      "Air quality is acceptable and wind is comfortable. UV is moderate, so an early-morning or evening workout is recommended.",
    bestTime: "6:00 AM – 8:00 AM",
    priority: ["AQI", "UV Index", "Wind"],
  },

  Health: {
    icon: "❤️",
    title: "Health & wellness",
    subtitle: "Conditions that matter for your health",
    recommendation:
      "Humidity is comfortable. Keep monitoring air quality and UV levels if you are sensitive to pollution, pollen or sunlight.",
    bestTime: "7:00 AM – 9:00 AM",
    priority: ["AQI", "Humidity", "UV Index"],
  },

  Travel: {
    icon: "✈️",
    title: "Travel planner",
    subtitle: "Weather-aware travel guidance",
    recommendation:
      "Travel conditions are mostly clear. There is a small chance of rain later, so carrying a light rain jacket is recommended.",
    bestTime: "10:00 AM – 5:00 PM",
    priority: ["Rain", "Wind", "Visibility"],
  },

  Family: {
    icon: "👨‍👩‍👧",
    title: "Family & commute",
    subtitle: "Safer planning for your family",
    recommendation:
      "School commute conditions look comfortable. No major weather alert is active for your current location.",
    bestTime: "7:30 AM – 9:00 AM",
    priority: ["Rain", "Commute", "Alerts"],
  },
};

const forecast = [
  ["Today", "☀️", "28°", "20°", "Clear"],
  ["Thu", "🌤️", "29°", "21°", "Partly cloudy"],
  ["Fri", "🌧️", "27°", "20°", "Rain possible"],
  ["Sat", "⛅", "30°", "22°", "Cloudy"],
  ["Sun", "☀️", "31°", "23°", "Sunny"],
  ["Mon", "🌤️", "30°", "22°", "Partly cloudy"],
  ["Tue", "🌧️", "27°", "21°", "Rain possible"],
];

function App() {
  const [profile, setProfile] = useState(
    localStorage.getItem("mausam-profile") || "Fitness"
  );

  const [location, setLocation] = useState("Faridabad");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const currentProfile = profiles[profile];

  useEffect(() => {
    localStorage.setItem("mausam-profile", profile);
  }, [profile]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "GOOD MORNING";
    if (hour < 17) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not supported by this browser.");
      return;
    }

    setLocationLoading(true);
    setLocationMessage("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`
          );

          const data = await response.json();

          const place =
            data?.results?.[0]?.name ||
            data?.results?.[0]?.admin2 ||
            "Your location";

          setLocation(place);
          setLocationMessage("Location updated successfully.");
        } catch {
          setLocation("Current location");
          setLocationMessage("Location detected.");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationMessage(
          "Location permission denied. Showing Faridabad."
        );
        setLocationLoading(false);
      }
    );
  };

  const changeProfile = (newProfile) => {
    setProfile(newProfile);
    setLocationMessage(
      `${newProfile} homepage personalized for you.`
    );
  };

  return (
    <div className="app">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <div className="logo-mark">☁️</div>

          <div>
            <strong>Mausam</strong>
            <small>Personal Weather Intelligence</small>
          </div>
        </div>

        <div className="nav-right">
          <button
            className="location-btn"
            onClick={detectLocation}
            disabled={locationLoading}
          >
            📍 {locationLoading ? "Detecting..." : location}
          </button>

          <div className="avatar">RK</div>
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="hero-left">
            <p className="greeting">
              {greeting}, ROHIT 👋
            </p>

            <h1>
              Weather that
              <br />
              <span>understands you.</span>
            </h1>

            <p className="hero-text">
              Your homepage adapts weather information to your
              lifestyle, location and daily needs.
            </p>

            <div className="profile-label">
              PERSONALIZE YOUR HOMEPAGE
            </div>

            <div className="profile-tabs">
              {Object.keys(profiles).map((item) => (
                <button
                  key={item}
                  className={profile === item ? "selected" : ""}
                  onClick={() => changeProfile(item)}
                >
                  <span>{profiles[item].icon}</span>
                  {item}
                </button>
              ))}
            </div>

            {locationMessage && (
              <p className="location-message">
                {locationMessage}
              </p>
            )}
          </div>

          <div className="weather-orb">
            <div className="weather-ring">
              <span>☀️</span>
            </div>

            <strong>28°</strong>
            <p>Partly Cloudy</p>
            <small>Feels like 30°</small>
          </div>
        </section>

        {/* PERSONALIZED HEADER */}
        <section className="section-title">
          <div>
            <p>PERSONALIZED FOR YOU</p>

            <h2>
              {currentProfile.icon} {currentProfile.title}
            </h2>

            <span className="section-subtitle">
              {currentProfile.subtitle}
            </span>
          </div>

          <div className="updated">
            <span className="live-dot"></span>
            Updated just now
          </div>
        </section>

        {/* SMART RECOMMENDATION */}
        <section className="smart-card">
          <div className="smart-icon">
            {currentProfile.icon}
          </div>

          <div className="smart-content">
            <div className="smart-badge">
              ✨ SMART RECOMMENDATION
            </div>

            <h3>
              Based on your {profile.toLowerCase()} profile
            </h3>

            <p>{currentProfile.recommendation}</p>
          </div>

          <div className="best-time">
            <small>BEST TIME</small>
            <strong>{currentProfile.bestTime}</strong>
          </div>
        </section>

        {/* PRIORITY STATS */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <small>AQI</small>
              <span className="stat-icon">🌬️</span>
            </div>

            <strong>72</strong>
            <span className="good">● Good</span>
            <div className="progress">
              <span style={{ width: "42%" }}></span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <small>UV INDEX</small>
              <span className="stat-icon">☀️</span>
            </div>

            <strong>5</strong>
            <span className="moderate">● Moderate</span>
            <div className="progress">
              <span style={{ width: "50%" }}></span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <small>HUMIDITY</small>
              <span className="stat-icon">💧</span>
            </div>

            <strong>58%</strong>
            <span className="good">● Comfortable</span>
            <div className="progress">
              <span style={{ width: "58%" }}></span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <small>WIND</small>
              <span className="stat-icon">💨</span>
            </div>

            <strong>12 km/h</strong>
            <span className="good">● Comfortable</span>
            <div className="progress">
              <span style={{ width: "32%" }}></span>
            </div>
          </div>
        </section>

        {/* PROFILE EXPLANATION */}
        <section className="personalization-panel">
          <div>
            <div className="mini-label">WHY YOU SEE THIS</div>

            <h2>
              Your weather, your priorities.
            </h2>

            <p>
              Mausam prioritizes the information that matters
              most to your selected lifestyle.
            </p>
          </div>

          <div className="priority-list">
            {currentProfile.priority.map((item, index) => (
              <div className="priority-item" key={item}>
                <span>{index + 1}</span>
                <strong>{item}</strong>
                <em>Priority</em>
              </div>
            ))}
          </div>
        </section>

        {/* FORECAST + DESTINATION */}
        <section className="bottom-grid">
          <div className="forecast">
            <div className="card-heading">
              <div>
                <h2>7-Day Forecast</h2>
                <p>Plan ahead with your personalized outlook</p>
              </div>

              <button>Next 7 days →</button>
            </div>

            <div className="days">
              {forecast.map((day, index) => (
                <div
                  className={
                    index === 0
                      ? "day active-day"
                      : "day"
                  }
                  key={day[0]}
                >
                  <small>{day[0]}</small>

                  <span>{day[1]}</span>

                  <strong>{day[2]}</strong>

                  <em>{day[3]}</em>

                  <label>{day[4]}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="destination">
            <div className="card-heading">
              <div>
                <h2>Saved Destination</h2>
                <p>Your travel location</p>
              </div>

              <span className="plane">✈️</span>
            </div>

            <div className="destination-place">
              <div>
                <h3>New Delhi</h3>
                <p>India • 18 km away</p>
              </div>

              <strong>29°</strong>
            </div>

            <div className="destination-weather">
              <span>🌧️</span>
              <div>
                <strong>20% rain chance</strong>
                <small>Tomorrow afternoon</small>
              </div>
            </div>

            <button className="destination-btn">
              View destination forecast →
            </button>
          </div>
        </section>

        {/* SPECIALIZED SERVICES */}
        <section className="services">
          <div className="services-heading">
            <div>
              <div className="mini-label">
                SMART WEATHER SERVICES
              </div>
              <h2>More useful weather, one place.</h2>
            </div>
          </div>

          <div className="service-grid">
            <div className="service-card">
              <span>⚠️</span>
              <h3>Weather Alerts</h3>
              <p>
                Important warnings surfaced according to your
                location and profile.
              </p>
            </div>

            <div className="service-card">
              <span>🏥</span>
              <h3>Health Weather</h3>
              <p>
                Air quality, UV, humidity and other health-aware
                indicators.
              </p>
            </div>

            <div className="service-card">
              <span>🏖️</span>
              <h3>Marine Conditions</h3>
              <p>
                Tide, wave and coastal conditions for
                beachgoers.
              </p>
            </div>

            <div className="service-card">
              <span>🧳</span>
              <h3>Travel Ready</h3>
              <p>
                Weather-aware planning for saved destinations
                and journeys.
              </p>
            </div>
          </div>
        </section>

        {/* ALERT */}
        <section className="alert-box">
          <div className="alert-symbol">🔔</div>

          <div>
            <strong>Weather Alert Center</strong>

            <p>
              No severe weather alerts for {location}.
            </p>
          </div>

          <button>
            View alerts →
          </button>
        </section>
      </main>

      <footer>
        <span>🌤️ Mausam</span>

        <span>
          Personalized • Intelligent • Accessible
        </span>

        <span>
          Prototype • SIH 2026
        </span>
      </footer>
    </div>
  );
}

export default App;