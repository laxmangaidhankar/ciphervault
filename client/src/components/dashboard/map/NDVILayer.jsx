import { useEffect, useState } from "react";
import { TileLayer } from "react-leaflet";
import { GEEProgress } from "../ui/GEEProgress";
import { apiService } from "@/services/api";
export const NDVILayer = ({ village, data, isLoading }) => {
  const [tileUrl, setTileUrl] = useState(null);
  useEffect(() => {
    setTileUrl(null);
    if (!village || !data?.year) return;
    let mounted = true;
    const fetchTiles = async () => {
      try {
        const boundary = village.boundary;
        const geometry = boundary;
        const res = await apiService.post(
          `/api/v1/satellite/ndvi/tiles`,
          { boundary: geometry, year: data.year }
        );
        if (mounted && res?.urlFormat) {
          setTileUrl(res.urlFormat);
        }
      } catch (err) {
      }
    };
    fetchTiles();
    return () => {
      mounted = false;
    };
  }, [village?.id, data?.year]);
  if (!village || !village.boundary) return null;
  return <>
      {tileUrl && <TileLayer
    url={tileUrl}
    zIndex={10}
    opacity={0.85}
  />}
      {isLoading && <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[400]">
          <GEEProgress message="Retrieving satellite data (~45s on first load)…" cached={false} />
        </div>}
    </>;
};
