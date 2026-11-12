import { useState } from "react";
import { API } from "../config.js";
import "./ArMirrorPage.css";

export default function ArMirrorPage({ items, openWardrobe }) {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showOutfit, setShowOutfit] = useState(true);
  const [message, setMessage] = useState("");

  const selectedItem =
    items.find((item) => item.id === selectedItemId) || items[0] || null;

  const saveLook = () => {
    if (!selectedItem) return;

    try {
      localStorage.setItem(
        "sajghar-saved-ar-look",
        JSON.stringify({
          itemId: selectedItem.id,
          itemName: selectedItem.original_name || "Wardrobe piece",
          savedAt: new Date().toISOString(),
        })
      );
      setMessage("Look saved to your wardrobe.");
    } catch {
      setMessage("This look could not be saved. Please try again.");
    }
  };

  return (
    <main className="dashboard-main mirror-main">
      <section className="mirror-page">
        <header className="mirror-header">
          <p className="mirror-eyebrow">SAJGHAR · PERSONAL WARDROBE</p>
          <h1>AR mirror</h1>
          <p>See the outfit before you wear it.</p>
        </header>

        <div className="mirror-layout">
          <section className="mirror-stage" aria-label="Outfit preview">
            <span className="mirror-camera-label">
              <span aria-hidden="true" /> Camera preview
            </span>
            <span className="mirror-corner mirror-corner-top-left" />
            <span className="mirror-corner mirror-corner-top-right" />
            <span className="mirror-corner mirror-corner-bottom-left" />
            <span className="mirror-corner mirror-corner-bottom-right" />

            <div className="mirror-figure" aria-hidden="true">
              <span className="mirror-head" />
              <span className="mirror-body" />
              {showOutfit && selectedItem && (
                <img
                  className="mirror-outfit-image"
                  src={`${API}${selectedItem.image_url}`}
                  alt=""
                />
              )}
            </div>

            <button
              className={`mirror-preview-toggle ${showOutfit ? "active" : ""}`}
              onClick={() => setShowOutfit((visible) => !visible)}
              aria-label={showOutfit ? "Hide outfit preview" : "Show outfit preview"}
              aria-pressed={showOutfit}
            >
              <span />
            </button>
          </section>

          <aside className="mirror-details">
            <p className="mirror-eyebrow">NOW TRYING</p>
            <h2>Quiet confidence</h2>
            <p className="mirror-description">
              Move naturally to see how each piece sits. Swap items below
              without leaving the mirror.
            </p>

            {items.length > 0 ? (
              <>
                <div className="mirror-item-grid" aria-label="Choose a wardrobe piece">
                  {items.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    const itemName = item.original_name || "Wardrobe piece";

                    return (
                      <button
                        className={`mirror-item-card ${isSelected ? "selected" : ""}`}
                        key={item.id}
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setMessage("");
                        }}
                        aria-pressed={isSelected}
                      >
                        <span className="mirror-item-image">
                          <img src={`${API}${item.image_url}`} alt="" />
                        </span>
                        <span className="mirror-item-name">
                          {itemName}
                          {isSelected && <span aria-hidden="true"> ✓</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button className="mirror-save-button" onClick={saveLook}>
                  Save this look <span aria-hidden="true">→</span>
                </button>
                {message && (
                  <p
                    className={`mirror-message ${
                      message.includes("could not") ? "error" : ""
                    }`}
                    role="status"
                  >
                    {message}
                  </p>
                )}
              </>
            ) : (
              <div className="mirror-empty">
                <p>Add a piece to your wardrobe to try it in the mirror.</p>
                <button className="mirror-save-button" onClick={openWardrobe}>
                  Add clothes <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
