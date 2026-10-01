import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
export const TrendBadge = ({ trend, className = "" }) => {
  const { t } = useTranslation();
  let colorClass = "bg-surface-border text-text-muted";
  let Icon = ArrowRight;
  if (trend === "improving") {
    colorClass = "bg-semantic-success/20 text-semantic-success";
    Icon = ArrowUpRight;
  } else if (trend === "declining") {
    colorClass = "bg-semantic-danger/20 text-semantic-danger";
    Icon = ArrowDownRight;
  }
  const translatedTrend = t(`dashboard.trend.${trend}`, trend);
  return <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-tag text-mono text-xs uppercase ${colorClass} ${className}`}>
      {translatedTrend} <Icon className="w-3 h-3" />
    </div>;
};
