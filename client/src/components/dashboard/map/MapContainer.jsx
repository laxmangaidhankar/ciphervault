import React, { useEffect } from "react";
import { MapContainer as LeafletMap, TileLayer, useMap, useMapEvents } from "react-leaflet";

import { useTheme } from "../../../hooa ks/useTheme";

const MapInstanceBinder = () => {
  const map = useMap();
  const { setMapInstance } = useVillageSelection();
  useEffect(() => {
    setMapInstance(map);
  }, [map, setMapInstance]);
  return null;
};
import { booleanPointInPolygon } from "../../../utils/geo";
const MapClickHandler = () => {
  const { setClickedLocation, selectedVillagePolygon } = useVillageSelection();
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (selectedVillagePolygon) {
        if (!booleanPointInPolygon([lng, lat], selectedVillagePolygon)) {
          return;
        }
      }
      if (lat >= 6.5 && lat <= 38.5 && lng >= 68 && lng <= 97.5) {
        setClickedLocation({ lat, lng });
      }
    }
  });
  return null;
};
export const MapContainer = React.memo(() => {
  const { selectedVillage, selectedYear, selectedVillagePolygon, setActiveLayers } = useVillageSelection();
  const layers = useMapLayers();
  const { data } = useSatelliteData(selectedVillage?.id, selectedYear);
  const { theme } = useTheme();
  useEffect(() => {
    const active = [];
    if (layers.activeSatelliteLayer) active.push(layers.activeSatelliteLayer);
    setActiveLayers(active);
  }, [layers.activeSatelliteLayer, setActiveLayers]);
  const getTileUrl = () => {
  return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
};
  return <div className={`flex-1 relative bg-canvas-black border border-surface-border rounded-card m-2 overflow-hidden md:m-0 md:rounded-none md:border-0 md:border-t-0 ${layers.activeSatelliteLayer ? "cursor-crosshair" : ""}`}>
      <LeafletMap
    center={[20.5937, 78.9629]}
    zoom={5}
    minZoom={4}
    maxZoom={21}
    maxBounds={[
      [6.5, 68],
      [38.5, 97.5]
    ]}
    zoomControl={false}
    className={`w-full h-full ${layers.activeSatelliteLayer ? "cursor-crosshair" : ""}`}
  >
        <MapInstanceBinder />
        <MapClickHandler />
        
        {
    /* Modular Services */
  }
        <SpatialLockManager />
        <ClearCacheManager />
        <FarmBoundaryService />

        <TileLayer
    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
    url={getTileUrl()}
    maxZoom={21}
    maxNativeZoom={19}
  />

        {
    /* Village markers removed as requested */
  }

        {selectedVillage && !layers.activeSatelliteLayer && <VillageBoundary key={selectedVillage.id} polygon={selectedVillagePolygon} />}
        
        {selectedVillage && layers.activeSatelliteLayer && <SatelliteLayer
    village={selectedVillage}
    data={data}
    activeLayerId={layers.activeSatelliteLayer}
  />}

        <HoverInspector />
        <InspectionPopup />

        <LayerControl />
        {layers.activeSatelliteLayer && <MapLegend activeLayerId={layers.activeSatelliteLayer} />}
        <MapControls />
        <VillageSearch />
      </LeafletMap>
    </div>;
});
MapContainer.displayName = "MapContainer";
