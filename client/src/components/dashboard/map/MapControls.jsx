import { useMap } from "react-leaflet";
import { Plus, Minus, Focus } from "lucide-react";
export const MapControls = () => {
  const map = useMap();
  return <div className="absolute bottom-6 right-4 z-[400] flex flex-col gap-2">
      <button
    onClick={() => map.zoomIn()}
    className="w-10 h-10 bg-surface-slate border border-surface-border rounded-xl flex items-center justify-center text-text-primary hover:border-brand-mint hover:text-brand-mint transition-colors"
  >
        <Plus className="w-5 h-5" />
      </button>
      <button
    onClick={() => map.zoomOut()}
    className="w-10 h-10 bg-surface-slate border border-surface-border rounded-xl flex items-center justify-center text-text-primary hover:border-brand-mint hover:text-brand-mint transition-colors"
  >
        <Minus className="w-5 h-5" />
      </button>
      <button
    onClick={() => map.setView([20.5937, 78.9629], 5)}
    className="w-10 h-10 mt-2 bg-surface-slate border border-surface-border rounded-xl flex items-center justify-center text-text-primary hover:border-brand-mint hover:text-brand-mint transition-colors"
  >
        <Focus className="w-5 h-5" />
      </button>
    </div>;
};
