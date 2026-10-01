import { useEffect, useState, useRef } from "react";
import { useMap } from "react-leaflet";
export const HoverAnalyticsService = ({ farmsLayer }) => {
  const map = useMap();
  const [hoveredProps, setHoveredProps] = useState(null);
  const cardRef = useRef(null);
  const hasHoverRef = useRef(false);
  useEffect(() => {
    if (!farmsLayer) return;
    const handleMouseOver = (e) => {
      if (e.layer.feature?.properties) {
        hasHoverRef.current = true;
        setHoveredProps(e.layer.feature.properties);
      }
    };
    const handleMouseOut = () => {
      hasHoverRef.current = false;
      setHoveredProps(null);
    };
    const handleMouseMove = (e) => {
      if (hasHoverRef.current && cardRef.current) {
        cardRef.current.style.left = `${e.originalEvent.clientX + 15}px`;
        cardRef.current.style.top = `${e.originalEvent.clientY + 15}px`;
      }
    };
    farmsLayer.on("mouseover", handleMouseOver);
    farmsLayer.on("mouseout", handleMouseOut);
    map.on("mousemove", handleMouseMove);
    return () => {
      farmsLayer.off("mouseover", handleMouseOver);
      farmsLayer.off("mouseout", handleMouseOut);
      map.off("mousemove", handleMouseMove);
    };
  }, [farmsLayer, map]);
  return <div
    ref={cardRef}
    className={`fixed z-[9999] pointer-events-none bg-canvas-black border border-surface-border p-4 rounded-xl shadow-2xl w-64 backdrop-blur-md bg-opacity-90 transition-opacity duration-150 ${hoveredProps ? "opacity-100" : "opacity-0"}`}
    style={{ left: -1e3, top: -1e3 }}
  >
      {hoveredProps && <div className="flex flex-col space-y-2">
          <div className="border-b border-surface-border pb-2 mb-1">
            <span className="text-xs text-text-secondary uppercase font-semibold">Farm ID</span>
            <div className="text-sm font-mono text-text-primary">{hoveredProps.farm_id}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-xs text-text-secondary block">Area</span>
              <span className="font-medium text-text-primary">{hoveredProps.area_ha} ha</span>
            </div>
            <div>
              <span className="text-xs text-text-secondary block">Perimeter</span>
              <span className="font-medium text-text-primary">{hoveredProps.perimeter_m} m</span>
            </div>
            <div>
              <span className="text-xs text-text-secondary block">NDVI</span>
              <span className="font-medium text-green-400">{hoveredProps.ndvi}</span>
            </div>
            <div>
              <span className="text-xs text-text-secondary block">Vegetation</span>
              <span className="font-medium text-text-primary">{hoveredProps.vegetation}</span>
            </div>
            <div>
              <span className="text-xs text-text-secondary block">Water Stress</span>
              <span className="font-medium text-text-primary">{hoveredProps.water_stress}</span>
            </div>
            <div>
              <span className="text-xs text-text-secondary block">Est. Crop</span>
              <span className="font-medium text-text-primary">{hoveredProps.crop_type}</span>
            </div>
          </div>
          
          <div className="pt-2 mt-1 border-t border-surface-border">
            <span className="text-xs text-text-secondary block">Last Updated: {hoveredProps.last_updated}</span>
          </div>
        </div>}
    </div>;
};
