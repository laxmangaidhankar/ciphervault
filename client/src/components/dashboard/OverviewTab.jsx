import { ScoreCard } from "./ScoreCard";
import { useVillageSelection } from "@/hooks/useVillageSelection";
import { useSatelliteData } from "@/hooks/useSatelliteData";
import { useRecommendations } from "@/hooks/useRecommendations";
import { RecommendationCard } from "./RecommendationCard";
import { Skeleton } from "../ui/Skeleton";
import { useTranslation } from "react-i18next";
export const OverviewTab = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const { data: weather } = useSatelliteData(selectedVillage?.id, selectedYear);
  const { data: recommendations, isLoading: recsLoading } = useRecommendations(selectedVillage?.id, selectedYear);
  const { t } = useTranslation();
  return <div className="flex flex-col gap-6 w-full max-w-full pb-8">
      <ScoreCard />
      
      {
    /* Weather Quick Summary inside Overview */
  }
      <div className="flex flex-col gap-3 mt-2">
        <h3 className="text-mono text-text-primary flex items-center gap-2 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
          {t("dashboard.quick_conditions", "QUICK CONDITIONS")}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-slate border border-surface-border rounded-xl p-3 flex justify-between items-center">
            <span className="text-mono text-text-secondary text-[10px]">{t("dashboard.temp", "TEMP")}</span>
            <span className="text-body text-text-primary text-sm">{weather?.temperature?.toFixed(1) || "--"}°C</span>
          </div>
          <div className="bg-surface-slate border border-surface-border rounded-xl p-3 flex justify-between items-center">
            <span className="text-mono text-text-secondary text-[10px]">{t("dashboard.rain", "RAIN")}</span>
            <span className="text-body text-text-primary text-sm">{weather?.rainfall?.toFixed(1) || "--"}mm</span>
          </div>
        </div>
      </div>

      {
    /* Recommendations Preview for Level 10 */
  }
      <div className="flex flex-col gap-3">
        <h3 className="text-mono text-text-primary flex items-center gap-2 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-violet" />
          {t("dashboard.top_recommendations", "TOP RECOMMENDATIONS")}
        </h3>
        
        {recsLoading && <div className="flex flex-col gap-3">
            <div className="h-[150px] bg-surface-slate border border-surface-border rounded-xl">
              <Skeleton borderRadius="12px" />
            </div>
            <div className="h-[150px] bg-surface-slate border border-surface-border rounded-xl">
              <Skeleton borderRadius="12px" />
            </div>
          </div>}

        {!recsLoading && recommendations && recommendations.length > 0 && <div className="flex flex-col gap-3">
            {recommendations.slice(0, 2).map((rec, idx) => <RecommendationCard key={idx} recommendation={rec} />)}
          </div>}

        {!recsLoading && (!recommendations || recommendations.length === 0) && <div className="bg-surface-slate border border-surface-border rounded-xl p-4 h-[100px] flex items-center justify-center">
            <span className="text-body text-text-muted text-sm">{t("dashboard.recs_unavailable", "Recommendations unavailable")}</span>
          </div>}
      </div>
    </div>;
};
