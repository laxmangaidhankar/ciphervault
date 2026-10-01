import { Popup } from "react-leaflet";
import { useTranslation } from "react-i18next";
export const VillagePopup = ({ village }) => {
  const { t } = useTranslation();
  return <Popup
    className="custom-leaflet-popup"
    closeButton={false}
    offset={[0, -10]}
  >
      <div className="bg-surface-slate border border-brand-mint rounded-card p-4 min-w-[200px] text-left">
        <h3 className="text-heading-md text-text-primary m-0">{village.name}</h3>
        <p className="text-mono text-text-secondary mt-1 mb-3">{village.district}</p>
        <div className="flex justify-between items-center text-sm">
          <span className="text-text-muted">{t("map.area", "Area")}:</span>
          <span className="text-brand-mint font-mono">{village.area} km²</span>
        </div>
        <button className="w-full mt-4 bg-brand-console text-text-primary rounded-button py-2 font-mono text-xs hover:bg-brand-mint hover:text-canvas-black transition-colors">
          {t("map.view_analysis", "VIEW ANALYSIS")}
        </button>
      </div>
    </Popup>;
};
