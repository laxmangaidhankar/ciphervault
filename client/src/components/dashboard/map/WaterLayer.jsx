import { useEffect, useState } from "react";
import { GeoJSON, Tooltip, TileLayer } from "react-leaflet";
import { apiService } from "@/services/api";
export const WaterLayer = ({ village, data }) => {
  const [tileUrl, setTileUrl] = useState(null);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  useEffect(() => {
    setTileUrl(null);
    setTilesLoaded(false);
    if (!village || !data?.year) return;
    let mounted = true;
    const fetchTiles = async () => {
      try {
        const boundary2 = village.boundary;
        const geometry = boundary2;
        const res = await apiService.post(
          `/api/v1/satellite/water/tiles`,
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
  const boundary = village.boundary;
  const geoJsonData = { type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: boundary }] };
  const polygonFillOpacity = tilesLoaded ? 0.05 : 0.45;
  return <>
      {tileUrl && <TileLayer
    url={tileUrl}
    zIndex={10}
    opacity={0.85}
    eventHandlers={{
      load: () => setTilesLoaded(true)
    }}
  />}
      <GeoJSON
    key={`water-${village.id}`}
    data={geoJsonData}
    style={{
      color: "#3b82f6",
      weight: 2,
      fillColor: "#3b82f6",
      fillOpacity: polygonFillOpacity
    }}
  >
        {data && <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-leaflet-popup">
            <div className="bg-surface-slate border border-brand-mint rounded-md p-2 text-text-primary text-mono">
              WATER: {data.waterAreaHa.toFixed(1)} HA
            </div>
          </Tooltip>}
      </GeoJSON>
    </>;
};
