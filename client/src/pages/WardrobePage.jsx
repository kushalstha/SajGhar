import { API } from "../config.js";

export default function WardrobePage({
  items,
  file,
  fileName,
  preview,
  result,
  processTime,
  loading,
  error,
  choosePhoto,
  onDelete,
  onUpload,
  wardrobeRef,
  setFileName,
  setFile,
  setPreview,
  setResult,
  setProcessTime,
  setError,
}) {
  return (
    <main className="dashboard-main">
      <section className="dashboard-wardrobe-panel" ref={wardrobeRef}>
        <header className="dashboard-heading wardrobe-heading">
          <div className="dashboard-heading-copy">
            <p className="dashboard-date">SAJGHAR · PERSONAL WARDROBE</p>
            <h1 className="dashboard-wardrobe-title">My wardrobe</h1>
            <p className="dashboard-subtitle">
              Everything you own, thoughtfully organised.
            </p>
          </div>
          <button className="dashboard-add-button" onClick={choosePhoto}>
            + Add clothes
          </button>
        </header>

        <div className="dashboard-filter-row" aria-label="Wardrobe filters">
          <button className="dashboard-filter-chip active">
            All <span>· 42</span>
          </button>
          <button className="dashboard-filter-chip">
            Tops <span>· 14</span>
          </button>
          <button className="dashboard-filter-chip">
            Bottoms <span>· 09</span>
          </button>
          <button className="dashboard-filter-chip">
            Outerwear <span>· 07</span>
          </button>
          <button className="dashboard-filter-chip">
            Shoes <span>· 08</span>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="dashboard-empty-state">
            <p>Your wardrobe is waiting for its first favorite.</p>
            <button className="dashboard-text-action" onClick={choosePhoto}>
              Scan your first piece <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : (
          <div className="dashboard-wardrobe-grid">
            {items.map((item) => (
              <article className="dashboard-item" key={item.id}>
                <div className="dashboard-item-image">
                  <img
                    src={`${API}${item.image_url}`}
                    alt={item.original_name || "Saved garment"}
                  />
                </div>
                <div className="dashboard-item-caption">
                  <span className="dashboard-item-type">Shirt</span>
                  <h3>{item.original_name || "Untitled garment"}</h3>
                  <p>Worn {Math.max(1, Math.floor(item.id % 4) + 1)} times</p>
                </div>
                <button
                  className="dashboard-item-remove"
                  onClick={() => onDelete(item)}
                  aria-label={`Delete ${item.original_name || "garment"}`}
                >
                  ×
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {file && (
        <section className="dashboard-upload" aria-label="Process garment photo">
          <div className="dashboard-upload-heading">
            <div>
              <p className="dashboard-kicker">READY TO ADD</p>
              <h2>{file.name}</h2>
            </div>
            <button
              className="dashboard-upload-cancel"
              onClick={() => {
                setFile(null);
                setFileName("");
                setPreview(null);
                setResult(null);
                setProcessTime(null);
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
          <div className="dashboard-upload-body">
            {preview && <img src={preview} alt="Selected garment preview" />}
            <div>
              <label className="dashboard-upload-name">
                <span>Name this item</span>
                <input
                  type="text"
                  value={fileName}
                  maxLength={255}
                  onChange={(event) => setFileName(event.target.value)}
                  placeholder="e.g. Sage overshirt"
                />
              </label>
              <p>
                Process this photo to remove the background and save the garment
                to your wardrobe.
              </p>
              <button
                className="dashboard-primary-action"
                onClick={onUpload}
                disabled={loading}
              >
                {loading ? "Processing…" : "Remove background and save"}
              </button>
            </div>
            {result && <img src={result} alt="Garment after background removal" />}
          </div>
          {processTime && (
            <p className="dashboard-process-time">Processed in {processTime}s</p>
          )}
        </section>
      )}

      {error && <p className="dashboard-error">{error}</p>}
    </main>
  );
}
