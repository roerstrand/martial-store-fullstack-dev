import { useId, useState } from "react";
import "../../pages/Pages.css";

const SORT_OPTIONS = [
  { value: "default",      label: "Default" },
  { value: "price-asc",   label: "Price: Low → High" },
  { value: "price-desc",  label: "Price: High → Low" },
  { value: "name-asc",    label: "Name: A → Z" },
  { value: "rating-desc", label: "Top Rated" },
];

const DEFAULT_FILTERS = {
  sort: "default",
  minPrice: "",
  maxPrice: "",
  onSale: false,
  newArrival: false,
  minRating: 0,
};

function Filter({ filters, onChange, onClose }) {
  const [local, setLocal] = useState(filters);
  const id = useId();

  const update = (key, value) => setLocal((prev) => ({ ...prev, [key]: value }));

  const handleApply = () => { onChange(local); onClose(); };

  const handleReset = () => { onChange(DEFAULT_FILTERS); onClose(); };

  return (
    <div className="filter-panel">

      <div className="filter-col">
        <p className="filter-section-title" id={`${id}-sort`}>Sort by</p>
        <div className="filter-options-chips" role="group" aria-labelledby={`${id}-sort`}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`filter-option${local.sort === opt.value ? " filter-option--active" : ""}`}
              aria-pressed={local.sort === opt.value}
              onClick={() => update("sort", opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-col">
        <p className="filter-section-title" id={`${id}-price`}>Price range</p>
        <div className="filter-price-row" role="group" aria-labelledby={`${id}-price`}>
          <label htmlFor={`${id}-min`} className="ac-visually-hidden">Minimum price (EUR)</label>
          <input
            id={`${id}-min`}
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Min"
            value={local.minPrice}
            onChange={(e) => update("minPrice", e.target.value)}
            className="filter-price-input"
          />
          <span className="filter-price-sep" aria-hidden="true">—</span>
          <label htmlFor={`${id}-max`} className="ac-visually-hidden">Maximum price (EUR)</label>
          <input
            id={`${id}-max`}
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Max"
            value={local.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
            className="filter-price-input"
          />
        </div>

        <p className="filter-section-title" style={{ marginTop: "1rem" }} id={`${id}-rating`}>Min rating</p>
        <div className="filter-rating" role="group" aria-labelledby={`${id}-rating`}>
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              type="button"
              className={`filter-rating-btn${local.minRating >= r ? " filter-rating-btn--active" : ""}`}
              aria-pressed={local.minRating === r}
              aria-label={r === 5 ? "5 stars" : `${r} stars and up`}
              onClick={() => update("minRating", local.minRating === r ? 0 : r)}
            >
              <span aria-hidden="true">{local.minRating >= r ? "★" : "☆"}</span>
            </button>
          ))}
        </div>

        <label className="filter-sale-label">
          <input
            type="checkbox"
            checked={local.onSale}
            onChange={(e) => update("onSale", e.target.checked)}
          />
          On sale only
        </label>
      </div>

      <div />

      <div className="filter-footer">
        <button type="button" className="filter-apply-btn" onClick={handleApply}>Apply ›</button>
        <button type="button" className="filter-reset-btn" onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
}

export { DEFAULT_FILTERS };
export default Filter;
