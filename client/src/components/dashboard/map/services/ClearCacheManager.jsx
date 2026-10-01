import { useEffect, useRef } from "react";
import { useVillageSelection } from "../../../../hooks/useVillageSelection";
import { useMapLayers } from "../../../../hooks/MapLayersContext";
export const ClearCacheManager = () => {
  const { selectedVillage } = useVillageSelection();
  const { clearAllLayers } = useMapLayers();
  const prevVillageIdRef = useRef(null);
  useEffect(() => {
    if (selectedVillage?.id !== prevVillageIdRef.current) {
      if (prevVillageIdRef.current !== null) {
        clearAllLayers();
      }
      prevVillageIdRef.current = selectedVillage?.id || null;
    }
  }, [selectedVillage, clearAllLayers]);
  return null;
};
