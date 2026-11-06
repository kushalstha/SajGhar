import { useMemo, useState } from "react";
import { API } from "../config.js";
import "./OutfitStudio.css";

const briefFields = [
  {
    name: "occasion",
    label: "Occasion",
    options: ["Work", "Everyday", "Weekend", "Date night"],
  },
  {
    name: "mood",
    label: "Mood",
    options: ["Relaxed", "Polished", "Playful", "Minimal"],
  },
  {
    name: "weather",
    label: "Weather",
    options: ["18° · Clear", "12° · Cloudy", "24° · Warm", "8° · Cold"],
  },
  {
    name: "palette",
    label: "Colour direction",
    options: ["Neutral", "Earth tones", "Soft colour", "Monochrome"],
  },
];

const initialBrief = {
  occasion: "Work",
  mood: "Relaxed",
  weather: "18° · Clear",
  palette: "Neutral",
};

const lookTitles = {
  Work: "Quiet confidence",
  Everyday: "Made for the everyday",
  Weekend: "An easy kind of weekend",
  "Date night": "A little after hours",
};

export default function OutfitStudioPage({ items, openWardrobe, openMirror }) {
  const [brief, setBrief] = useState(initialBrief);
  const [lookNumber, setLookNumber] = useState(0);

  const lookItems = useMemo(() => {
    const count = Math.min(items.length, 4);
    if (!count) return [];

    const start = (lookNumber * count) % items.length;
    return Array.from({ length: count }, (_, index) => items[(start + index) % items.length]);
  }, [items, lookNumber]);

  const updateBrief = (event) => {
    setBrief((currentBrief) => ({
      ...currentBrief,
      [event.target.name]: event.target.value,
    }));
  };

  const generateLook = (event) => {
    event.preventDefault();
    setLookNumber((currentNumber) => currentNumber + 1);
  };

  return (
    <main className="dashboard-main">
      <section className="studio-page">
        <header className="studio-header">
          <div>
            <p className="studio-eyebrow">SAJGHAR · PERSONAL WARDROBE</p>
            <h1>Outfit studio</h1>
            <p className="studio-subtitle">Create a look around your day.</p>
          </div>
          <button className="studio-button" onClick={generateLook}>
            Generate look <span aria-hidden="true">→</span>
          </button>
        </header>

        <div className="studio-card">
          <form className="studio-brief" onSubmit={generateLook}>
            <h2>Build your brief</h2>
            {briefFields.map((field, index) => (
              <label className="studio-field" key={field.name}>
                <span className="studio-field-label">
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  {field.label}
                </span>
                <select
                  name={field.name}
                  value={brief[field.name]}
                  onChange={updateBrief}
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <button className="studio-button studio-create-button" type="submit">
              Create a look <span aria-hidden="true">→</span>
            </button>
          </form>

          <div className="studio-lookboard" aria-label="Pieces in your outfit">
            {lookItems.length ? (
              <div className="studio-item-grid">
                {lookItems.map((item, index) => (
                  <div
                    className={`studio-item studio-item-${index + 1}`}
                    key={item.id}
                  >
                    <img
                      src={`${API}${item.image_url}`}
                      alt={item.original_name || "Wardrobe piece"}
                    />
                    <span>{item.original_name || "Wardrobe piece"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="studio-empty">
                <span className="studio-empty-mark" aria-hidden="true">
                  S
                </span>
                <p>Your wardrobe is the starting point.</p>
                <button className="studio-text-button" onClick={openWardrobe}>
                  Add your first piece <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </div>

          <section className="studio-result" aria-live="polite">
            <p className="studio-eyebrow">
              {lookItems.length ? `YOUR LOOK · ${String(lookNumber + 1).padStart(2, "0")}` : "YOUR NEXT LOOK"}
            </p>
            <h2>{lookTitles[brief.occasion]}</h2>
            <p className="studio-description">
              {lookItems.length
                ? `A ${brief.mood.toLowerCase()} combination built from pieces you already own.`
                : "Add a few favourite pieces to start putting together looks from your wardrobe."}
            </p>
            <div className="studio-tags" aria-label="Look details">
              <span>{brief.occasion}</span>
              <span>{brief.weather.split(" · ")[0]}</span>
              <span>{lookItems.length} {lookItems.length === 1 ? "piece" : "pieces"}</span>
            </div>
            {lookItems.length > 0 && (
              <button className="studio-button studio-try-button" onClick={openMirror}>
                Try in AR <span aria-hidden="true">→</span>
              </button>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
