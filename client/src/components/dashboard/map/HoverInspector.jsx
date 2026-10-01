import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useMapEvents } from "react-leaflet";
import { useVillageSelection } from "../../../hooks/useVillageSelection";
import { useMapLayers } from "../../../hooks/MapLayersContext";
import { useLayersMetadata } from "../../../hooks/useLayersMetadata";
import { booleanPointInPolygon } from "../../../utils/geo";
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
function getAccentColor(value, palette, min, max) {
  if (!palette || palette.length === 0) return "#4ade80";
  let norm = (value - min) / (max - min);
  norm = Math.max(0, Math.min(1, norm));
  const idx = Math.floor(norm * (palette.length - 1));
  return palette[idx] || "#4ade80";
}
export const HoverInspector = () => {
  const { selectedVillage, selectedVillagePolygon, selectedYear, setHoverValue } = useVillageSelection();
  const { activeSatelliteLayer } = useMapLayers();
  const { layers } = useLayersMetadata();
  const [hoverData, setHoverData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const activeLayerMeta = useMemo(() => layers.find((l) => l.id === activeSatelliteLayer), [layers, activeSatelliteLayer]);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);
  const isHoveringRef = useRef(false);
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(/* @__PURE__ */ new Map());
  const fetchPixelValue = useCallback(async (lat, lng) => {
    if (!activeSatelliteLayer || !selectedVillage) return;
    const start = `${selectedYear}-01-01`;
    const end = `${selectedYear}-12-31`;
    const rLat = lat.toFixed(4);
    const rLng = lng.toFixed(4);
    const cacheKey = `${activeSatelliteLayer}_${selectedVillage.id}_${rLat}_${rLng}`;
    if (cacheRef.current.has(cacheKey)) {
      setLoading(true);
      const val = await cacheRef.current.get(cacheKey);
      if (isHoveringRef.current) {
        if (val !== null) {
          setHoverData({ value: val, lat, lng, layer: activeSatelliteLayer });
          setHoverValue({ value: val, lat, lng });
        } else {
          setHoverData(null);
          setHoverValue(null);
        }
        setLoading(false);
      }
      return;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    setLoading(true);
    const promise = fetch(
      `${API_BASE_URL}/api/v1/satellite/value?layer=${activeSatelliteLayer}&lat=${lat}&lng=${lng}&start=${start}&end=${end}&geometryId=${selectedVillage.id}`,
      { signal: abortControllerRef.current.signal }
    ).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }).then((data) => data.value).catch((e) => {
      if (e.name !== "AbortError") return null;
      throw e;
    });
    cacheRef.current.set(cacheKey, promise);
    try {
      const val = await promise;
      if (cacheRef.current.size > 1e3) {
        const firstKey = cacheRef.current.keys().next().value;
        if (firstKey !== void 0) {
          cacheRef.current.delete(firstKey);
        }
      }
      if (isHoveringRef.current) {
        if (val !== null) {
          setHoverData({ value: val, lat, lng, layer: activeSatelliteLayer });
          setHoverValue({ value: val, lat, lng });
        } else {
          setHoverData(null);
          setHoverValue(null);
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        setHoverData(null);
        setHoverValue(null);
      }
    } finally {
      if (isHoveringRef.current) {
        setLoading(false);
      }
    }
  }, [activeSatelliteLayer, selectedYear, selectedVillage, setHoverValue]);
  useEffect(() => {
    cacheRef.current.clear();
  }, [activeSatelliteLayer, selectedYear, selectedVillage]);
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  useMapEvents({
    mousemove(e) {
      if (!activeSatelliteLayer || !selectedVillagePolygon) {
        setVisible(false);
        return;
      }
      const { lat, lng } = e.latlng;
      if (!booleanPointInPolygon([lng, lat], selectedVillagePolygon)) {
        setVisible(false);
        isHoveringRef.current = false;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (abortControllerRef.current) abortControllerRef.current.abort();
        setHoverData(null);
        return;
      }
      setVisible(true);
      isHoveringRef.current = true;
      if (tooltipRef.current) {
        tooltipRef.current.style.transform = `translate(${e.originalEvent.clientX + 20}px, ${e.originalEvent.clientY + 20}px)`;
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        fetchPixelValue(lat, lng);
      }, 200);
    },
    mouseout() {
      setVisible(false);
      isHoveringRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      setHoverData(null);
      setLoading(false);
    }
  });
  if (!activeSatelliteLayer) return null;
  let accentColor = "#4ade80";
  if (hoverData && activeLayerMeta?.visualization) {
    const { palette, min, max } = activeLayerMeta.visualization;
    accentColor = getAccentColor(hoverData.value, palette, min, max);
  }
  const interpretation = hoverData ? interpretValue(hoverData.layer, hoverData.value) : null;
  return <div
    ref={tooltipRef}
    className="fixed top-0 left-0 z-10000 pointer-events-none select-none transition-opacity duration-150 ease-in-out"
    style={{ opacity: visible ? 1 : 0 }}
  >
    <div
      className="backdrop-blur-md shadow-2xl"
      style={{
        background: "rgba(12, 12, 20, 0.75)",
        borderLeft: `3px solid ${accentColor}`,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "6px",
        padding: "8px 12px",
        minWidth: "140px"
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600, marginBottom: 4, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {activeSatelliteLayer}
      </div>

      {loading ? <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontStyle: "italic" }}>Reading pixel...</div> : hoverData ? <>
        <div style={{ color: accentColor, fontWeight: 700, fontSize: 16, fontFamily: "monospace", lineHeight: 1.1, marginBottom: 4 }}>
          {hoverData.value.toFixed(4)}
        </div>

        {interpretation && <div style={{ color: "#e2e8f0", fontSize: 11, fontWeight: 500, marginBottom: 4 }}>
          {interpretation}
        </div>}

        <div style={{ display: "flex", gap: "8px", color: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "monospace" }}>
          <span>{hoverData.lat.toFixed(5)}</span>
          <span>{hoverData.lng.toFixed(5)}</span>
        </div>
      </> : <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>No Data</div>}
    </div>
  </div>;
};
