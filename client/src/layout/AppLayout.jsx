import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MapContainer } from '../components/dashboard/map/MapContainer';
import { DashboardPanel } from '../components/dashboard/DashboardPanel';
import { VillageIntelligenceWorkspace } from '../components/workspace/VillageIntelligenceWorkspace';
import { VillageProvider } from '../hooks/useVillageSelection';
import { MapLayersProvider } from '../hooks/MapLayersContext';

export const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div>
      <VillageProvider>
        <MapLayersProvider>
          <div className="flex flex-col h-screen overflow-hidden bg-canvas-black text-text-primary">
            <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
            <div className="flex flex-1 overflow-hidden relative flex-col md:flex-row">
              <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
              <MapContainer />
              <DashboardPanel />
              <VillageIntelligenceWorkspace />
            </div>
          </div>
        </MapLayersProvider>
      </VillageProvider>
    </div>
  );
};
