import { useState } from "react";
import "./PlannerPage.css";

const weekDays = [
  { day: "Monday", temperature: "20°", occasion: "Client meeting", color: "sand" },
  { day: "Tuesday", temperature: "18°", occasion: "Studio day", color: "sage" },
  { day: "Wednesday", temperature: "16°", occasion: "Rain expected", color: "rose" },
  { day: "Thursday", temperature: "19°", occasion: "Dinner", color: "clay" },
  { day: "Friday", temperature: "21°", occasion: "Open schedule", color: "blue" },
];

const initialPlans = [
  { title: "Sand blazer", itemId: "" },
  { title: "Midnight cardigan", itemId: "" },
  { title: "Denim jacket", itemId: "" },
  { title: "Rose blouse", itemId: "" },
  { title: "", itemId: "" },
];

function readPlans() {
  try {
    const savedPlans = localStorage.getItem("sajghar-weekly-planner");
    if (!savedPlans) return initialPlans;

    const parsedPlans = JSON.parse(savedPlans);
    if (
      !Array.isArray(parsedPlans) ||
      parsedPlans.length !== weekDays.length ||
      parsedPlans.some(
        (plan) =>
          typeof plan?.title !== "string" ||
          typeof plan?.itemId !== "string"
      )
    ) {
      return initialPlans;
    }

    return parsedPlans;
  } catch {
    return initialPlans;
  }
}

export default function PlannerPage({ items = [] }) {
  const [plans, setPlans] = useState(readPlans);
  const [editingDay, setEditingDay] = useState(null);
  const [draft, setDraft] = useState({ title: "", itemId: "" });
  const [error, setError] = useState("");

  const startEditing = (index) => {
    setEditingDay(index);
    setDraft({ ...plans[index] });
    setError("");
  };

  const savePlan = (event) => {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) {
      setError("Add an outfit name before saving.");
      return;
    }

    const nextPlans = plans.map((plan, index) =>
      index === editingDay ? { ...draft, title } : plan
    );

    try {
      localStorage.setItem("sajghar-weekly-planner", JSON.stringify(nextPlans));
      setPlans(nextPlans);
      setEditingDay(null);
      setError("");
    } catch {
      setError("Your plan could not be saved. Please try again.");
    }
  };

  return (
    <main className="dashboard-main planner-main">
      <section className="planner-page">
        <header className="planner-header">
          <p className="planner-eyebrow">SAJGHAR · PERSONAL WARDROBE</p>
          <h1>Weekly planner</h1>
          <p>Dress once for every plan.</p>
        </header>

        <div className="planner-week" aria-label="Weekly outfit plan">
          {weekDays.map((entry, index) => {
            const plan = plans[index];
            const isEmpty = !plan.title;
            const selectedItem = items.find(
              (item) => String(item.id) === plan.itemId
            );

            return (
              <article className="planner-day" key={entry.day}>
                <div className="planner-day-heading">
                  <span>{entry.day}</span>
                  <small>{entry.temperature}</small>
                </div>

                <button
                  className={`planner-day-art planner-color-${entry.color} ${
                    isEmpty ? "empty" : ""
                  }`}
                  onClick={() => startEditing(index)}
                  aria-label={
                    isEmpty
                      ? `Plan an outfit for ${entry.day}`
                      : `Edit ${entry.day}'s outfit: ${plan.title}`
                  }
                >
                  {isEmpty ? (
                    <span className="planner-plus" aria-hidden="true">
                      +
                    </span>
                  ) : (
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  )}
                </button>

                <p className="planner-occasion">{entry.occasion}</p>
                <h2>{plan.title || "Plan an outfit"}</h2>
                {selectedItem && (
                  <p className="planner-selected-item">
                    From your wardrobe: {selectedItem.original_name || "Saved piece"}
                  </p>
                )}
                <div className="planner-day-action">
                  <button onClick={() => startEditing(index)}>
                    {isEmpty ? "Add look" : "Edit look"}
                    <span aria-hidden="true"> →</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {editingDay !== null && (
          <form className="planner-editor" onSubmit={savePlan}>
            <div className="planner-editor-heading">
              <div>
                <p className="planner-eyebrow">YOUR WEEK, YOUR WAY</p>
                <h2>{weekDays[editingDay].day}&apos;s outfit</h2>
              </div>
              <button
                className="planner-editor-close"
                type="button"
                onClick={() => {
                  setEditingDay(null);
                  setError("");
                }}
                aria-label="Close outfit editor"
              >
                ×
              </button>
            </div>

            <div className="planner-editor-fields">
              <label>
                Outfit name
                <input
                  autoFocus
                  type="text"
                  maxLength={100}
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="e.g. Easy layers"
                />
              </label>

              <label>
                Wardrobe piece <span>(optional)</span>
                <select
                  value={draft.itemId}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      itemId: event.target.value,
                    }))
                  }
                >
                  <option value="">Choose a piece</option>
                  {items.map((item) => (
                    <option key={item.id} value={String(item.id)}>
                      {item.original_name || "Saved piece"}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {error && (
              <p className="planner-error" role="alert">
                {error}
              </p>
            )}
            <div className="planner-editor-actions">
              {plans[editingDay].title && (
                <button
                  className="planner-clear-button"
                  type="button"
                  onClick={() => {
                    const nextPlans = plans.map((plan, index) =>
                      index === editingDay
                        ? { title: "", itemId: "" }
                        : plan
                    );
                    try {
                      localStorage.setItem(
                        "sajghar-weekly-planner",
                        JSON.stringify(nextPlans)
                      );
                      setPlans(nextPlans);
                      setEditingDay(null);
                      setError("");
                    } catch {
                      setError("This outfit could not be removed. Please try again.");
                    }
                  }}
                >
                  Remove outfit
                </button>
              )}
              <button className="planner-save-button" type="submit">
                Save outfit <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
