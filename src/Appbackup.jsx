import { useState } from "react";
import "./App.css";

function App() {
  const [profile, setProfile] = useState("Fitness");

  const data = {
    Fitness: {
      emoji: "🏃",
      title: "Perfect weather for a workout",
      text: "Morning conditions are comfortable. UV is moderate, so keep your outdoor session short.",
      best: "6:00 AM – 8:00 AM",
      accent: "Fitness",
      stats: [
        ["AQI", "72", "Good"],
        ["UV Index", "5", "Moderate"],
        ["Wind", "12 km/h", "Comfortable"],
      ],
    },
    Health: {
      emoji: "❤️",
      title: "Take care of your health today",
      text: "Humidity is comfortable, but sensitive users should keep an eye on air quality and UV levels.",
      best: "7:00 AM – 9:00 AM",
      accent: "Health",
      stats: [
        ["AQI", "72", "Good"],
        ["Humidity", "58%", "Comfortable"],
        ["UV Index", "5", "Moderate"],
      ],
    },
    Travel: {
      emoji: "✈️",
      title: "Travel conditions look good",
      text: "A small chance of rain is expected later. Keep a light raincoat if you're travelling.",
      best: "10:00 AM – 5:00 PM",
      accent: "Travel",
      stats: [
        ["Rain", "20%", "Low"],
        ["Wind", "12 km/h", "Normal"],
        ["Visibility", "9 km", "Good"],
      ],
    },
    Family: {
      emoji: "👨‍👩‍👧",
      title: "A comfortable day for your family",
      text: "School commute conditions are mostly clear. No major weather alert is active.",
      best: "7:30 AM – 9:00 AM",
      accent: "Family",
      stats: [
        ["Rain", "20%", "Low"],
        ["Commute", "Clear", "Good"],
        ["Alert", "None", "Safe"],
      ],
    },
  };

  const current = data[profile];

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          <span>☁️</span>
          <div>
            <strong>Mausam</strong>
            <small>Personal Weather Intelligence</small>
          </div>
        </div>

        <div className="nav-right">
          <button className="location-btn">📍 Faridabad</button>
          <div className="avatar">RK</div>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-left">
            <p className="greeting">GOOD EVENING, ROHIT 👋</p>
            <h1>Weather that<br /><span>understands you.</span></h1>
            <p className="hero-text">
              Your weather dashboard adapts to what matters most to you.
            </p>

            <div className="profile-tabs">
              {Object.keys(data).map((item) => (
                <button
                  key={item}
                  className={profile === item ? "selected" : ""}
                  onClick={() => setProfile(item)}
                >
                  {data[item].emoji} {item}
                </button>
              ))}
            </div>
          </div>

          <div className="weather-orb">
            <div className="sun">☀️</div>
            <strong>28°</strong>
            <p>Partly Cloudy</p>
            <small>Feels like 30°</small>
          </div>
        </section>

        <div className="section-title">
          <div>
            <p>PERSONALIZED FOR YOU</p>
            <h2>{current.emoji} {current.title}</h2>
          </div>
          <span>Updated just now</span>
        </div>

        <section className="smart-card">
          <div className="smart-icon">{current.emoji}</div>
          <div className="smart-content">
            <h3>Smart recommendation</h3>
            <p>{current.text}</p>
          </div>
          <div className="best-time">
            <small>BEST TIME</small>
            <strong>{current.best}</strong>
          </div>
        </section>

        <section className="stats-grid">
          {current.stats.map((stat, index) => (
            <div className="stat-card" key={index}>
              <small>{stat[0]}</small>
              <strong>{stat[1]}</strong>
              <span>● {stat[2]}</span>
            </div>
          ))}
        </section>

        <section className="bottom-grid">
          <div className="forecast">
            <div className="card-heading">
              <h2>7-Day Forecast</h2>
              <span>Next 7 days →</span>
            </div>

            <div className="days">
              {[
                ["Today", "☀️", "28°", "20°"],
                ["Thu", "🌤️", "29°", "21°"],
                ["Fri", "🌧️", "27°", "20°"],
                ["Sat", "⛅", "30°", "22°"],
                ["Sun", "☀️", "31°", "23°"],
                ["Mon", "🌤️", "30°", "22°"],
                ["Tue", "🌧️", "27°", "21°"],
              ].map((day, index) => (
                <div className={index === 0 ? "day active-day" : "day"} key={day[0]}>
                  <small>{day[0]}</small>
                  <span>{day[1]}</span>
                  <strong>{day[2]}</strong>
                  <em>{day[3]}</em>
                </div>
              ))}
            </div>
          </div>

          <div className="destination">
            <div className="card-heading">
              <h2>Saved Destination</h2>
              <span>✈️</span>
            </div>
            <div className="destination-place">
              <div>
                <h3>New Delhi</h3>
                <p>India • 18 km away</p>
              </div>
              <strong>29°</strong>
            </div>
            <div className="mini-alert">
              🌧️ 20% chance of rain tomorrow
            </div>
          </div>
        </section>

        <section className="alert-box">
          <div className="alert-symbol">🔔</div>
          <div>
            <strong>Weather Alert Center</strong>
            <p>No severe weather alerts for your current location.</p>
          </div>
          <button>View alerts →</button>
        </section>
      </main>

      <footer>
        <span>🌤️ Mausam</span>
        <span>Personalized • Intelligent • Accessible</span>
      </footer>
    </div>
  );
}

export default App;