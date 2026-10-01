import { useEffect, useState, useRef } from "react";
import { useMapEvents, GeoJSON } from "react-leaflet";
import { useVillageSelection } from "../../../../hooks/useVillageSelection";
import { HoverAnalyticsService } from "./HoverAnalyticsService";
import { API_BASE_URL } from "../../../../services/api";
const farmCache = {};
export const FarmBoundaryService = () => {
  const { selectedVillage } = useVillageSelection();
  const [zoom, setZoom] = useState(0);
  const [farmsData, setFarmsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const geoJsonRef = useRef(null);
  const map = useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    }
  });
  useEffect(() => {
    setZoom(map.getZoom());
  }, [map]);
  useEffect(() => {
    if (selectedVillage && farmCache[selectedVillage.id]) {
      setFarmsData(farmCache[selectedVillage.id]);
    } else {
      setFarmsData(null);
    }
  }, [selectedVillage]);
  useEffect(() => {
    if (!selectedVillage || zoom < 17) {
      return;
    }
    if (farmsData || loading || farmCache[selectedVillage.id]) return;
    const fetchFarms = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/villages/${selectedVillage.id}/farms`);
        if (res.ok) {
          const data = await res.json();
          farmCache[selectedVillage.id] = data;
          setFarmsData(data);
        }
      } catch (e) {
        console.error("Failed to load farm boundaries:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, [zoom, selectedVillage, farmsData, loading]);
  if (!farmsData || zoom < 17) {
    return null;
  }
  return <>
    <GeoJSON
      key={`${selectedVillage?.id}-farms`}
      ref={geoJsonRef}
      data={farmsData}
      style={{
        color: "#22c55e",
        weight: 1,
        fillOpacity: 0.1,
        opacity: 0.6
      }}
      onEachFeature={(_, layer) => {
        layer.on({
          mouseover: (e) => {
            const layer2 = e.target;
            layer2.setStyle({
              weight: 2,
              color: "#4ade80",
              fillOpacity: 0.4
            });
            layer2.bringToFront();
          },
          mouseout: (e) => {
            if (geoJsonRef.current) {
              geoJsonRef.current.resetStyle(e.target);
            }
          }
        });
      }}
    />
    {zoom >= 18 && <HoverAnalyticsService farmsLayer={geoJsonRef.current} />}
  </>;
};
