import { useState } from "react";
import { Download, FileJson, FileText, Loader2 } from "lucide-react";
import { useVillageSelection } from "@/hooks/useVillageSelection";
import { downloadPDF, downloadJSON, downloadCSV } from "@/services/report.service";
import { useTranslation } from "react-i18next";
export const ReportTab = () => {
  const { selectedVillage, selectedYear } = useVillageSelection();
  const [includeAI, setIncludeAI] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingJSON, setGeneratingJSON] = useState(false);
  const [generatingCSV, setGeneratingCSV] = useState(false);
  const [error, setError] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);
  const { t } = useTranslation();
  const handleDownloadPDF = async () => {
    if (!selectedVillage) return;
    setGeneratingPDF(true);
    setError(null);
    try {
      await downloadPDF(selectedVillage.id, selectedYear, includeAI);
      setLastGenerated(/* @__PURE__ */ new Date());
    } catch (err) {
      setError(err?.message || t("dashboard.pdf_error", "Failed to generate PDF report."));
    } finally {
      setGeneratingPDF(false);
    }
  };
  const handleDownloadJSON = async () => {
    if (!selectedVillage) return;
    setGeneratingJSON(true);
    setError(null);
    try {
      await downloadJSON(selectedVillage.id, selectedYear);
    } catch (err) {
      setError(err?.message || t("dashboard.json_error", "Failed to generate JSON export."));
    } finally {
      setGeneratingJSON(false);
    }
  };
  const handleDownloadCSV = async () => {
    if (!selectedVillage) return;
    setGeneratingCSV(true);
    setError(null);
    try {
      await downloadCSV(selectedVillage.id);
    } catch (err) {
      setError(err?.message || t("dashboard.csv_error", "Failed to generate CSV export."));
    } finally {
      setGeneratingCSV(false);
    }
  };
  return <div className="flex flex-col gap-6 w-full max-w-full pb-8">
      <div className="flex flex-col gap-3">
        <h3 className="text-mono text-text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-semantic-warning" />
          {t("dashboard.village_report", "VILLAGE REPORT")}
        </h3>
        
        {error && <div className="bg-semantic-danger/20 border border-semantic-danger text-semantic-danger text-sm rounded-xl p-3">
            {error}
          </div>}
        
        <div className="bg-surface-slate border border-surface-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-4 border-b border-surface-border">
            <span className="text-body text-text-primary">{t("dashboard.include_ai", "Include AI Analysis")}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
    type="checkbox"
    className="sr-only peer"
    checked={includeAI}
    onChange={(e) => setIncludeAI(e.target.checked)}
  />
              <div className="w-11 h-6 bg-surface-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-mint" />
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-mono text-text-secondary text-xs">{t("dashboard.includes", "INCLUDES:")}</h4>
            <ul className="text-body text-text-secondary text-sm flex flex-col gap-2 list-disc pl-4">
              <li>{t("dashboard.exec_summary", "Executive Summary")} {includeAI ? t("dashboard.ai_narrative", "(AI Narrative)") : t("dashboard.auto_generated", "(Auto)")}</li>
              <li>{t("dashboard.health_score", "Village Health Score & Breakdowns")}</li>
              <li>{t("dashboard.env_metrics", "Environmental Metrics")}</li>
              <li>{t("dashboard.historical_trends", "Historical Trends (2022-2026)")}</li>
              <li>{includeAI ? t("dashboard.ai_recs", "AI Recommendations") : t("dashboard.methodology", "Methodology")}</li>
            </ul>
          </div>
        </div>

        <button
    onClick={handleDownloadPDF}
    disabled={generatingPDF || !selectedVillage}
    className="w-full flex items-center justify-center gap-2 bg-brand-mint text-canvas-black rounded-button py-3 font-mono text-xs hover:opacity-90 disabled:hover:opacity-50 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
  >
          {generatingPDF ? <><Loader2 className="w-4 h-4 animate-spin" /> {t("dashboard.generating", "GENERATING...")}</> : <><Download className="w-4 h-4" /> {t("dashboard.download_pdf", "DOWNLOAD PDF REPORT")}</>}
        </button>
        
        <div className="grid grid-cols-2 gap-3 mt-1">
          <button
    onClick={handleDownloadJSON}
    disabled={generatingJSON || !selectedVillage}
    className="flex items-center justify-center gap-2 bg-surface-border text-text-primary rounded-button py-3 font-mono text-xs hover:bg-surface-elevated transition-colors disabled:opacity-50"
  >
            {generatingJSON ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileJson className="w-4 h-4" />} {t("dashboard.export_json", "EXPORT JSON")}
          </button>
          <button
    onClick={handleDownloadCSV}
    disabled={generatingCSV || !selectedVillage}
    className="flex items-center justify-center gap-2 bg-surface-border text-text-primary rounded-button py-3 font-mono text-xs hover:bg-surface-elevated transition-colors disabled:opacity-50"
  >
            {generatingCSV ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} {t("dashboard.export_csv", "EXPORT CSV")}
          </button>
        </div>
        
        <div className="text-center mt-2">
          <span className="text-mono text-text-muted text-[10px]">
            {t("dashboard.last_generated", "LAST GENERATED:")} {lastGenerated ? lastGenerated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : t("dashboard.never", "NEVER")}
          </span>
        </div>
      </div>
    </div>;
};
