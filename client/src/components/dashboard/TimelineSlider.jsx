import React from "react";
import { useVillageSelection } from "@/hooks/useVillageSelection";
export const TimelineSlider = () => {
  const { selectedYear, setSelectedYear } = useVillageSelection();
  const years = [2022, 2023, 2024, 2025, 2026];
  return <div className="w-full px-4 py-6 bg-surface-slate border border-surface-border rounded-xl relative flex flex-col justify-center">
      <div className="relative w-full h-1 bg-surface-border rounded-full">
        {years.map((year, index) => {
    const isActive = year === selectedYear;
    const isPast = year < selectedYear;
    const position = index / (years.length - 1) * 100;
    return <React.Fragment key={year}>
              {
      /* Colored track segment up to selected year */
    }
              {isPast && <div
      className="absolute h-full bg-brand-mint"
      style={{
        left: `${index / (years.length - 1) * 100}%`,
        width: `${1 / (years.length - 1) * 100}%`
      }}
    />}
              
              <div
      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center"
      style={{ left: `${position}%` }}
      onClick={() => setSelectedYear(year)}
    >
                {
      /* Thumb */
    }
                <div
      className={`w-4 h-4 rounded-full transition-colors z-10 ${isActive ? "bg-brand-mint shadow-[0_0_10px_var(--brand-mint)]" : "bg-surface-border hover:bg-surface-elevated"}`}
    />
                {
      /* Year Label */
    }
                <span
      className={`absolute top-6 text-mono transition-colors whitespace-nowrap ${isActive ? "text-brand-mint font-bold" : "text-text-secondary"}`}
    >
                  {year}
                </span>
              </div>
            </React.Fragment>;
  })}
      </div>
    </div>;
};
