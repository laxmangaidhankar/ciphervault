import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { useVillageSelection } from "../../../../hooks/useVillageSelection";
export const SpatialLockManager = () => {
  const map = useMap();
  const { selectedVillagePolygon } = useVillageSelection();
  useEffect(() => {
    if (!selectedVillagePolygon) {
      map.setMaxBounds([
        [6.5, 68],
        [38.5, 97.5]
      ]);
      map.setMinZoom(4);
      return;
    }
    try {
      const geoJsonLayer = L.geoJSON({
        type: "Feature",
        properties: {},
        geometry: selectedVillagePolygon
      });
      const bounds = geoJsonLayer.getBounds();
      if (bounds && bounds.isValid()) {
        map.flyToBounds(bounds, { padding: [30, 30], maxZoom: 14, duration: 1.5 });
        setTimeout(() => {
          const lockBounds = bounds.pad(0.1);
          map.setMaxBounds(lockBounds);
          map.setMinZoom(map.getBoundsZoom(lockBounds) - 1);
          map.options.maxBoundsViscosity = 1;
        }, 1500);
      }
    } catch (e) {
      console.error("Error setting spatial locks:", e);
    }
  }, [selectedVillagePolygon, map]);
  return null;
};
