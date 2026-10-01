import { useVillageSelection } from "@/hooks/useVillageSelection";
import { useSatelliteData } from "@/hooks/useSatelliteData";
import { MetricsPanel } from "./MetricsPanel";
import { ClimateAssessment } from "./ClimateAssessment";
import { LandCoverChart } from "../charts/LandCoverChart";
import { NDVIPieChart } from "../charts/NDVIPieChart";
import { useMapLayers } from "@/hooks/MapLayersContext";
import { useRegionalData } from "@/hooks/useRegionalData";
import { useTranslation } from "react-i18next";
export const EnvironmentTab = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const { data, isLoading, error } = useSatelliteData(selectedVillage?.id, selectedYear);
  const layers = useMapLayers();
  const { data: regionalData, isLoading: regionalLoading } = useRegionalData(selectedYear);
  const { t } = useTranslation();
  return <div className="flex flex-col gap-6 w-full max-w-full pb-8">
      <MetricsPanel data={data} isLoading={isLoading} error={error} />
      
      {
    /* Dynamic Pie Chart based on active map layer */
  }
      <div className="flex flex-col gap-3">
        <h3 className="text-mono text-text-primary flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-brand-blue" />
          {layers.showNDVI ? t("dashboard.regional_ndvi", "REGIONAL NDVI DISTRIBUTION") : t("dashboard.land_cover", "LAND COVER BREAKDOWN")}
        </h3>
        {
    /* Fixed height wrapper so chart never gets squeezed */
  }
        <div className="w-full" style={{ minHeight: "280px" }}>
          {layers.showNDVI ? <NDVIPieChart data={regionalData} isLoading={regionalLoading} /> : <LandCoverChart data={data?.landCover} isLoading={isLoading} totalAreaHa={selectedVillage?.area} />}
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        <h3 className="text-mono text-text-primary flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-brand-violet" />
          {t("dashboard.climate_assessment", "CLIMATE ASSESSMENT")}
        </h3>
        <ClimateAssessment />
      </div>
    </div>;
};
