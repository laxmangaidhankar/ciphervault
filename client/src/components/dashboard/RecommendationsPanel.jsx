import { useVillageSelection } from "@/hooks/useVillageSelection";
import { useRecommendations } from "@/hooks/useRecommendations";
import { RecommendationCard } from "./RecommendationCard";
import { Skeleton } from "../ui/Skeleton";
import { RefreshCcw } from "lucide-react";
export const RecommendationsPanel = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const { data: recommendations, isLoading, error, regenerate } = useRecommendations(selectedVillage?.id, selectedYear);
  return <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-mono text-text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-mint" />
          AI RECOMMENDATIONS
        </h3>
        <button
    onClick={() => regenerate()}
    disabled={isLoading}
    className="text-text-muted hover:text-brand-mint disabled:opacity-50 transition-colors"
    title="Regenerate Recommendations"
  >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && <div className="bg-surface-slate border border-surface-border rounded-xl p-4 flex flex-col gap-2 items-start">
          <span className="text-mono text-semantic-danger text-xs">UNAVAILABLE</span>
          <p className="text-body text-text-muted text-sm">Failed to load recommendations.</p>
        </div>}

      {isLoading && !recommendations && <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-[200px] bg-surface-slate border border-surface-border rounded-xl">
              <Skeleton borderRadius="12px" />
            </div>)}
        </div>}

      {!isLoading && recommendations && recommendations.length > 0 && <div className="flex flex-col gap-4">
          {recommendations.map((rec, idx) => <div key={idx} className="relative">
              <RecommendationCard recommendation={rec} />
              
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 bg-canvas-black border border-surface-border rounded p-1 flex items-center gap-2 hidden md:flex opacity-0 hover:opacity-100 transition-opacity translate-x-[-100%]">
                <input type="checkbox" className="w-3 h-3 accent-brand-mint cursor-pointer" defaultChecked title="Include in Report" />
                <span className="text-mono text-[8px] text-text-secondary">REPORT</span>
              </div>
            </div>)}
        </div>}
      
      <div className="text-center mt-2">
        <span className="text-mono text-text-muted text-[10px]">
          POWERED BY GOOGLE GEMINI
        </span>
      </div>
    </div>;
};
