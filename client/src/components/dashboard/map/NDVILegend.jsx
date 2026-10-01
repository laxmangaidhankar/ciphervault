export const NDVILegend = () => {
  const legendItems = [
    { label: "EXCELLENT (>0.6)", color: "bg-score-excellent" },
    { label: "GOOD (0.4-0.6)", color: "bg-score-good" },
    { label: "FAIR (0.2-0.4)", color: "bg-semantic-warning" },
    { label: "POOR (<0.2)", color: "bg-semantic-danger" }
  ];
  return <div className="absolute bottom-6 left-4 z-[400]">
      <div className="bg-surface-slate border border-surface-border rounded-lg p-3 shadow-lg">
        <h4 className="text-mono text-text-primary mb-2 text-xs">NDVI HEALTH</h4>
        <div className="flex flex-col gap-2">
          {legendItems.map((item) => <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-mono text-[10px] text-text-secondary">{item.label}</span>
            </div>)}
        </div>
      </div>
    </div>;
};
