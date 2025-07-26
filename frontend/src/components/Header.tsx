import React, { useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}

interface HeaderProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection = 'dashboard', onSectionChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'mood', label: 'Mood Map', icon: '🎭' },
    { id: 'reports', label: 'Reports', icon: '📝' },
    { id: 'alerts', label: 'AI Alerts', icon: '🤖' },
  ];

  const handleSectionClick = (sectionId: string) => {
    onSectionChange?.(sectionId);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-[var(--border-light)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-blue)] flex items-center justify-center pulse-animation">
              <span className="text-white text-lg font-bold">P</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gradient font-['DM_Sans',sans-serif] leading-none">
                Pulse Bengaluru
              </h1>
              <span className="text-xs text-[var(--text-tertiary)] font-medium">
                AI-Powered City Intelligence
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                  activeSection === item.id
                    ? 'bg-[var(--accent-violet)] text-white shadow-lg'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* WhatsApp Bot CTA */}
            <button className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#25d366] to-[#128c7e] text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all duration-200 hover:scale-105">
              <span className="text-base">💬</span>
              <span>Chat Bot</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[var(--border-light)] slide-up-enter">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-[var(--accent-violet)] text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              
              {/* Mobile WhatsApp CTA */}
              <button className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-[#25d366] to-[#128c7e] text-white rounded-xl font-medium text-sm mt-4">
                <span className="text-lg">💬</span>
                <span>Chat with AI Bot</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Live Status Indicator */}
      <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-violet)] to-transparent opacity-50"></div>
    </header>
  );
};

export default Header; 