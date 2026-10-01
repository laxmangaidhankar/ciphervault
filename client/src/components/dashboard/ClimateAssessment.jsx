import { useEffect, useState } from "react";
import { useVillageSelection } from "@/hooks/useVillageSelection";
import { apiService } from "@/services/api";
import { Skeleton } from "../ui/Skeleton";
import { CloudRain, Thermometer, Droplets } from "lucide-react";
const RISK_STYLES = {
  low: { bg: "bg-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-500" },
  moderate: { bg: "bg-amber-500/20", text: "text-amber-400", dot: "bg-amber-500" },
  high: { bg: "bg-orange-500/20", text: "text-orange-400", dot: "bg-orange-500" },
  extreme: { bg: "bg-red-500/20", text: "text-red-400", dot: "bg-red-500" }
};
const getRiskStyle = (level) => RISK_STYLES[level?.toLowerCase()] ?? RISK_STYLES.low;
export const ClimateAssessment = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!selectedVillage) return;
    let mounted = true;
    const fetchAssessment = async () => {
      setLoading(true);
      try {
        const data = await apiService.get(
          `/api/v1/weather/${selectedVillage.id}/assessment`,
          { year: selectedYear }
        );
        if (mounted) setAssessment(data);
      } catch {
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAssessment();
    return () => {
      mounted = false;
    };
  }, [selectedVillage, selectedYear]);
  if (loading) {
    return <div className="bg-surface-slate border border-surface-border rounded-xl p-4 h-[160px]">
        <Skeleton borderRadius="4px" />
      </div>;
  }
  if (!assessment) {
    return <div className="bg-surface-slate border border-surface-border rounded-xl p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-mono text-text-secondary text-[9px] tracking-widest flex items-center gap-1.5">
              <CloudRain className="w-3 h-3" /> RAINFALL ADEQUACY
            </span>
            <span className="text-mono text-text-muted text-[9px]">—</span>
          </div>
          <div className="h-2 bg-surface-border rounded-full overflow-hidden">
            <div className="h-full w-0 bg-emerald-500 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {["HEAT STRESS", "DROUGHT RISK"].map((label) => <div key={label} className="flex flex-col gap-1.5">
              <span className="text-mono text-text-secondary text-[9px] tracking-widest">{label}</span>
              <div className="w-fit px-3 py-1 rounded-full bg-surface-elevated border border-surface-border">
                <span className="text-mono text-text-muted text-[9px]">—</span>
              </div>
            </div>)}
        </div>
        <p className="text-body text-text-muted text-xs text-center">Climate assessment unavailable for this region</p>
      </div>;
  }
  const { heat_stress, rainfall_adequacy, drought_risk } = assessment;
  const percent = rainfall_adequacy.percent_of_normal || 100;
  const clampedPct = Math.min(Math.max(percent, 0), 200);
  const barWidth = `${clampedPct / 200 * 100}%`;
  const adequacyColor = rainfall_adequacy.adequacy === "deficit" ? "#EF4444" : rainfall_adequacy.adequacy === "surplus" ? "#3B82F6" : "#10B981";
  const heatStyle = getRiskStyle(heat_stress.risk_level);
  const droughtStyle = getRiskStyle(drought_risk.risk_level);
  return <div className="bg-surface-slate border border-surface-border rounded-xl p-5 flex flex-col gap-5">

      {
    /* Rainfall Adequacy Bar */
  }
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-mono text-text-secondary text-[9px] tracking-widest flex items-center gap-1.5">
            <CloudRain className="w-3 h-3" /> RAINFALL ADEQUACY
          </span>
          <span className="text-mono text-xs font-semibold capitalize" style={{ color: adequacyColor }}>
            {rainfall_adequacy.adequacy} ({percent.toFixed(0)}%)
          </span>
        </div>
        {
    /* Gradient background track */
  }
        <div className="relative h-2.5 bg-surface-border rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/40 via-emerald-500/40 to-blue-500/40" />
          <div
    className="absolute top-0 bottom-0 w-2.5 rounded-full shadow-md transition-all duration-700"
    style={{ left: `calc(${barWidth} - 5px)`, backgroundColor: adequacyColor, boxShadow: `0 0 6px ${adequacyColor}` }}
  />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-mono text-text-muted text-[8px]">DEFICIT</span>
          <span className="text-mono text-text-muted text-[8px]">NORMAL</span>
          <span className="text-mono text-text-muted text-[8px]">SURPLUS</span>
        </div>
      </div>

      {
    /* Risk Badges */
  }
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-mono text-text-secondary text-[9px] tracking-widest flex items-center gap-1">
            <Thermometer className="w-3 h-3" /> HEAT STRESS
          </span>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full w-fit ${heatStyle.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${heatStyle.dot}`} />
            <span className={`text-mono text-xs font-semibold uppercase ${heatStyle.text}`}>
              {heat_stress.risk_level}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-mono text-text-secondary text-[9px] tracking-widest flex items-center gap-1">
            <Droplets className="w-3 h-3" /> DROUGHT RISK
          </span>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full w-fit ${droughtStyle.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${droughtStyle.dot}`} />
            <span className={`text-mono text-xs font-semibold uppercase ${droughtStyle.text}`}>
              {drought_risk.risk_level}
            </span>
          </div>
        </div>
      </div>
    </div>;
};
