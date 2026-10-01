import { useMemo } from "react";
import { useVillageSelection } from "@/hooks/useVillageSelection";
import { useScores } from "@/hooks/useScores";
import { HealthScoreRing } from "./HealthScoreRing";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { TrendBadge } from "./TrendBadge";
import { useTranslation } from "react-i18next";
export const ScoreCard = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const { data: score, isLoading, error } = useScores(selectedVillage?.id, selectedYear);
  const { t } = useTranslation();
  const overallTrend = useMemo(() => {
    if (!score) return "stable";
    let improving = 0;
    let declining = 0;
    const comps = [score.water, score.vegetation, score.climate, score.flood, score.land];
    comps.forEach((c) => {
      if (c?.trend === "improving") improving++;
      else if (c?.trend === "declining") declining++;
    });
    if (improving > declining) return "improving";
    if (declining > improving) return "declining";
    return "stable";
  }, [score]);
  if (error) {
    return <div className="bg-surface-slate border border-surface-border rounded-card p-6 h-[400px] flex items-center justify-center">
        <span className="text-body text-text-muted">{t("dashboard.analysis_unavailable", "Analysis temporarily unavailable \u2014 try refreshing.")}</span>
      </div>;
  }
  return <div className="bg-surface-slate border border-surface-border rounded-card p-6 flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-mono text-text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-mint" />
          {t("dashboard.health_score", "VILLAGE HEALTH SCORE")}
        </h3>
        {score && <TrendBadge trend={overallTrend} />}
      </div>

      <div className="flex flex-col items-center justify-center py-4 border-b border-surface-border">
        <HealthScoreRing score={score?.overall} isLoading={isLoading} />
      </div>

      <ScoreBreakdown score={score} isLoading={isLoading} />
    </div>;
};
