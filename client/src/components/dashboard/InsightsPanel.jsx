import { useEffect, useState } from "react";
import { useVillageSelection } from "@/hooks/useVillageSelection";
import { apiService } from "@/services/api";
import { AlertTriangle, Activity, CheckCircle, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
export const InsightsPanel = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!selectedVillage) return;
    const fetchInsights = async () => {
      setLoading(true);
      try {
        await apiService.post(`/api/v1/ai/${selectedVillage.id}/recommendations?year=${selectedYear}`, { language: "en" });
        setInsights({
          healthScore: 84,
          criticalAlerts: 1,
          topRec: "Monitor NDWI levels closely; surface water is declining."
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [selectedVillage, selectedYear]);
  if (!selectedVillage) return null;
  return <div className="w-full bg-canvas-black border-b border-surface-border p-4 flex gap-4 overflow-x-auto no-scrollbar items-center">
            <div className="flex items-center gap-2 pr-4 border-r border-surface-border shrink-0">
                <BrainCircuit className="w-5 h-5 text-brand-accent animate-pulse" />
                <div>
                    <div className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Proactive AI</div>
                    <div className="text-sm text-text-primary font-medium">Village Insights</div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {loading ? <motion.div
    key="loading"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex gap-4"
  >
                        <div className="h-10 w-32 bg-surface-elevated rounded animate-pulse" />
                        <div className="h-10 w-48 bg-surface-elevated rounded animate-pulse" />
                        <div className="h-10 w-64 bg-surface-elevated rounded animate-pulse" />
                    </motion.div> : insights ? <motion.div
    key="content"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex gap-4"
  >
                        <div className="flex items-center gap-2 bg-surface-elevated px-3 py-1.5 rounded-md border border-surface-border shrink-0">
                            <Activity className="w-4 h-4 text-brand-mint" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-text-secondary uppercase tracking-wider">Health Score</span>
                                <span className="text-sm font-mono text-brand-mint font-bold">{insights.healthScore}/100</span>
                            </div>
                        </div>

                        {insights.criticalAlerts > 0 && <div className="flex items-center gap-2 bg-red-900/20 px-3 py-1.5 rounded-md border border-red-900/50 shrink-0">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-red-400 uppercase tracking-wider">Critical Alerts</span>
                                    <span className="text-sm font-mono text-red-500 font-bold">{insights.criticalAlerts} Active</span>
                                </div>
                            </div>}

                        <div className="flex items-center gap-2 bg-surface-elevated px-3 py-1.5 rounded-md border border-surface-border shrink-0 max-w-md truncate">
                            <CheckCircle className="w-4 h-4 text-brand-accent" />
                            <div className="flex flex-col truncate">
                                <span className="text-[10px] text-text-secondary uppercase tracking-wider">Top Recommendation</span>
                                <span className="text-sm text-text-primary truncate">{insights.topRec}</span>
                            </div>
                        </div>
                    </motion.div> : null}
            </AnimatePresence>
        </div>;
};
