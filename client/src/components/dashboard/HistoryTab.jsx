import { useMemo } from "react";
import { useVillageSelection } from "@/hooks/useVillageSelection";
import { useHistoricalChanges, useHistoricalData } from "@/hooks/useHistoricalData";
import { TrendChart } from "../charts/TrendChart";
import { HealthScoreTrendChart } from "../charts/HealthScoreTrendChart";
import { ChangeDetection } from "./ChangeDetection";
import { useTranslation } from "react-i18next";
import { Skeleton } from "../ui/Skeleton";
export const HistoryTab = () => {
  const { selectedVillage } = useVillageSelection();
  const { data: changesData, isLoading: changesLoading, error: changesError } = useHistoricalChanges(selectedVillage?.id);
  const { data: historyData, isLoading: historyLoading, error: historyError } = useHistoricalData(selectedVillage?.id);
  const { t } = useTranslation();
  const error = changesError || historyError;
  const tableData = useMemo(() => {
    if (!historyData?.years) return [];
    return historyData.years.map((year) => {
      const metric = historyData.metrics?.find((m) => m.year === year);
      const score = historyData.scores?.find((s) => s.year === year);
      return {
        year,
        overallScore: score?.overall ?? 0,
        ndvi: metric?.ndvi ?? 0,
        ndwi: metric?.ndwi ?? 0,
        waterAreaHa: metric?.waterAreaHa ?? 0,
        greenCoverPercent: metric?.greenCoverPercent ?? 0,
        temperature: metric?.temperature ?? 0,
        rainfall: metric?.rainfall ?? 0
      };
    });
  }, [historyData]);
  const waterScoreChanges = useMemo(
    () => historyData?.scores?.map((s) => ({ year: s.year, value: s.water.score })),
    [historyData]
  );
  const vegScoreChanges = useMemo(
    () => historyData?.scores?.map((s) => ({ year: s.year, value: s.vegetation.score })),
    [historyData]
  );
  const climateScoreChanges = useMemo(
    () => historyData?.scores?.map((s) => ({ year: s.year, value: s.climate.score })),
    [historyData]
  );
  const floodScoreChanges = useMemo(
    () => historyData?.scores?.map((s) => ({ year: s.year, value: s.flood.score })),
    [historyData]
  );
  const landScoreChanges = useMemo(
    () => historyData?.scores?.map((s) => ({ year: s.year, value: s.land.score })),
    [historyData]
  );
  if (error) {
    return <div className="flex flex-col gap-6 w-full max-w-full pb-8">
        <div className="bg-surface-slate border border-surface-border rounded-card p-6 h-[400px] flex items-center justify-center">
          <span className="text-body text-text-muted">{t("dashboard.history_error", "Historical analysis temporarily unavailable \u2014 try refreshing.")}</span>
        </div>
      </div>;
  }
  return <div className="flex flex-col gap-6 w-full max-w-full pb-8">

      {
    /* 1. Overall Trajectory */
  }
      <div className="flex flex-col gap-3 mt-4">
        <h3 className="text-mono text-text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-violet" />
          {t("dashboard.overall_trajectory", "OVERALL TRAJECTORY")}
        </h3>
        <HealthScoreTrendChart data={changesData?.score_changes} isLoading={changesLoading} />
      </div>

      {
    /* 2. Year-wise Breakdown Table */
  }
      <div className="flex flex-col gap-3">
        <h3 className="text-mono text-text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-mint" />
          {t("dashboard.yearwise_breakdown", "YEAR-WISE HISTORY (2022\u20132026)")}
        </h3>

        {historyLoading ? <div className="bg-surface-slate border border-surface-border rounded-xl p-4 flex flex-col gap-2">
            <Skeleton height="30px" width="100%" />
            <Skeleton height="150px" width="100%" />
          </div> : <div className="flex flex-col gap-4">
            <div className="bg-surface-slate border border-surface-border rounded-xl p-4 overflow-hidden">
              <h4 className="text-mono text-text-secondary text-xs mb-2">{t("dashboard.core_metrics", "CORE METRICS")}</h4>
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-surface-border text-text-secondary">
                    <th className="py-2 px-1 font-semibold">{t("dashboard.year", "YEAR")}</th>
                    <th className="py-2 px-1 font-semibold text-brand-mint">{t("dashboard.score_label", "SCORE")}</th>
                    <th className="py-2 px-1 font-semibold">{t("metrics.ndvi", "NDVI")}</th>
                    <th className="py-2 px-1 font-semibold">{t("metrics.ndwi", "NDWI")}</th>
                    <th className="py-2 px-1 font-semibold">{t("metrics.water_ha", "WATER")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50 text-text-primary">
                  {tableData.map((row) => <tr key={row.year} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-2.5 px-1 font-bold">{row.year}</td>
                      <td className="py-2.5 px-1 text-brand-mint font-bold">{row.overallScore.toFixed(1)}</td>
                      <td className="py-2.5 px-1">{row.ndvi.toFixed(2)}</td>
                      <td className="py-2.5 px-1">{row.ndwi.toFixed(2)}</td>
                      <td className="py-2.5 px-1">{row.waterAreaHa.toFixed(1)}</td>
                    </tr>)}
                </tbody>
              </table>
            </div>

            <div className="bg-surface-slate border border-surface-border rounded-xl p-4 overflow-hidden">
              <h4 className="text-mono text-text-secondary text-xs mb-2">{t("dashboard.climate_metrics", "CLIMATE & ENVIRONMENT")}</h4>
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-surface-border text-text-secondary">
                    <th className="py-2 px-1 font-semibold">{t("dashboard.year", "YEAR")}</th>
                    <th className="py-2 px-1 font-semibold">{t("metrics.green_cover", "GREEN %")}</th>
                    <th className="py-2 px-1 font-semibold">{t("metrics.temp", "TEMP (\xB0C)")}</th>
                    <th className="py-2 px-1 font-semibold">{t("metrics.rain", "RAIN (MM)")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50 text-text-primary">
                  {tableData.map((row) => <tr key={`climate-${row.year}`} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-2.5 px-1 font-bold">{row.year}</td>
                      <td className="py-2.5 px-1">{row.greenCoverPercent.toFixed(1)}%</td>
                      <td className="py-2.5 px-1">{row.temperature.toFixed(1)}°</td>
                      <td className="py-2.5 px-1">{row.rainfall.toFixed(0)}</td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>}
      </div>

      {
    /* 3. Component Score Evolution Mini-Charts */
  }
      <div className="flex flex-col gap-3">
        <h3 className="text-mono text-text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-semantic-warning" />
          {t("dashboard.component_scores", "COMPONENT SCORE EVOLUTION")}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 h-[180px]">
            <h4 className="text-mono text-text-secondary text-xs">{t("dashboard.water_score_trend", "WATER SECURITY SCORE")}</h4>
            <TrendChart
    data={waterScoreChanges}
    isLoading={historyLoading}
    valueKey="value"
    color="#3B82F6"
    name={t("dashboard.water_score", "Water Score")}
    chartType="line"
  />
          </div>
          <div className="flex flex-col gap-2 h-[180px]">
            <h4 className="text-mono text-text-secondary text-xs">{t("dashboard.veg_score_trend", "VEGETATION HEALTH SCORE")}</h4>
            <TrendChart
    data={vegScoreChanges}
    isLoading={historyLoading}
    valueKey="value"
    color="#10B981"
    name={t("dashboard.veg_score", "Vegetation Score")}
    chartType="line"
  />
          </div>
          <div className="flex flex-col gap-2 h-[180px]">
            <h4 className="text-mono text-text-secondary text-xs">{t("dashboard.climate_score_trend", "CLIMATE STABILITY SCORE")}</h4>
            <TrendChart
    data={climateScoreChanges}
    isLoading={historyLoading}
    valueKey="value"
    color="#F59E0B"
    name={t("dashboard.climate_score", "Climate Score")}
    chartType="line"
  />
          </div>
          <div className="flex flex-col gap-2 h-[180px]">
            <h4 className="text-mono text-text-secondary text-xs">{t("dashboard.flood_score_trend", "FLOOD PREPAREDNESS SCORE")}</h4>
            <TrendChart
    data={floodScoreChanges}
    isLoading={historyLoading}
    valueKey="value"
    color="#EC4899"
    name={t("dashboard.flood_score", "Flood Score")}
    chartType="line"
  />
          </div>
          <div className="flex flex-col gap-2 h-[180px] md:col-span-2">
            <h4 className="text-mono text-text-secondary text-xs">{t("dashboard.land_score_trend", "LAND SUSTAINABILITY SCORE")}</h4>
            <TrendChart
    data={landScoreChanges}
    isLoading={historyLoading}
    valueKey="value"
    color="#8B5CF6"
    name={t("dashboard.land_score", "Land Score")}
    chartType="line"
  />
          </div>
        </div>
      </div>

      {
    /* 4. Notable Changes */
  }
      <div className="flex flex-col gap-3">
        <h3 className="text-mono text-text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-mint" />
          {t("dashboard.notable_changes", "NOTABLE CHANGES (2022-2026)")}
        </h3>
        <ChangeDetection changes={changesData?.top_changes} isLoading={changesLoading} />
      </div>

      {
    /* 5. NDVI & Water Area Trends */
  }
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 h-[200px]">
          <h4 className="text-mono text-text-secondary text-xs">{t("dashboard.ndvi_trend", "NDVI TREND")}</h4>
          <TrendChart
    data={changesData?.ndvi_changes}
    isLoading={changesLoading}
    valueKey="value"
    color="#3cffd0"
    name={t("metrics.ndvi_name", "NDVI")}
    chartType="line"
  />
        </div>
        <div className="flex flex-col gap-2 h-[200px]">
          <h4 className="text-mono text-text-secondary text-xs">{t("dashboard.surface_water_trend", "SURFACE WATER (HA)")}</h4>
          <TrendChart
    data={changesData?.water_area_changes}
    isLoading={changesLoading}
    valueKey="value_ha"
    color="#3B82F6"
    name={t("metrics.water_area_name", "Water Area")}
    chartType="bar"
  />
        </div>
      </div>
    </div>;
};
