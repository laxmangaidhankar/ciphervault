import { useVillageSelection } from "@/hooks/useVillageSelection";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";
export const VillageWorkspaceIndicator = () => {
  const { selectedVillage } = useVillageSelection();
  return <AnimatePresence>
      {selectedVillage && <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] pointer-events-none"
  >
          <div className="bg-canvas-black border border-green-500/30 px-4 py-2 rounded-full shadow-lg backdrop-blur-md bg-opacity-90 flex items-center space-x-3">
            <span className="text-sm font-medium text-text-primary">
              Workspace: <span className="text-green-400 font-semibold">{selectedVillage.name}</span>
            </span>
            <div className="h-4 w-px bg-surface-border" />
            <div className="flex items-center text-xs text-text-secondary">
              <Lock className="w-3 h-3 mr-1" />
              Locked
            </div>
          </div>
        </motion.div>}
    </AnimatePresence>;
};
