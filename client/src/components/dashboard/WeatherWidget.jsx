import { useEffect, useState } from "react";
import { Cloud, Droplets, ThermometerSun, Wind, Calendar } from "lucide-react";
import { useVillageSelection } from "@/hooks/useVillageSelection";
import { apiService } from "@/services/api";
import { useTranslation } from "react-i18next";
export const WeatherWidget = () => {
  const { t } = useTranslation();
  const { selectedVillage } = useVillageSelection();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [show7Day, setShow7Day] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(/* @__PURE__ */ new Date());
  useEffect(() => {
    if (!selectedVillage) return;
    let mounted = true;
    const fetchWeather = async () => {
      setLoading(true);
      setWeatherError(null);
      try {
        const data = await apiService.get(`/api/v1/weather/${selectedVillage.id}/current`);
        if (mounted) {
          setWeather(data);
          setLastUpdated(/* @__PURE__ */ new Date());
        }
      } catch (err) {
        const isOffline = err?.code === "ERR_NETWORK" || !err?.response;
        const msg = isOffline ? "Backend offline \u2014 start the server" : `HTTP ${err?.response?.status}: ${err?.response?.data?.detail || err?.message}`;
        if (mounted) setWeatherError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1e3);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedVillage]);
  if (!selectedVillage) return null;
  const temp = weather?.temp_c ?? weather?.temperature_c ?? 29.2;
  const humidity = weather?.humidity_pct ?? weather?.humidity_percent ?? 64;
  const rain = weather?.rainfall_mm ?? 0;
  const wind = weather?.wind_speed_kmh ?? 12;
  return <div className="p-4 border-b border-surface-border bg-surface-slate/30">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-mono text-text-secondary text-xs flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
          LOCALIZED FARM WEATHER
        </h4>
        <div className="flex items-center gap-2">
          <button
    onClick={() => setShow7Day(!show7Day)}
    className="text-[10px] font-mono text-brand-mint border border-brand-mint/30 rounded px-1.5 py-0.5 hover:bg-brand-mint/10 transition-colors"
  >
            {show7Day ? "Current" : "7-Day Forecast"}
          </button>
          <Cloud className="w-4 h-4 text-brand-blue" />
        </div>
      </div>

      {loading && !weather ? <div className="animate-pulse flex flex-col gap-2">
          <div className="h-6 bg-surface-border rounded w-1/2" />
          <div className="h-4 bg-surface-border rounded w-1/3" />
        </div> : weather ? <div>
          {!show7Day ? <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <ThermometerSun className="w-4 h-4 text-semantic-warning" />
                    <span className="text-heading-md text-text-primary text-xl font-bold">
                      {temp.toFixed(1)}°C
                    </span>
                    <span className="text-xs text-text-muted font-mono">({weather.condition || "Clear"})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <div className="flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-brand-blue" />
                      <span>{rain.toFixed(1)} mm</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-text-muted" />
                      <span>{wind} km/h</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-text-muted">
                  {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div> : <div className="flex flex-col gap-1.5 mt-1 max-h-48 overflow-y-auto pr-1">
              {weather.forecast_7day && weather.forecast_7day.length > 0 ? weather.forecast_7day.map((day, idx) => <div key={idx} className="flex items-center justify-between text-[11px] bg-surface-slate p-1.5 rounded border border-surface-border/50">
                    <div className="flex items-center gap-1.5 font-mono text-text-secondary">
                      <Calendar className="w-3 h-3 text-brand-mint" />
                      <span>{day.date.split("-").slice(1).join("/")}</span>
                    </div>
                    <div className="font-mono text-text-primary font-bold">
                      {day.max_temp_c}° / {day.min_temp_c}°C
                    </div>
                    <div className="text-[10px] text-brand-blue font-mono">
                      {day.precipitation_mm}mm
                    </div>
                  </div>) : <div className="text-xs font-mono text-text-muted">7-day forecast loading...</div>}
            </div>}
        </div> : weatherError ? <div className="flex flex-col gap-1">
          <span className="text-[10px] text-semantic-warning font-mono">{t("dashboard.weather_unavailable", "Weather unavailable")}</span>
          <span className="text-[10px] text-text-muted break-all">{weatherError}</span>
        </div> : <span className="text-body text-text-muted">{t("dashboard.unavailable", "Unavailable")}</span>}
    </div>;
};
