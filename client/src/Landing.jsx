import { useState } from "react";
import "./Landing.css";

const garments = [
  { name: "Cloud shirt", type: "shirt" },
  { name: "Sage overshirt", type: "shirt" },
  { name: "Rose blouse", type: "shirt" },
  { name: "Sand blazer", type: "jacket" },
  { name: "Denim jacket", type: "jacket" },
  { name: "Midnight cardigan", type: "knit" },
  { name: "Olive knit", type: "knit" },
  { name: "Oat coat", type: "jacket" },
  { name: "Plum pullover", type: "knit" },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}

function Garment({ garment, index, active, onActivate }) {
  return (
    <button
      className={`garment garment-${index} ${active ? "active" : ""}`}
      onClick={onActivate}
      onFocus={onActivate}
      onMouseEnter={onActivate}
      aria-label={`View ${garment.name}`}
    >
      <svg viewBox="0 0 160 300" preserveAspectRatio="none" aria-hidden="true">
        <path className="hanger-hook" d="M80 42c0-18 22-16 22-2 0 9-22 15-22 25" />
        <path className="hanger" d="M80 64 18 99h124L80 64Z" />
        {garment.type === "shirt" && (
          <>
            <path
              className="fabric"
              d="m48 86-33 31 19 54 21-16v126h74V155l20 16 18-54-33-31-27-8H76Z"
            />
            <path className="detail" d="m76 78 4 34 27-34M80 112v169M96 118v4" />
          </>
        )}
        {garment.type === "jacket" && (
          <>
            <path
              className="fabric"
              d="m48 86-31 31 14 71 26-11-4 104h82l-5-104 27 11 13-71-31-31-29-9H76Z"
            />
            <path
              className="detail"
              d="m76 77 4 39 30-39-12 67 12 137M80 116 66 281M58 191h25M108 191h25"
            />
          </>
        )}
        {garment.type === "knit" && (
          <>
            <path
              className="fabric"
              d="m52 84-39 42 24 58 23-14-7 111h83l-7-111 24 14 23-58-39-42-27-8H78Z"
            />
            <path
              className="detail"
              d="M78 76q16 25 32 0M66 115v153M94 115v153M122 115v153"
            />
          </>
        )}
      </svg>
      {active && <span className="garment-label">{garment.name}</span>}
    </button>
  );
}

export default function Landing({ onStart }) {
  const [activeGarment, setActiveGarment] = useState(0);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="SajGhar home">
          <img src="/Logo.png" alt="" />
          <span className="brand-name">
            SAJ<i>GHAR</i>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#mirror">AR Mirror</a>
        </nav>
        <button className="nav-cta" onClick={onStart}>
          Try SajGhar <ArrowIcon />
        </button>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow-row">
          <p>AI wardrobe · 01</p>
          <p>Personal styling, reimagined</p>
          <p>Weather aware</p>
        </div>

        <h1>
          Dress for <em>your day.</em>
        </h1>
        <p className="hero-copy">
          Scan the clothes you already love. SajGhar turns your wardrobe and
          local weather into effortless outfits, then lets you try them on
          virtually.
        </p>

        <div className="hero-visual">
          <div className="wardrobe-rack">
            <div className="rack-rail" aria-hidden="true" />
            {garments.map((garment, index) => (
              <Garment
                active={activeGarment === index}
                garment={garment}
                index={index}
                key={garment.name}
                onActivate={() => setActiveGarment(index)}
              />
            ))}
          </div>
          <div className="weather-card">
            <span>Today in your area</span>
            <strong>18°</strong>
            <p>{garments[activeGarment].name} suggested</p>
          </div>
        </div>
      </section>

      <section className="process" id="how">
        <div className="section-heading">
          <h2>
            Your personal stylist,
            <br />
            <em>powered by context.</em>
          </h2>
        </div>
        <div className="steps" id="features">
          <article>
            <span>01</span>
            <h3>Scan your pieces</h3>
            <p>
              Photograph your wardrobe once. Our AI identifies every garment,
              colour, texture and silhouette.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Style for the weather</h3>
            <p>
              Rain, heat or a crisp evening: get complete looks suited to the
              forecast and your plans.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>See it on you</h3>
            <p>
              Step into the AR mirror and preview an outfit on your body before
              you get dressed.
            </p>
          </article>
        </div>
      </section>

      <section className="mirror-section" id="mirror">
        <div className="mirror-copy">
          <p className="kicker">The SajGhar mirror</p>
          <h2>
            Try the feeling,
            <br />
            <em>before the outfit.</em>
          </h2>
          <p>
            Your camera becomes a private fitting room. Move naturally, swap
            pieces in real time, and save the looks that feel most like you.
          </p>
          <button onClick={onStart}>
            Get started <ArrowIcon />
          </button>
        </div>
      </section>

      <footer>
        <a className="brand brand-light" href="#top">
          <img src="/Logo.png" alt="" />
          <span className="brand-name">
            SAJ<i>GHAR</i>
          </span>
        </a>
        <p>Wear more of what you already own.</p>
        <p>© 2026 SajGhar</p>
      </footer>
    </main>
  );
}