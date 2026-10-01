import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
export const RecommendationCard = ({ recommendation }) => {
  const { t } = useTranslation();
  const urgencyColors = {
    critical: "bg-semantic-danger text-white",
    high: "bg-semantic-danger opacity-80 text-white",
    medium: "bg-semantic-warning text-canvas-black",
    low: "bg-brand-mint text-canvas-black"
  };
  const priorityColors = {
    1: "text-semantic-danger",
    2: "text-semantic-warning",
    3: "text-brand-blue"
  };
  const borderColors = {
    1: "border-l-semantic-danger",
    2: "border-l-semantic-warning",
    3: "border-l-brand-blue"
  };
  return <div className={`bg-surface-slate border border-surface-border border-l-4 ${borderColors[recommendation.priority]} rounded-xl p-5 flex flex-col gap-3 relative`}>
      <div className="absolute top-4 right-4 text-mono opacity-50">
        <span className={`text-xl ${priorityColors[recommendation.priority]}`}>
          0{recommendation.priority}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-mono text-text-secondary text-xs uppercase">{recommendation.category}</span>
        {recommendation.scheme && <span className="px-2 py-0.5 rounded-full bg-brand-violet/20 text-brand-violet text-[10px] font-mono border border-brand-violet/30">
            {recommendation.scheme}
          </span>}
      </div>

      <h4 className="text-heading-md text-text-primary text-base leading-tight pr-8">
        {recommendation.title}
      </h4>

      <p className="text-body text-text-secondary text-sm">
        {recommendation.description}
      </p>

      <div className="bg-surface-elevated rounded-lg p-3 text-sm border border-surface-border mt-1">
        <span className="text-text-muted">{t("dashboard.expected", "Expected")}: </span>
        <span className="text-text-primary">{recommendation.expectedImpact}</span>
      </div>

      <div className="flex items-center justify-between mt-2 pt-3 border-t border-surface-border">
        <div className="flex items-center gap-1.5 text-text-secondary">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-mono text-[10px]">{recommendation.timeframe}</span>
        </div>
        <div className={`px-2 py-1 rounded-tag text-mono text-[10px] uppercase ${urgencyColors[recommendation.urgency]}`}>
          {recommendation.urgency}
        </div>
      </div>
    </div>;
};
