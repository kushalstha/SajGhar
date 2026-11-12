import { useState } from "react";
import "./SettingsPage.css";

const defaultSettings = {
  country: "Nepal",
  city: "Kathmandu",
  liveWeather: true,
  sevenDayForecast: true,
  morningReminder: false,
  stylePreference: "Comfortable",
  favoritePalette: "Earth tones",
  personalizedRecommendations: true,
  productAnalytics: false,
};

const settingTabs = [
  { id: "profile", label: "Profile" },
  { id: "location", label: "Location & weather" },
  { id: "style", label: "Style preferences" },
  { id: "privacy", label: "Privacy" },
];

function readSettings() {
  const savedSettings = localStorage.getItem("sajghar-settings");
  if (!savedSettings) return defaultSettings;

  try {
    return { ...defaultSettings, ...JSON.parse(savedSettings) };
  } catch {
    return defaultSettings;
  }
}

export default function SettingsPage({ username, onUsernameChange }) {
  const [activeTab, setActiveTab] = useState("location");
  const [settings, setSettings] = useState(readSettings);
  const [displayName, setDisplayName] = useState(username || "");
  const [message, setMessage] = useState("");

  const updateSetting = (key, value) => {
    setSettings((currentSettings) => ({ ...currentSettings, [key]: value }));
    setMessage("");
  };

  const saveChanges = () => {
    if (activeTab === "profile" && !displayName.trim()) {
      setMessage("Please enter a name before saving.");
      return;
    }

    try {
      localStorage.setItem("sajghar-settings", JSON.stringify(settings));
      if (activeTab === "profile") onUsernameChange(displayName.trim());
      setMessage("Your changes have been saved.");
    } catch {
      setMessage("Your changes could not be saved. Please try again.");
    }
  };

  const renderLocationSettings = () => (
    <div className="settings-card-grid">
      <section className="settings-card">
        <p className="settings-kicker">LOCATION &amp; WEATHER</p>
        <h2>Local recommendations</h2>
        <p className="settings-description">
          SajGhar uses this location to adapt your outfit suggestions to current
          conditions.
        </p>

        <label className="settings-field">
          <span>Country</span>
          <select
            value={settings.country}
            onChange={(event) => updateSetting("country", event.target.value)}
          >
            <option>Nepal</option>
            <option>India</option>
            <option>United States</option>
            <option>United Kingdom</option>
          </select>
        </label>

        <label className="settings-field">
          <span>City</span>
          <input
            type="text"
            value={settings.city}
            maxLength={80}
            onChange={(event) => updateSetting("city", event.target.value)}
            placeholder="Enter your city"
          />
        </label>

        <div className="settings-location-summary">
          <span className="settings-kicker">SELECTED LOCATION</span>
          <strong>{settings.city.trim() || "Your city"} · 18°</strong>
          <small>Weather connection pending</small>
        </div>
      </section>

      <section className="settings-card">
        <p className="settings-kicker">PREFERENCES</p>
        <h2>Recommendation settings</h2>
        <div className="settings-check-list">
          <label>
            <input
              type="checkbox"
              checked={settings.liveWeather}
              onChange={(event) =>
                updateSetting("liveWeather", event.target.checked)
              }
            />
            <span>Use live weather</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.sevenDayForecast}
              onChange={(event) =>
                updateSetting("sevenDayForecast", event.target.checked)
              }
            />
            <span>Show seven-day forecast</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={settings.morningReminder}
              onChange={(event) =>
                updateSetting("morningReminder", event.target.checked)
              }
            />
            <span>Send morning outfit reminder</span>
          </label>
        </div>
        <div className="settings-card-actions">
          <button className="settings-save-button" onClick={saveChanges}>
            Save changes
          </button>
        </div>
      </section>
    </div>
  );

  const renderProfileSettings = () => (
    <section className="settings-card settings-single-card">
      <p className="settings-kicker">YOUR ACCOUNT</p>
      <h2>Profile details</h2>
      <p className="settings-description">
        Keep the name shown in your SajGhar wardrobe up to date.
      </p>
      <label className="settings-field">
        <span>Name</span>
        <input
          type="text"
          value={displayName}
          maxLength={80}
          onChange={(event) => {
            setDisplayName(event.target.value);
            setMessage("");
          }}
          placeholder="Your name"
        />
      </label>
      <div className="settings-card-actions">
        <button className="settings-save-button" onClick={saveChanges}>
          Save changes
        </button>
      </div>
    </section>
  );

  const renderStyleSettings = () => (
    <section className="settings-card settings-single-card">
      <p className="settings-kicker">STYLE PREFERENCES</p>
      <h2>Make it your style</h2>
      <p className="settings-description">
        Personalize the looks SajGhar puts together for you.
      </p>
      <label className="settings-field">
        <span>How do you like your outfits?</span>
        <select
          value={settings.stylePreference}
          onChange={(event) =>
            updateSetting("stylePreference", event.target.value)
          }
        >
          <option>Comfortable</option>
          <option>Classic</option>
          <option>Minimal</option>
          <option>Statement-making</option>
        </select>
      </label>
      <label className="settings-field">
        <span>Favorite color palette</span>
        <select
          value={settings.favoritePalette}
          onChange={(event) =>
            updateSetting("favoritePalette", event.target.value)
          }
        >
          <option>Earth tones</option>
          <option>Neutrals</option>
          <option>Cool tones</option>
          <option>Bright colors</option>
        </select>
      </label>
      <div className="settings-card-actions">
        <button className="settings-save-button" onClick={saveChanges}>
          Save changes
        </button>
      </div>
    </section>
  );

  const renderPrivacySettings = () => (
    <section className="settings-card settings-single-card">
      <p className="settings-kicker">PRIVACY</p>
      <h2>Your data, your choice</h2>
      <p className="settings-description">
        Choose how your preferences help improve your SajGhar experience.
      </p>
      <div className="settings-check-list">
        <label>
          <input
            type="checkbox"
            checked={settings.personalizedRecommendations}
            onChange={(event) =>
              updateSetting(
                "personalizedRecommendations",
                event.target.checked
              )
            }
          />
          <span>Use my preferences for personalized recommendations</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.productAnalytics}
            onChange={(event) =>
              updateSetting("productAnalytics", event.target.checked)
            }
          />
          <span>Share anonymous usage data to improve SajGhar</span>
        </label>
      </div>
      <div className="settings-card-actions">
        <button className="settings-save-button" onClick={saveChanges}>
          Save changes
        </button>
      </div>
    </section>
  );

  const tabContent = {
    profile: renderProfileSettings,
    location: renderLocationSettings,
    style: renderStyleSettings,
    privacy: renderPrivacySettings,
  }[activeTab];

  return (
    <main className="dashboard-main settings-main">
      <section className="settings-page">
        <header className="settings-header">
          <p className="settings-eyebrow">SAJGHAR · PERSONAL WARDROBE</p>
          <h1>Settings</h1>
          <p>Make SajGhar work around you.</p>
        </header>

        <nav className="settings-tabs" aria-label="Settings sections">
          {settingTabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => {
                setActiveTab(tab.id);
                setMessage("");
              }}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {tabContent()}
        {message && (
          <p
            className={`settings-message ${
              message.includes("could not") || message.includes("Please")
                ? "error"
                : ""
            }`}
            role="status"
          >
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
