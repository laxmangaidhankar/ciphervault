import { useMemo, useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useLayersMetadata } from "../../../hooks/useLayersMetadata";
import { useVillageSelection } from "../../../hooks/useVillageSelection";
import { API_BASE_URL } from "../../../services/api";
export const MapLegend = ({ activeLayerId }) => {
  const { layers } = useLayersMetadata();
  const { selectedVillage, selectedYear, hoverValue } = useVillageSelection();
  const portalRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const activeLayer = useMemo(() => layers.find((l) => l.id === activeLayerId), [layers, activeLayerId]);
  const gradient = useMemo(() => {
    const palette = activeLayer?.visualization?.palette;
    if (!palette || palette.length === 0) return "transparent";
    const step = 100 / (palette.length - 1);
    const stops = palette.map((color, i) => `${color} ${i * step}%`).join(", ");
    return `linear-gradient(to right, ${stops})`;
  }, [activeLayer]);
  useEffect(() => {
    const mapWrapper = document.querySelector(".leaflet-container")?.parentElement;
    if (!mapWrapper) return;
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.bottom = "1.5rem";
    el.style.right = "1rem";
    el.style.zIndex = "400";
    el.style.pointerEvents = "all";
    mapWrapper.appendChild(el);
    portalRef.current = el;
    return () => {
      if (mapWrapper.contains(el)) {
        mapWrapper.removeChild(el);
      }
    };
  }, []);
  useEffect(() => {
    if (!activeLayerId || !selectedVillage) {
      setStats(null);
      return;
    }
    let isMounted = true;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const start = `${selectedYear}-01-01`;
        const end = `${selectedYear}-12-31`;
        const id = selectedVillage.id;
        const url = `${API_BASE_URL}/api/v1/satellite/statistics?layer=${activeLayerId}&geometryType=village&geometryId=${id}&start=${start}&end=${end}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (isMounted) setStats(data);
      } catch (e) {
        if (isMounted) setStats(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [activeLayerId, selectedVillage, selectedYear]);
  if (!activeLayer) return null;
  const { name, visualization, ai_context } = activeLayer;
  const { min, max } = visualization;
  const content = <div className="bg-canvas-black border border-surface-border rounded-xl shadow-lg p-4 w-72">
    <h4 className="text-sm font-semibold text-accent-green mb-1">{name}</h4>

    {ai_context?.interpretation && <p className="text-xs text-content-dim mb-3 leading-relaxed">
      {ai_context.interpretation}
    </p>}

    {
      /* Advanced Statistics Section */
    }
    <div className="bg-surface-slate rounded p-2 mb-3 border border-surface-border">
      {loading ? <div className="flex justify-center p-2"><div className="animate-spin h-4 w-4 border-2 border-accent-green border-t-transparent rounded-full" /></div> : stats && stats.mean !== void 0 ? <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col">
          <span className="text-content-dim">Average</span>
          <span className="font-mono text-content-body font-bold">{stats.mean.toFixed(4)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-content-dim">Median</span>
          <span className="font-mono text-content-body font-bold">{stats.median.toFixed(4)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-content-dim">Minimum</span>
          <span className="font-mono text-content-body">{stats.min.toFixed(4)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-content-dim">Maximum</span>
          <span className="font-mono text-content-body">{stats.max.toFixed(4)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-content-dim">Std Dev</span>
          <span className="font-mono text-content-body">{stats.stdDev.toFixed(4)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-content-dim">Pixels</span>
          <span className="font-mono text-content-body">{stats.pixelCount?.toLocaleString()}</span>
        </div>
      </div> : <div className="text-xs text-content-dim text-center py-2">Select a village to see regional stats</div>}
    </div>

    {
      /* Live Cursor Value */
    }
    <div className="bg-surface-elevated rounded p-2 mb-3 border border-surface-border">
      <div className="flex justify-between items-center text-xs">
        <span className="text-content-dim">Cursor Value</span>
        {hoverValue ? <span className="font-mono text-accent-green font-bold">{hoverValue.value.toFixed(5)}</span> : <span className="text-content-dim italic">hover map to sample</span>}
      </div>
      {hoverValue && <div className="flex justify-between text-xs mt-1">
        <span className="text-content-dim">{hoverValue.lat.toFixed(5)}, {hoverValue.lng.toFixed(5)}</span>
      </div>}
    </div>

    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-content-dim mb-1">
        <span>Color Scale</span>
      </div>
      <div className="h-3 w-full rounded-sm" style={{ background: gradient }} />
      <div className="flex justify-between text-xs font-mono text-content-body mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  </div>;
  if (portalRef.current) {
    return ReactDOM.createPortal(content, portalRef.current);
  }
  return <div className="absolute bottom-6 right-4 z-400">
    {content}
  </div>;
};
