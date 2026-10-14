import React, { useState } from 'react';
import { Menu, X, Shield, Calendar, BookOpen, Wrench, PhoneCall, Info, Home, Volume2, VolumeX } from 'lucide-react';
import { ClubLogo } from './ClubLogo';

export type ActiveTab = 'home' | 'about' | 'activities' | 'workshops' | 'archive' | 'contact' | 'admin';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  totalActivitiesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  isMuted,
  onToggleMute,
  totalActivitiesCount = 49
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'الرئيسية', icon: <Home className="w-4 h-4" /> },
    { id: 'about', label: 'من نحن', icon: <Info className="w-4 h-4" /> },
    { id: 'activities', label: 'أنشطتنا', icon: <BookOpen className="w-4 h-4" />, badge: `${totalActivitiesCount}` },
    { id: 'workshops', label: 'الورشات والتكوين', icon: <Wrench className="w-4 h-4" />, badge: '13' },
    { id: 'archive', label: 'الأرشيف السنوي', icon: <Calendar className="w-4 h-4" />, badge: '2024-2026' },
    { id: 'contact', label: 'تواصل معنا', icon: <PhoneCall className="w-4 h-4" /> },
    { id: 'admin', label: 'لوحة الإدارة', icon: <Shield className="w-4 h-4" /> },
  ];

  const handleNavClick = (id: ActiveTab) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#140d09]/95 backdrop-blur-xl border-b border-[#c5a059]/30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Official Logo & Club Identity */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <ClubLogo size="md" variant="gold" showText={false} />

            <div className="flex flex-col text-right">
              <div className="flex items-center gap-2">
                <span className="font-amiri text-lg sm:text-xl font-bold text-[#f7f2ea] tracking-wide group-hover:text-[#e5c158] transition-colors">
                  كيمياء السعادة
                </span>
                <span className="text-[10px] bg-[#2a1b12] text-[#e5c158] border border-[#c5a059]/40 px-2 py-0.5 rounded-full font-bold">
                  جامعة سطيف 1
                </span>
              </div>
              <span className="font-cinzel text-[10px] sm:text-xs text-[#c5a059] tracking-wider font-semibold">
                THE CHEMISTRY OF HAPPINESS
              </span>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                    isActive
                      ? 'bg-[#2a1b12] text-[#e5c158] border border-[#c5a059]/60 shadow-md shadow-[#c5a059]/10'
                      : 'text-[#d8c8b4] hover:text-[#f7f2ea] hover:bg-[#231710]/80'
                  }`}
                >
                  {item.icon}
                  <span className="font-arabic-body">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-[#c5a059] text-[#140d09]'
                          : 'bg-[#231710] text-[#c5a059] border border-[#c5a059]/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controls: Audio Mute + Mobile Hamburger */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onToggleMute}
              className={`p-2.5 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                  : 'bg-[#231710] text-[#e5c158] hover:bg-[#2c1d14] border-[#c5a059]/40'
              }`}
              title={isMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 bg-[#231710] hover:bg-[#2c1d14] text-[#e5c158] rounded-xl border border-[#c5a059]/30 transition-all"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#c5a059]/20 bg-[#160e0a]/98 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-1.5 animate-fadeIn">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#2a1b12] text-[#e5c158] border border-[#c5a059]/50'
                    : 'text-[#d8c8b4] hover:bg-[#231710] hover:text-[#f7f2ea]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="font-arabic-body">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-xs bg-[#231710] text-[#e5c158] border border-[#c5a059]/40 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
