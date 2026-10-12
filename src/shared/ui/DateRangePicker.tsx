import { CalendarRange } from "lucide-react";
import { useState } from "react";
import { DATE_RANGE_PRESETS, rangeFor, rangeLabel } from "../../lib/dateRange";
import type { DateRange, DateRangeKey } from "../../lib/dateRange";
import { Modal } from "./Modal";

export function DateRangePicker({ range, onChange }: { range: DateRange; onChange: (range: DateRange) => void }) {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(range.from.toISOString().slice(0, 10));
  const [customTo, setCustomTo] = useState(range.to.toISOString().slice(0, 10));

  function choose(key: DateRangeKey) {
    if (key === "custom") {
      onChange({ key, from: new Date(`${customFrom}T00:00:00`), to: new Date(`${customTo}T23:59:59`) });
    } else {
      onChange(rangeFor(key));
    }
    setOpen(false);
  }

  return (
    <>
      <button className="select-button" onClick={() => setOpen(true)} aria-label="Select date range">
        <CalendarRange size={15} />
        <span>{rangeLabel(range)}</span>
      </button>
      {open ? (
        <Modal title="Select date range" onClose={() => setOpen(false)}>
          <div className="range-list">
            {DATE_RANGE_PRESETS.map((preset) => (
              <button key={preset.key} className="range-option" onClick={() => choose(preset.key)}>
                {preset.label}
              </button>
            ))}
          </div>
          <div className="range-custom">
            <label className="form-field">
              <span>From</span>
              <input type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} />
            </label>
            <label className="form-field">
              <span>To</span>
              <input type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} />
            </label>
            <button className="primary-button" onClick={() => choose("custom")}>Apply custom range</button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}