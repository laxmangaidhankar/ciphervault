import { useEffect, useRef, useState } from "react";
import { useMap, GeoJSON, TileLayer } from "react-leaflet";
import L from "leaflet";
import { LAND_COVER_COLORS, LAND_COVER_LABELS } from "../charts/LandCoverChart";
import { apiService } from "@/services/api";
function LandCoverLegendControl({ data }) {
  const map = useMap();
  const controlRef = useRef(null);
  useEffect(() => {
    if (!data?.landCover) return;
    const entries = Object.keys(LAND_COVER_COLORS).map((key) => ({ key, value: data.landCover[key] ?? 0, label: LAND_COVER_LABELS[key], color: LAND_COVER_COLORS[key] })).filter((e) => e.value > 0.1).sort((a, b) => b.value - a.value);
    const total = entries.reduce((s, e) => s + e.value, 0);
    const LegendControl = L.Control.extend({
      onAdd: () => {
        const div = L.DomUtil.create("div");
        div.style.cssText = `
          background: rgba(17, 24, 39, 0.92);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(55, 65, 81, 0.8);
          border-radius: 10px;
          padding: 10px 12px;
          font-family: 'Space Mono', monospace;
          min-width: 160px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        `;
        const title = document.createElement("div");
        title.style.cssText = "color:#94a3b8;font-size:9px;letter-spacing:0.08em;margin-bottom:8px;text-transform:uppercase;font-weight:600;";
        title.textContent = "Land Cover";
        div.appendChild(title);
        entries.forEach((e) => {
          const pct = total > 0 ? (e.value / total * 100).toFixed(1) : e.value.toFixed(1);
          const row = document.createElement("div");
          row.style.cssText = "display:flex;align-items:center;gap:7px;margin-bottom:5px;";
          const dot = document.createElement("span");
          dot.style.cssText = `width:9px;height:9px;border-radius:50%;background:${e.color};flex-shrink:0;`;
          const labelEl = document.createElement("span");
          labelEl.style.cssText = "color:#cbd5e1;font-size:10px;flex:1;";
          labelEl.textContent = e.label;
          const valEl = document.createElement("span");
          valEl.style.cssText = "color:#f1f5f9;font-size:10px;font-weight:600;";
          valEl.textContent = `${pct}%`;
          row.appendChild(dot);
          row.appendChild(labelEl);
          row.appendChild(valEl);
          div.appendChild(row);
        });
        return div;
      },
      onRemove: () => {
      }
    });
    const ctrl = new LegendControl({ position: "bottomleft" });
    ctrl.addTo(map);
    controlRef.current = ctrl;
    return () => {
      if (controlRef.current) {
        controlRef.current.remove();
        controlRef.current = null;
      }
    };
  }, [map, data]);
  return null;
}
export const LandCoverLayer = ({ village, data }) => {
  if (!village || !village.boundary) return null;
  let dominantKey = "cropland";
  let dominantValue = -1;
  if (data?.landCover) {
    Object.entries(data.landCover).forEach(([key, val]) => {
      if (val > dominantValue) {
        dominantValue = val;
        dominantKey = key;
      }
    });
  }
  const dominantColor = LAND_COVER_COLORS[dominantKey];
  const dominantLabel = LAND_COVER_LABELS[dominantKey];
  const [tileUrl, setTileUrl] = useState(null);
  useEffect(() => {
    if (!village || !data?.year) return;
    let mounted = true;
    const fetchTiles = async () => {
      try {
        const res = await apiService.get(
          `/api/v1/satellite/${village.id}/landcover/tiles`,
          { year: data.year }
        );
        if (mounted && res?.urlFormat) {
          setTileUrl(res.urlFormat);
        }
      } catch {
      }
    };
    fetchTiles();
    return () => {
      mounted = false;
    };
  }, [village?.id, data?.year]);
  const boundary = village.boundary;
  const geoJsonData = { type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: boundary }] };
  const buildTooltipContent = () => {
    if (!data?.landCover) {
      return `<div style="padding:6px 8px;font-family:'Space Mono',monospace">
        <span style="color:#f1f5f9;font-weight:600;font-size:11px">${village.name}</span>
        <div style="color:#6b7280;font-size:10px;margin-top:4px">No land cover data</div>
      </div>`;
    }
    const entries = Object.keys(LAND_COVER_COLORS).map((key) => ({ key, value: data.landCover[key] ?? 0, label: LAND_COVER_LABELS[key], color: LAND_COVER_COLORS[key] })).filter((e) => e.value > 0.1).sort((a, b) => b.value - a.value);
    const total = entries.reduce((s, e) => s + e.value, 0);
    const rows = entries.map((e) => {
      const pct = total > 0 ? (e.value / total * 100).toFixed(1) : e.value.toFixed(1);
      return `<div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
        <span style="width:8px;height:8px;border-radius:50%;background:${e.color};display:inline-block;flex-shrink:0;"></span>
        <span style="color:#94a3b8;font-size:10px;flex:1;">${e.label}</span>
        <span style="color:#f1f5f9;font-size:10px;font-weight:600;">${pct}%</span>
      </div>`;
    }).join("");
    return `<div style="padding:8px 10px;font-family:'Space Mono',monospace;min-width:160px;">
      <div style="color:#f1f5f9;font-weight:700;font-size:12px;margin-bottom:6px;border-bottom:1px solid #374151;padding-bottom:6px;">${village.name}</div>
      <div style="color:#6b7280;font-size:9px;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:2px;">Land Cover Distribution</div>
      ${rows}
      <div style="margin-top:8px;padding-top:6px;border-top:1px solid #374151;display:flex;align-items:center;gap:6px;">
        <span style="width:8px;height:8px;border-radius:50%;background:${dominantColor};display:inline-block;"></span>
        <span style="color:#94a3b8;font-size:9px;">Dominant: </span>
        <span style="color:#f1f5f9;font-size:9px;font-weight:600;">${dominantLabel}</span>
      </div>
    </div>`;
  };
  const onEachFeature = (_feature, layer) => {
    const polygonLayer = layer;
    polygonLayer.bindTooltip(buildTooltipContent(), {
      sticky: true,
      opacity: 1,
      className: "land-cover-tooltip"
    });
    polygonLayer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({ fillOpacity: 0.75, weight: 3 });
      },
      mouseout: (e) => {
        const target = e.target;
        target.setStyle({ fillOpacity: 0.5, weight: 2 });
      }
    });
  };
  return <>
      {tileUrl && <TileLayer
    url={tileUrl}
    zIndex={10}
    opacity={0.85}
  />}
      <GeoJSON
    key={`lc-${village.id}-${dominantKey}`}
    data={geoJsonData}
    style={{
      color: dominantColor,
      weight: 2,
      fillColor: "transparent",
      fillOpacity: 0,
      dashArray: void 0
    }}
    onEachFeature={onEachFeature}
  />
      <LandCoverLegendControl data={data} />
    </>;
};
