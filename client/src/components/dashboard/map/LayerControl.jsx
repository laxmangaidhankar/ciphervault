import React, { useMemo, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Layers } from "lucide-react";
import { useMapLayers } from "../../../hooks/MapLayersContext";
import { useLayersMetadata } from "../../../hooks/useLayersMetadata";
import { useTranslation } from "react-i18next";
export const LayerControl = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { t } = useTranslation();
  const { layers: metadataLayers, isLoading } = useLayersMetadata();
  const layers = useMapLayers();
  const portalRef = useRef(null);
  useEffect(() => {
    const mapWrapper = document.querySelector(".leaflet-container")?.parentElement;
    if (!mapWrapper) return;
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.top = "1rem";
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
  const baseLayers = [
    { id: "dark", labelKey: "map.layers.dark", labelDefault: "Dark Matter" },
    { id: "satellite", labelKey: "map.layers.satellite", labelDefault: "Satellite" },
    { id: "osm", labelKey: "map.layers.osm", labelDefault: "Street Map" }
  ];
  const groupedLayers = useMemo(() => {
    const groups = {};
    metadataLayers.forEach((layer) => {
      if (!groups[layer.category]) groups[layer.category] = [];
      groups[layer.category].push(layer);
    });
    return groups;
  }, [metadataLayers]);
  const content = <div
    style={{ fontFamily: "inherit" }}
    onMouseEnter={() => setIsOpen(true)}
    onMouseLeave={() => setIsOpen(false)}
  >
      <div className="bg-surface-slate border border-surface-border rounded-xl shadow-lg overflow-hidden flex flex-col">
        <div className="p-3 bg-surface-elevated flex items-center justify-center cursor-pointer">
          <Layers className="w-5 h-5 text-text-primary" />
        </div>

        {isOpen && <div className="p-4 flex flex-col gap-3 min-w-[220px] max-h-[420px] overflow-y-auto">
            {
    /* Base Map */
  }
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
                {t("map.base_map", "BASE MAP")}
              </h4>
              {baseLayers.map((layer) => <label
    key={layer.id}
    className="flex items-center gap-2 cursor-pointer mb-2 select-none"
  >
                  <input
    type="radio"
    name="baseLayer"
    checked={layers.activeBaseLayer === layer.id}
    onChange={() => layers.setActiveBaseLayer(layer.id)}
    className="accent-brand-mint"
  />
                  <span className="text-sm text-text-primary">
                    {t(layer.labelKey, layer.labelDefault)}
                  </span>
                </label>)}
            </div>

            <div className="h-px bg-surface-border w-full" />

            {
    /* Satellite Overlays */
  }
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
                {t("map.overlays", "OVERLAYS")}
              </h4>
              {isLoading ? <div className="text-text-secondary text-sm">Loading layers...</div> : Object.entries(groupedLayers).map(([category, catLayers]) => <div key={category} className="mb-3">
                    <div className="text-xs font-semibold text-text-secondary mb-1 uppercase">
                      ▼ {category}
                    </div>
                    {catLayers.map((layer) => <label
    key={layer.id}
    className="flex items-center gap-2 cursor-pointer mb-2 pl-2 select-none"
  >
                        <input
    type="checkbox"
    checked={layers.activeSatelliteLayer === layer.id}
    onChange={() => layers.toggleSatelliteLayer(layer.id)}
    className="accent-brand-mint"
  />
                        <span
    className="text-sm text-text-primary"
    title={layer.description}
  >
                          {layer.name}
                        </span>
                      </label>)}
                  </div>)}
            </div>
          </div>}
      </div>
    </div>;
  if (portalRef.current) {
    return ReactDOM.createPortal(content, portalRef.current);
  }
  return <div className="absolute top-4 right-4 z-[400]">
      {content}
    </div>;
};
