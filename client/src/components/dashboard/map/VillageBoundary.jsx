import { useEffect, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import { useTheme } from "../../../hooks/useTheme";
export const VillageBoundary = ({ polygon }) => {
  const map = useMap();
  const geoJsonRef = useRef(null);
  useTheme();
  useEffect(() => {
  }, [polygon, map]);
  if (!polygon) {
    return null;
  }
  const geoJsonData = { type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: polygon }] };
  const boundaryColor = "#22c55e";
  const fillColor = "#22c55e";
  return <GeoJSON
    key={polygon ? JSON.stringify(polygon) : "empty-boundary"}
    ref={geoJsonRef}
    data={geoJsonData}
    style={{
      color: boundaryColor,
      weight: 2.5,
      fillColor,
      fillOpacity: 0.15
    }}
  />;
};
