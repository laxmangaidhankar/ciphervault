import { useEffect, useState, useMemo } from "react";
import { Popup } from "react-leaflet";
import { useVillageSelection } from "../../../hooks/useVillageSelection";
import { useMapLayers } from "../../../hooks/MapLayersContext";
import { useLayersMetadata } from "../../../hooks/useLayersMetadata";
import { API_BASE_URL } from "../../../services/api";
function interpretValue(layer, value) {
  switch (layer) {
    case "NDVI":
    case "GNDVI":
    case "EVI":
    case "SAVI":
      if (value < 0) return "Water / Urban";
      if (value < 0.2) return "Bare Soil / Sparse";
      if (value < 0.4) return "Low Vegetation";
      if (value < 0.6) return "Moderate Vegetation";
      if (value < 0.8) return "Healthy Vegetation";
      return "Dense Forest";
    case "NDWI":
      if (value > 0.1) return "Water Body";
      if (value > -0.1) return "Moist Soil / Wetland";
      return "Dry Surface";
    case "NDMI":
      if (value < 0) return "Low Moisture";
      if (value < 0.2) return "Moderate Moisture";
      return "High Moisture";
    default:
      return "Active Pixel";
  }
}
function getSatelliteSource(layer) {
  const radarLayers = ["VV", "VH", "RATIO", "RVI", "SMI"];
  return radarLayers.includes(layer) ? "Sentinel-1 SAR (Copernicus)" : "Sentinel-2 MSI (Copernicus)";
}
function getAccentColor(value, palette, min, max) {
  if (!palette || palette.length === 0) return "#4ade80";
  let norm = (value - min) / (max - min);
  norm = Math.max(0, Math.min(1, norm));
  const idx = Math.floor(norm * (palette.length - 1));
  return palette[idx] || "#4ade80";
}
export const InspectionPopup = () => {
  const { clickedLocation, setClickedLocation, selectedYear, selectedVillage } = useVillageSelection();
  const { activeSatelliteLayer } = useMapLayers();
  const { layers } = useLayersMetadata();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const activeLayerMeta = useMemo(() => layers.find((l) => l.id === activeSatelliteLayer), [layers, activeSatelliteLayer]);
  useEffect(() => {
    if (!clickedLocation || !activeSatelliteLayer) {
      setData(null);
      setError(null);
      return;
    }
    let isMounted = true;
    const fetchDetailedData = async () => {
      setLoading(true);
      setError(null);
      try {
        const start = `${selectedYear}-01-01`;
        const end = `${selectedYear}-12-31`;
        const valRes = await fetch(
          `${API_BASE_URL}/api/v1/satellite/value?layer=${activeSatelliteLayer}&lat=${clickedLocation.lat}&lng=${clickedLocation.lng}&start=${start}&end=${end}`
        );
        if (!valRes.ok) throw new Error(`API error ${valRes.status}`);
        const valJson = await valRes.json();
        let meanVal = void 0;
        if (selectedVillage) {
          try {
            const statRes = await fetch(
              `${API_BASE_URL}/api/v1/satellite/statistics?layer=${activeSatelliteLayer}&geometryType=village&geometryId=${selectedVillage.id}&start=${start}&end=${end}`
            );
            if (statRes.ok) {
              const statJson = await statRes.json();
              meanVal = statJson.mean;
            }
          } catch (e) {
          }
        }
        if (isMounted) {
          if (valJson.value !== null && valJson.value !== void 0) {
            setData({
              value: valJson.value,
              interpretation: interpretValue(activeSatelliteLayer, valJson.value),
              lat: clickedLocation.lat,
              lng: clickedLocation.lng,
              layer: activeSatelliteLayer,
              mean: meanVal
            });
          } else {
            setData(null);
            setError("No pixel data at this location");
          }
        }
      } catch (e) {
        if (isMounted) {
          setData(null);
          setError(e.message || "Failed to fetch pixel data");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDetailedData();
    return () => {
      isMounted = false;
    };
  }, [clickedLocation, activeSatelliteLayer, selectedYear, selectedVillage]);
  if (!clickedLocation || !activeSatelliteLayer) return null;
  const acquisitionNote = `${selectedYear} annual median composite`;
  const satellite = getSatelliteSource(activeSatelliteLayer);
  let accentColor = "#4ade80";
  if (data && activeLayerMeta?.visualization) {
    const { palette, min, max } = activeLayerMeta.visualization;
    accentColor = getAccentColor(data.value, palette, min, max);
  }
  const diffFromAvg = data?.mean !== void 0 && data?.value !== void 0 ? data.value - data.mean : null;
  const diffSign = diffFromAvg !== null ? diffFromAvg > 0 ? "+" : "" : "";
  return <Popup
    position={[clickedLocation.lat, clickedLocation.lng]}
    eventHandlers={{
      remove: () => setClickedLocation(null)
    }}
    closeButton={true}
    maxWidth={320}
  >
    <div className="bg-surface-slate/90 backdrop-blur-md border border-surface-border rounded-xl p-5 min-w-70 shadow-2xl relative overflow-hidden font-sans">
      {
        /* Accent top border */
      }
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: accentColor }} />

      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
        <span className="text-text-primary font-semibold text-sm tracking-wide uppercase">
          {activeLayerMeta?.name || activeSatelliteLayer}
        </span>
      </div>

      {loading ? <div className="py-8 text-center">
        <div className="animate-pulse text-text-secondary text-sm">Retrieving pixel data...</div>
      </div> : error ? <div className="py-4">
        <div className="text-semantic-warning text-sm font-medium">Unable to retrieve NDVI data.</div>
        <div className="text-text-muted text-xs mt-1">Please try again inside the village boundary.</div>
      </div> : data ? <div className="space-y-4">
        {
          /* Main value */
        }
        <div className="bg-surface-elevated rounded-lg p-3 border border-surface-border/50">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-text-secondary text-xs font-medium uppercase">Value</span>
            <span className="font-bold text-2xl tracking-tight" style={{ color: accentColor }}>
              {data.value.toFixed(4)}
            </span>
          </div>

          {data.mean !== void 0 && <div className="flex justify-between items-baseline mt-2">
            <span className="text-text-muted text-[10px] uppercase">Region Avg</span>
            <span className="text-text-primary text-xs font-mono">{data.mean.toFixed(4)}</span>
          </div>}

          {diffFromAvg !== null && <div className="flex justify-between items-baseline mt-1">
            <span className="text-text-muted text-[10px] uppercase">Difference</span>
            <span className={`text-xs font-mono ${diffFromAvg > 0 ? "text-semantic-success" : "text-semantic-error"}`}>
              {diffSign}{diffFromAvg.toFixed(4)}
            </span>
          </div>}
        </div>

        {
          /* Classification */
        }
        <div>
          <div className="text-text-muted text-[10px] uppercase mb-1">Vegetation Health</div>
          <div className="inline-block bg-brand-mint/10 text-brand-mint font-medium text-xs px-2.5 py-1 rounded-md">
            {data.interpretation}
          </div>
        </div>

        <hr className="border-surface-border" />

        {
          /* Location */
        }
        <div>
          <div className="text-text-muted text-[10px] uppercase mb-1">Region</div>
          <div className="text-text-primary font-medium text-sm">
            {selectedVillage ? `${selectedVillage.name}, ${selectedVillage.district}` : "Unknown Location"}
          </div>
        </div>

        {
          /* Coordinates */
        }
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-text-muted text-[10px] uppercase mb-1">Latitude</div>
            <div className="text-text-secondary font-mono text-xs">{data.lat.toFixed(6)}</div>
          </div>
          <div>
            <div className="text-text-muted text-[10px] uppercase mb-1">Longitude</div>
            <div className="text-text-secondary font-mono text-xs">{data.lng.toFixed(6)}</div>
          </div>
        </div>

        <hr className="border-surface-border" />

        {
          /* Metadata */
        }
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-text-muted text-[10px] uppercase mb-1">Satellite</div>
            <div className="text-text-secondary text-[11px] leading-tight">{satellite}</div>
          </div>
          <div>
            <div className="text-text-muted text-[10px] uppercase mb-1">Status</div>
            <div className="text-text-secondary text-[11px] leading-tight">{acquisitionNote}</div>
          </div>
        </div>
      </div> : <div className="text-text-secondary text-sm py-4">Click a pixel to inspect.</div>}
    </div>
  </Popup>;
};
