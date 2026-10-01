import { useEffect, useState } from "react";
import { TileLayer } from "react-leaflet";
import { GEEProgress } from "../../../components/ui/GEEProgress";
import { apiService } from "../../../services/api";
import { useLayersMetadata } from "../../../hooks/useLayersMetadata";
export const SatelliteLayer = ({ village, data, activeLayerId }) => {
  const [tileUrl, setTileUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { layers } = useLayersMetadata();
  useEffect(() => {
    setTileUrl(null);
    if (!village || !data?.year || !activeLayerId) return;
    let mounted = true;
    const fetchTiles = async () => {
      try {
        setIsLoading(true);
        const start = `${data.year}-01-01`;
        const end = `${data.year}-12-31`;
        const res = await apiService.get(
          `/api/v1/satellite/tiles?layer=${activeLayerId}&geometryType=village&geometryId=${village.id}&start=${start}&end=${end}&cloud=20`
        );
        if (mounted && res?.urlFormat) {
          setTileUrl(res.urlFormat);
        }
      } catch (err) {
        console.error("Failed to fetch tiles:", err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    fetchTiles();
    return () => {
      mounted = false;
    };
  }, [village?.id, data?.year, activeLayerId]);
  if (!village || !village.boundary || !activeLayerId) return null;
  const activeMetadata = layers.find((l) => l.id === activeLayerId);
  const opacity = activeMetadata?.visualization?.opacity || 0.85;
  return <>
      {tileUrl && <TileLayer
    key={tileUrl}
    url={tileUrl}
    zIndex={10}
    opacity={opacity}
    maxZoom={21}
  />}
      {isLoading && <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400]">
          <GEEProgress message={`Retrieving ${activeMetadata?.name || "satellite"} data...`} cached={false} />
        </div>}
    </>;
};
