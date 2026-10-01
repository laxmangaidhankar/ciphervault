import { MapPin } from "lucide-react";
export const EmptyState = () => {
  return <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-slate flex items-center justify-center mb-4 border border-surface-border">
        <MapPin className="w-8 h-8 text-brand-mint" />
      </div>
      <h2 className="text-heading-lg text-text-primary mb-2">Select a village</h2>
      <p className="text-body text-text-secondary max-w-[280px]">
        Choose a village from the sidebar or map to view environmental analysis and AI insights.
      </p>
    </div>;
};
