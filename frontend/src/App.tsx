import React, { useState } from 'react';
import Header from './components/Header';
import DashboardLayout from './components/DashboardLayout';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <Header 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      <DashboardLayout activeSection={activeSection} />
      
      {/* Loading Animation */}
      <div id="loading-overlay" className="fixed inset-0 bg-[var(--bg-primary)] flex items-center justify-center z-50 pointer-events-none opacity-0 transition-opacity duration-500">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[var(--border-light)] rounded-full animate-spin border-t-[var(--accent-violet)]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl pulse-animation">🌃</span>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              Syncing City Pulse
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Processing real-time urban data...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 