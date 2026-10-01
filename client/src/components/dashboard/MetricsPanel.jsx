import React from "react";
import { ArrowUpRight, ArrowDownRight, ArrowRight, Droplets, Leaf, Thermometer, Wind } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";
const MetricCard = ({
  title,
  value,
  unit,
  trend = "neutral",
  accentColor,
  icon,
  isLoading,
  hasError
}) => {
  if (isLoading) {
    return <div className="bg-surface-slate border border-surface-border rounded-xl p-4 h-[88px]">
        <Skeleton borderRadius="4px" />
      </div>;
  }
  if (hasError) {
    return <div className={`bg-surface-slate border border-surface-border ${accentColor} border-l-4 rounded-xl p-4 h-[88px] flex items-center justify-center`}>
        <span className="text-body text-text-muted text-xs">Unavailable</span>
      </div>;
  }
  return <div className={`bg-surface-slate border border-surface-border ${accentColor} border-l-[3px] rounded-xl p-3 flex flex-col justify-between h-[88px] group hover:border-opacity-100 transition-all`}>
      <div className="flex justify-between items-center">
        <span className="text-mono text-text-secondary text-[9px] tracking-widest">{title}</span>
        <span className="text-text-muted opacity-50 group-hover:opacity-80 transition-opacity">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-text-primary font-bold" style={{ fontSize: "22px", lineHeight: 1 }}>{value}</span>
        <span className="text-mono text-text-secondary text-[10px]">{unit}</span>
        <span className="ml-auto">
          {trend === "up" && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />}
          {trend === "down" && <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />}
          {trend === "neutral" && <ArrowRight className="w-3.5 h-3.5 text-text-muted" />}
        </span>
      </div>
    </div>;
};
const DataSourceBadge = ({ source }) => {
  if (!source || source === "mock") return null;
  const config = source === "live" ? { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", label: "LIVE GEE SATELLITE DATA" } : source === "cached" ? { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", label: "CACHED GEE SATELLITE DATA" } : { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", label: "INCOMPLETE DATA" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold tracking-wider select-none ${config.bg} ${config.border} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.text.replace("text-", "bg-")}`} />
      {config.label}
    </span>;
};
export const MetricsPanel = React.memo(({ data, isLoading, error }) => {
  const hasError = !!error;
  const ndviTrend = !data ? "neutral" : data.ndvi >= 0.5 ? "up" : data.ndvi < 0.2 ? "down" : "neutral";
  const ndwiTrend = !data ? "neutral" : data.ndwi >= 0 ? "up" : "down";
  const waterTrend = !data ? "neutral" : data.waterAreaHa > 0 ? "up" : "neutral";
  const greenTrend = !data ? "neutral" : data.greenCoverPercent >= 40 ? "up" : data.greenCoverPercent < 20 ? "down" : "neutral";
  const tempTrend = !data ? "neutral" : data.temperature > 35 ? "down" : data.temperature < 20 ? "neutral" : "up";
  const rainTrend = !data ? "neutral" : data.rainfall > 1e3 ? "up" : data.rainfall < 400 ? "down" : "neutral";
  return <div className="flex flex-col gap-5">
      {
    /* Vegetation & Water section */
  }
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-mono text-text-primary flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ENVIRONMENTAL METRICS
          </h3>
          <DataSourceBadge source={data?.dataSource} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
    title="NDVI HEALTH"
    value={data?.ndvi?.toFixed(2) ?? "\u2014"}
    unit=""
    accentColor="border-l-emerald-500"
    icon={<Leaf className="w-3.5 h-3.5" />}
    trend={ndviTrend}
    isLoading={isLoading}
    hasError={hasError}
  />
          <MetricCard
    title="NDWI MOISTURE"
    value={data?.ndwi?.toFixed(2) ?? "\u2014"}
    unit=""
    accentColor="border-l-blue-500"
    icon={<Droplets className="w-3.5 h-3.5" />}
    trend={ndwiTrend}
    isLoading={isLoading}
    hasError={hasError}
  />
          <MetricCard
    title="SURFACE WATER"
    value={data?.waterAreaHa?.toFixed(1) ?? "\u2014"}
    unit="HA"
    accentColor="border-l-blue-400"
    icon={<Droplets className="w-3.5 h-3.5" />}
    trend={waterTrend}
    isLoading={isLoading}
    hasError={hasError}
  />
          <MetricCard
    title="GREEN COVER"
    value={data?.greenCoverPercent?.toFixed(1) ?? "\u2014"}
    unit="%"
    accentColor="border-l-lime-500"
    icon={<Leaf className="w-3.5 h-3.5" />}
    trend={greenTrend}
    isLoading={isLoading}
    hasError={hasError}
  />
        </div>
      </div>

      {
    /* Climate section */
  }
      <div>
        <h3 className="text-mono text-text-primary mb-3 flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          CLIMATE &amp; WEATHER
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
    title="TEMPERATURE"
    value={data?.temperature?.toFixed(1) ?? "\u2014"}
    unit="°C"
    accentColor="border-l-amber-500"
    icon={<Thermometer className="w-3.5 h-3.5" />}
    trend={tempTrend}
    isLoading={isLoading}
    hasError={hasError}
  />
          <MetricCard
    title="RAINFALL"
    value={data?.rainfall?.toFixed(1) ?? "\u2014"}
    unit="MM"
    accentColor="border-l-sky-500"
    icon={<Droplets className="w-3.5 h-3.5" />}
    trend={rainTrend}
    isLoading={isLoading}
    hasError={hasError}
  />
          <MetricCard
    title="HUMIDITY"
    value={data?.humidity?.toFixed(0) ?? "\u2014"}
    unit="%"
    accentColor="border-l-cyan-500"
    icon={<Droplets className="w-3.5 h-3.5" />}
    trend="neutral"
    isLoading={isLoading}
    hasError={hasError}
  />
          <MetricCard
    title="WIND SPEED"
    value={data?.windSpeed?.toFixed(1) ?? "\u2014"}
    unit="KM/H"
    accentColor="border-l-slate-400"
    icon={<Wind className="w-3.5 h-3.5" />}
    trend="neutral"
    isLoading={isLoading}
    hasError={hasError}
  />
        </div>
      </div>
    </div>;
});
MetricsPanel.displayName = "MetricsPanel";
