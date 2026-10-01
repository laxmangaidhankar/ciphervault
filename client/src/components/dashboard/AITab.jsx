import { VillageSummary } from "../ai/VillageSummary";
import { AIChatPanel } from "../ai/AIChatPanel";
import { RecommendationsPanel } from "./RecommendationsPanel";
export const AITab = () => {
  return <div className="flex flex-col gap-6 w-full max-w-full pb-8">
      <VillageSummary />
      <RecommendationsPanel />
      <AIChatPanel />
    </div>;
};
