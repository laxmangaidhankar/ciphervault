import { useRisks } from "@/hooks/useRecommendations";
import { useVillageSelection } from "@/hooks/useVillageSelection";
import { Skeleton } from "../ui/Skeleton";
export const RiskDashboard = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const { data: risks, isLoading, error } = useRisks(selectedVillage?.id, selectedYear);
  if (isLoading) {
    return <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-surface-slate border border-surface-border rounded-xl">
            <Skeleton borderRadius="12px" />
          </div>)}
      </div>;
  }
  if (error || !risks) {
    return <div className="bg-surface-slate border border-surface-border rounded-xl p-4 flex items-center justify-center">
        <span className="text-body text-text-muted">Risk assessment unavailable</span>
      </div>;
  }
  const urgencyColors = {
    critical: "bg-semantic-danger text-white",
    high: "bg-semantic-danger opacity-80 text-white",
    medium: "bg-semantic-warning text-canvas-black",
    low: "bg-brand-mint text-canvas-black"
  };
  return <div className="flex flex-col gap-3">
      {risks.map((risk, index) => {
    const isCritical = risk.risk_level === "critical";
    return <div
      key={index}
      className={`bg-surface-slate border border-surface-border rounded-xl p-3 flex items-center justify-between ${isCritical ? "animate-[pulse-border_1.5s_ease-in-out_infinite] border-semantic-danger" : ""}`}
    >
            <div className="flex flex-col gap-1 w-2/3">
              <span className="text-mono text-text-primary text-xs uppercase">{risk.component}</span>
              <span className="text-body text-text-secondary text-xs truncate">
                {risk.one_line_explanation}
              </span>
            </div>
            <div className={`px-2 py-1 rounded-tag text-mono text-[10px] uppercase shrink-0 ${urgencyColors[risk.risk_level] || urgencyColors.low}`}>
              {risk.risk_level}
            </div>
          </div>;
  })}
    </div>;
};
