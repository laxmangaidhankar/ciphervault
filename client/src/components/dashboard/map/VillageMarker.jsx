import { Marker } from "react-leaflet";
import L from "leaflet";
import { VillagePopup } from "./VillagePopup";
import { useVillageSelection } from "@/hooks/useVillageSelection";
const createCustomIcon = (isSelected) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        ${isSelected ? `<div class="absolute w-4 h-4 bg-brand-mint rounded-full shadow-[0_0_10px_var(--brand-mint)]"></div>
               <div class="absolute w-6 h-6 border-2 border-brand-mint rounded-full"></div>` : `<div class="absolute w-2.5 h-2.5 bg-brand-mint rounded-full animate-pulse"></div>`}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};
export const VillageMarker = ({ village }) => {
  const { selectedVillage, setSelectedVillage, flyToVillage } = useVillageSelection();
  const isSelected = selectedVillage?.id === village.id;
  const handleClick = () => {
    setSelectedVillage(village);
    flyToVillage(village);
  };
  return <Marker
    position={village.coordinates}
    icon={createCustomIcon(isSelected)}
    eventHandlers={{
      click: handleClick
    }}
  >
      {
    /* We will handle popup logic locally or through map state to avoid default leaflet popups if needed, but a custom component works. */
  }
      {isSelected && <VillagePopup village={village} />}
    </Marker>;
};
