import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import { Skeleton } from "../ui/Skeleton";
export const ChangeDetection = ({ changes, isLoading }) => {
  if (isLoading) {
    return <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-surface-slate border border-surface-border rounded-xl">
            <Skeleton borderRadius="12px" />
          </div>)}
      </div>;
  }
  if (!changes || changes.length === 0) {
    return <div className="bg-surface-slate border border-surface-border rounded-xl p-4 flex items-center justify-center">
        <span className="text-body text-text-muted">Insufficient historical data</span>
      </div>;
  }
  return <div className="flex flex-col gap-3">
      {changes.map((change, idx) => {
    let colorClass = "border-l-surface-border";
    let Icon = ArrowRight;
    if (change.direction === "improving") {
      colorClass = "border-l-semantic-success";
      Icon = ArrowUpRight;
    } else if (change.direction === "declining") {
      colorClass = "border-l-semantic-danger";
      Icon = ArrowDownRight;
    }
    return <div key={idx} className={`bg-surface-slate border border-surface-border border-l-4 ${colorClass} rounded-xl p-3 flex flex-col justify-center`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-mono text-text-primary text-xs">{change.type}</span>
              <Icon className={`w-4 h-4 ${change.direction === "improving" ? "text-semantic-success" : change.direction === "declining" ? "text-semantic-danger" : "text-text-muted"}`} />
            </div>
            <p className="text-body text-text-secondary text-sm m-0">
              {change.description}
            </p>
          </div>;
  })}
    </div>;
};
