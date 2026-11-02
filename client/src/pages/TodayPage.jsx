import { API } from "../config.js";

function getGreeting(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export default function TodayPage({ items, username, choosePhoto, openWardrobe }) {
  const displayName = username
    ? username.charAt(0).toUpperCase() + username.slice(1)
    : "there";
  const latestItem = items[0];
  const today = new Date();

  return (
    <main className="dashboard-main dashboard-main-today">
      <section className="today-shell">
        <header className="today-header">
          <div className="today-heading-wrap">
            <p className="today-date">{formatDate(today).toUpperCase()}</p>
            <h1 className="today-title">
              {getGreeting(today.getHours())}, <em>{displayName}.</em>
            </h1>
          </div>

          <div className="today-weather">
            <span>Kathmandu · Partly cloudy</span>
            <strong>18°</strong>
          </div>
        </header>

        <div className="today-main-grid">
          <section className="today-feature-card" aria-label="Wardrobe overview">
            <div className="today-feature-image">
              {latestItem ? (
                <img
                  src={`${API}${latestItem.image_url}`}
                  alt={latestItem.original_name || "Most recently added garment"}
                />
              ) : (
                <div className="today-empty-art" aria-hidden="true">
                  <span>SG</span>
                </div>
              )}
              <span className="today-image-tag">AI pick · 01</span>
            </div>

            <div className="today-feature-copy">
              <p className="today-kicker">Your look for today</p>
              <h2>Soft layers for a clear afternoon.</h2>
              <p className="today-feature-description">
                Comfortable for 18–22°C, with a light cardigan ready for the
                cooler evening.
              </p>

              <div className="today-tags" aria-label="Outfit tags">
                <span>Cardigan</span>
                <span>Denim</span>
                <span>Leather boots</span>
              </div>

              <div className="today-actions">
                <button className="today-primary-action" onClick={choosePhoto}>
                  Try in AR <span aria-hidden="true">→</span>
                </button>
                <button className="today-secondary-action" onClick={openWardrobe}>
                  Save look
                </button>
              </div>
            </div>
          </section>

          <aside className="today-quick-card">
            <p className="today-kicker">Quick actions</p>
            <button onClick={choosePhoto}>
              <span className="quick-action-icon" aria-hidden="true">
                +
              </span>
              <span>Scan new clothes</span>
              <span className="quick-action-arrow" aria-hidden="true">
                →
              </span>
            </button>
            <button onClick={openWardrobe}>
              <span className="quick-action-icon" aria-hidden="true">
                ✦
              </span>
              <span>Generate another look</span>
              <span className="quick-action-arrow" aria-hidden="true">
                →
              </span>
            </button>
            <button onClick={choosePhoto}>
              <span className="quick-action-icon" aria-hidden="true">
                ◌
              </span>
              <span>Open AR mirror</span>
              <span className="quick-action-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </aside>
        </div>

        <div className="today-lower-grid">
          <section className="today-summary-card">
            <p className="today-kicker">My wardrobe</p>
            <div className="today-summary-heading">
              <h3>{items.length} pieces recognised</h3>
              <button type="button" onClick={openWardrobe}>
                View all <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="today-category-grid">
              <div className="today-category-box box-1">
                <span> Tops </span>
                <strong>14</strong>
              </div>
              <div className="today-category-box box-2">
                <span> Bottoms </span>
                <strong>09</strong>
              </div>
              <div className="today-category-box box-3">
                <span> Outerwear </span>
                <strong>07</strong>
              </div>
              <div className="today-category-box box-4">
                <span> Shoes </span>
                <strong>08</strong>
              </div>
            </div>
          </section>

          <aside className="today-plan-card">
            <p className="today-kicker">Plan ahead</p>
            <div className="today-summary-heading">
              <h3>Your week</h3>
              <button type="button" onClick={openWardrobe}>
                Open planner <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="today-week-grid">
              {[
                { day: "Tue", temp: "18°", active: true },
                { day: "Wed", temp: "20°" },
                { day: "Thu", temp: "16°" },
                { day: "Fri", temp: "19°" },
                { day: "Sat", temp: "21°" },
              ].map((item) => (
                <div className={`today-week-day ${item.active ? "active" : ""}`} key={item.day}>
                  <span>{item.day}</span>
                  <strong>{item.temp}</strong>
                  <small>{item.active ? "●" : "◌"}</small>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
