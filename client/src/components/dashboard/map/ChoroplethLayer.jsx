import { useMemo } from "react";
import { GeoJSON } from "react-leaflet";
import { useRegionalData } from "@/hooks/useRegionalData";
import { useVillageSelection } from "@/hooks/useVillageSelection";
const NDVI_COLORS = {
  excellent: "#10b981",
  // > 0.6
  good: "#4ade80",
  // 0.4 - 0.6
  fair: "#f59e0b",
  // 0.2 - 0.4
  poor: "#ef4444",
  // < 0.2
  unknown: "#94a3b8"
  // no data
};
export const ChoroplethLayer = () => {
  const { selectedYear, selectedVillage, setSelectedVillage, selectedNDVICategory } = useVillageSelection();
  const { data } = useRegionalData(selectedYear);
  const geoJsonFeatures = useMemo(() => {
    if (!data?.features) return null;
    if (selectedNDVICategory) {
      return {
        ...data.features,
        features: data.features.features.filter((f) => {
          const regionId = f.properties?.id;
          const metric = data.metrics[regionId];
          return metric && metric.category === selectedNDVICategory;
        })
      };
    }
    return data.features;
  }, [data, selectedNDVICategory]);
  if (!geoJsonFeatures) return null;
  return <>
      <GeoJSON
    key={`choro-${selectedYear}-${selectedNDVICategory || "all"}-${geoJsonFeatures.features.length}`}
    data={geoJsonFeatures}
    style={(feature) => {
      const regionId = feature?.properties?.id;
      const metric = regionId ? data?.metrics[regionId] : null;
      let fillColor = NDVI_COLORS.unknown;
      if (metric) {
        fillColor = NDVI_COLORS[metric.category] || NDVI_COLORS.unknown;
      }
      const isSelected = selectedVillage?.id === regionId;
      return {
        color: isSelected ? "#ffffff" : "#475569",
        weight: isSelected ? 3 : 1,
        fillColor,
        fillOpacity: isSelected ? 0.8 : 0.6
      };
    }}
    onEachFeature={(feature, layer) => {
      const regionId = feature.properties?.id;
      const regionName = feature.properties?.name || "Unknown Region";
      const metric = regionId ? data?.metrics[regionId] : null;
      const tooltipContent = `<div class="bg-surface-slate p-2 border border-brand-mint rounded">
            <strong>${regionName}</strong><br/>
            NDVI: ${metric ? metric.ndvi.toFixed(2) : "N/A"} <br/>
            Category: <span class="capitalize">${metric ? metric.category : "Unknown"}</span>
          </div>`;
      layer.bindTooltip(tooltipContent, {
        direction: "auto",
        className: "custom-leaflet-tooltip"
        // We can style this globally
      });
      layer.on({
        click: () => {
          if (regionId) {
            setSelectedVillage({
              id: regionId,
              name: regionName
            });
          }
        }
      });
    }}
  />

    </>;
};
