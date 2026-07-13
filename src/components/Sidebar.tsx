import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { navEngine, NavigationItem, NavigationGroup, LiveBadgeKey } from '../lib/navigationEngine';

interface SidebarProps {
  currentTab: string;
  currentSubTab: string;
  onTabChange: (tab: string, subTab?: string) => void;
}

export default function Sidebar({ currentTab, currentSubTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    inventory: false,
    sales: true, // Default open sales to show high visual fidelity
  });

  const [activeLanguage, setActiveLanguage] = useState(navEngine.getLanguage());
  const [groups, setGroups] = useState<NavigationGroup[]>([]);
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [pinned, setPinned] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);

  // Live state tracking counts for badges
  const [lowStockCount, setLowStockCount] = useState(3);
  const [invoicesCount, setInvoicesCount] = useState(5);

  // Sync state from engine and local storage
  const syncWithEngine = () => {
    setGroups(navEngine.getGroups());
    setItems(navEngine.getItems());
    setFavorites(navEngine.getFavorites());
    setPinned(navEngine.getPinned());
    setRecents(navEngine.getRecents());
    setActiveLanguage(navEngine.getLanguage());

    // Fetch live statistics safely from local storage
    const storedProductsCount = localStorage.getItem('nexova_products_count');
    const storedInvoicesCount = localStorage.getItem('nexova_invoices_count');
    if (storedProductsCount) {
      // Calculate fake low-stock based on products
      setLowStockCount(Math.max(2, Math.floor(Number(storedProductsCount) / 8)));
    }
    if (storedInvoicesCount) {
      setInvoicesCount(Number(storedInvoicesCount));
    }
  };

  useEffect(() => {
    syncWithEngine();
    
    // Periodically update to catch dynamic background modifications
    const interval = setInterval(syncWithEngine, 2000);
    return () => clearInterval(interval);
  }, []);

  // Listen to language changes
  const handleLanguageToggle = () => {
    const nextLang = activeLanguage === 'en' ? 'bn' : 'en';
    navEngine.setLanguage(nextLang);
    setActiveLanguage(nextLang);
  };

  // Render text based on language translations
  const t = (item: NavigationItem): string => {
    if (activeLanguage === 'bn' && item.translations && item.translations.bn) {
      return item.translations.bn;
    }
    return item.label;
  };

  const getTranslatedGroupLabel = (group: NavigationGroup): string => {
    if (activeLanguage === 'bn') {
      const bnMap: Record<string, string> = {
        'Dashboard': 'ড্যাশবোর্ড',
        'Inventory': 'ইনভেন্টরি',
        'Warehouse': 'গুদামজাতকরণ',
        'Purchase': 'ক্রয় মডিউল',
        'Sales': 'বিক্রয় মডিউল',
        'Accounting': 'হিসাববিজ্ঞান',
        'CRM': 'সিআরএম',
        'HR': 'মানব সম্পদ',
        'Projects': 'প্রকল্পসমূহ',
        'Manufacturing': 'উৎপাদন',
        'Service': 'সেবাসমূহ',
        'Documents': 'নথিপত্র',
        'Workflow': 'ওয়ার্কফ্লো',
        'Reports': 'প্রতিবেদন',
        'AI': 'এআই সহকারী',
        'Integration': 'ইন্টিগ্রেশন',
        'Administration': 'প্রশাসন',
        'System': 'সিস্টেম',
      };
      return bnMap[group.label] || group.label;
    }
    return group.label;
  };

  // Safe dynamic icon rendering helper
  const renderIcon = (iconName: string | undefined, className: string = "h-4 w-4") => {
    if (!iconName) return <Icons.Activity className={className} />;
    const IconComponent = (Icons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return <Icons.Boxes className={className} />;
  };

  // Toggle category group expand
  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups((prev) => {
      const isCurrentlyExpanded = !!prev[groupId];
      const newState = { ...prev };
      // Close others to keep sidebar tidy, except when searching
      Object.keys(newState).forEach((key) => {
        newState[key] = false;
      });
      newState[groupId] = !isCurrentlyExpanded;
      return newState;
    });
  };

  // Handle menu click and update history logs
  const handleItemClick = (item: NavigationItem) => {
    navEngine.addRecent(item.id);
    setRecents(navEngine.getRecents());
    onTabChange(item.tab, item.subTab);
  };

  // PIN / FAVORITE actions
  const handlePinToggle = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    navEngine.togglePinned(itemId);
    setPinned(navEngine.getPinned());
  };

  const handleFavoriteToggle = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    navEngine.toggleFavorite(itemId);
    setFavorites(navEngine.getFavorites());
  };

  // Fetch badges dynamically
  const getBadgeValue = (key: string | undefined) => {
    if (!key) return null;
    return navEngine.getLiveBadgeValue(key as LiveBadgeKey, {
      lowStockCount,
      invoicesCount,
    });
  };

  // Filter items based on search query
  const searchResults = searchQuery ? navEngine.fuzzySearch(searchQuery) : [];

  return (
    <aside
      className={`bg-[#09221d] text-emerald-100 flex flex-col h-screen select-none border-r border-emerald-900/40 shrink-0 transition-all duration-300 relative ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand logo header */}
      <div className="p-4 flex items-center justify-between border-b border-emerald-950/50">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <span className="font-display font-bold text-white text-lg tracking-wider">A</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-white text-md tracking-wide">APEXION</span>
              <span className="text-[9px] text-emerald-500/80 font-bold tracking-widest uppercase">ERP Software</span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
            <span className="font-display font-bold text-white text-md tracking-wider">A</span>
          </div>
        )}

        {/* Collapse and Language Controls */}
        {!isCollapsed && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleLanguageToggle}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 hover:text-white transition-all"
              title="Toggle Language (EN / BN)"
            >
              {activeLanguage === 'en' ? 'BN' : 'EN'}
            </button>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded bg-emerald-950/40 text-emerald-500 hover:text-white hover:bg-emerald-900/50"
              title="Collapse Sidebar"
            >
              <Icons.ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute -right-3 top-5 z-50 h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border border-emerald-400 hover:bg-emerald-600 active:scale-95 transition-all"
          >
            <Icons.ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Sidebar search */}
      {!isCollapsed && (
        <div className="p-3">
          <div className="relative">
            <Icons.Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-emerald-600/80" />
            <input
              type="text"
              placeholder={activeLanguage === 'bn' ? 'মেনু খুঁজুন...' : 'Search menu...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-emerald-950/40 text-xs text-emerald-200 pl-8 pr-4 py-2 rounded-md border border-emerald-900/50 focus:outline-none focus:border-emerald-500 transition-colors placeholder-emerald-700/80 font-medium"
            />
          </div>
        </div>
      )}

      {/* Dynamic Navigation Content scroll */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-6 space-y-1 mt-2">
        {/* FUZZY SEARCH RESULTS AREA */}
        {!isCollapsed && searchQuery && (
          <div className="space-y-1 border-b border-emerald-900/30 pb-3 mb-3">
            <div className="px-2 text-[10px] font-bold text-emerald-500/80 tracking-wider uppercase mb-1 flex items-center gap-1.5">
              <Icons.Search className="h-3 w-3" />
              <span>Search Results ({searchResults.length})</span>
            </div>
            {searchResults.length === 0 ? (
              <div className="text-[10px] text-emerald-700 font-semibold px-2 py-1 bg-emerald-950/20 rounded">
                No items found
              </div>
            ) : (
              searchResults.map((item) => {
                const isSelected = currentTab === item.tab && currentSubTab === item.subTab;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-all ${
                      isSelected ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-400 hover:bg-emerald-950/40 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {renderIcon(item.icon, "h-3.5 w-3.5")}
                      <span className="truncate max-w-[140px]">{t(item)}</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-600 capitalize bg-emerald-950/60 px-1 rounded">
                      {item.groupId}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* QUICK ACCESS HUB: Favorites, Recent, Pinned */}
        {!isCollapsed && !searchQuery && (
          <div className="space-y-2 mb-3 bg-emerald-950/25 p-2 rounded-xl border border-emerald-900/20">
            {/* Pinned actions shortcut */}
            {pinned.length > 0 && (
              <div className="space-y-1">
                <div className="px-1 text-[9px] font-bold text-emerald-500 tracking-wider uppercase flex items-center gap-1">
                  <Icons.Pin className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" />
                  <span>Pinned Actions</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {pinned.map((pId) => {
                    const found = items.find(i => i.id === pId);
                    if (!found) return null;
                    const isSelected = currentTab === found.tab && currentSubTab === found.subTab;
                    return (
                      <button
                        key={pId}
                        onClick={() => handleItemClick(found)}
                        className={`text-left px-2 py-1 rounded text-[10px] font-bold truncate flex items-center gap-1 transition-all ${
                          isSelected ? 'bg-emerald-700 text-white' : 'text-emerald-400 hover:bg-emerald-950 hover:text-white'
                        }`}
                        title={t(found)}
                      >
                        {renderIcon(found.icon, "h-3 w-3 shrink-0")}
                        <span className="truncate">{t(found)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Favorites shortcuts */}
            {favorites.length > 0 && (
              <div className="space-y-1">
                <div className="px-1 text-[9px] font-bold text-emerald-500 tracking-wider uppercase flex items-center gap-1">
                  <Icons.Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                  <span>Favorites</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {favorites.map((fId) => {
                    const found = items.find(i => i.id === fId);
                    if (!found) return null;
                    const isSelected = currentTab === found.tab && currentSubTab === found.subTab;
                    return (
                      <button
                        key={fId}
                        onClick={() => handleItemClick(found)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 transition-all border ${
                          isSelected ? 'bg-emerald-600 border-emerald-500 text-white font-black' : 'border-emerald-900/50 text-emerald-400 hover:border-emerald-700 hover:text-white'
                        }`}
                      >
                        {renderIcon(found.icon, "h-2.5 w-2.5")}
                        <span className="truncate max-w-[70px]">{t(found)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Pages */}
            {recents.length > 0 && (
              <div className="space-y-1">
                <div className="px-1 text-[9px] font-bold text-emerald-600 tracking-wider uppercase flex items-center gap-1">
                  <Icons.Clock className="h-2.5 w-2.5" />
                  <span>Recent Views</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  {recents.slice(0, 3).map((rId) => {
                    const found = items.find(i => i.id === rId);
                    if (!found) return null;
                    return (
                      <button
                        key={rId}
                        onClick={() => handleItemClick(found)}
                        className="w-full text-left px-1.5 py-0.5 rounded text-[10px] text-emerald-500 hover:text-white hover:bg-emerald-950/50 truncate flex items-center gap-1 font-medium"
                      >
                        <span className="w-1 h-1 rounded-full bg-emerald-600"></span>
                        <span className="truncate">{t(found)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* METADATA-DRIVEN GROUPED SIDEBAR NAVIGATION */}
        {groups.map((group) => {
          const groupItems = items.filter((item) => item.groupId === group.id);
          if (groupItems.length === 0) return null;

          const isExpanded = !!expandedGroups[group.id] || searchQuery !== '';
          const hasSelectedChild = groupItems.some(
            (item) => currentTab === item.tab && currentSubTab === item.subTab
          );

          // If sidebar is collapsed, we render simplified icon buttons with dropdown tooltip
          if (isCollapsed) {
            return (
              <div key={group.id} className="relative group/mini flex justify-center py-1">
                <button
                  className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                    hasSelectedChild
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                      : 'text-emerald-400 hover:bg-emerald-950 hover:text-white'
                  }`}
                  title={getTranslatedGroupLabel(group)}
                >
                  {renderIcon(group.icon, "h-5 w-5")}
                </button>

                {/* Hover floating submenu for compact view */}
                <div className="absolute left-14 top-0 z-50 w-52 bg-[#09221d] rounded-xl border border-emerald-900 shadow-2xl p-2 hidden group-hover/mini:block animate-in fade-in slide-in-from-left-2 duration-150">
                  <div className="px-2.5 py-1 mb-1 border-b border-emerald-950 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                      {getTranslatedGroupLabel(group)}
                    </span>
                  </div>
                  <div className="space-y-0.5 max-h-72 overflow-y-auto custom-scrollbar">
                    {groupItems.map((item) => {
                      const isChildSelected = currentTab === item.tab && currentSubTab === item.subTab;
                      const badgeValue = getBadgeValue(item.badgeKey);

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                            isChildSelected
                              ? 'bg-emerald-800 text-white font-bold'
                              : 'text-emerald-400 hover:bg-emerald-950/60 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {renderIcon(item.icon, "h-3.5 w-3.5")}
                            <span>{t(item)}</span>
                          </div>
                          {badgeValue !== null && (
                            <span className="text-[8px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded-full scale-90">
                              {badgeValue}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          // Full Standard Sidebar rendering
          return (
            <div key={group.id} className="space-y-0.5 border-b border-emerald-950/35 pb-1">
              {/* Category header */}
              <button
                onClick={() => toggleGroupExpand(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all group ${
                  hasSelectedChild
                    ? 'bg-emerald-950/50 text-white border-l-2 border-emerald-400 pl-2.5'
                    : 'text-emerald-400/85 hover:bg-emerald-950/30 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {renderIcon(group.icon, "h-[15px] w-[15px] text-emerald-500/70 group-hover:text-emerald-300")}
                  <span className="tracking-wide uppercase text-[10px]">{getTranslatedGroupLabel(group)}</span>
                </div>
                <div>
                  {isExpanded ? (
                    <Icons.ChevronDown className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Icons.ChevronRight className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                </div>
              </button>

              {/* Child items */}
              {isExpanded && (
                <div className="pl-5 pr-1 py-0.5 space-y-0.5 border-l border-emerald-900/20 ml-5">
                  {groupItems.map((item) => {
                    const isItemSelected = currentTab === item.tab && currentSubTab === item.subTab;
                    const badgeValue = getBadgeValue(item.badgeKey);
                    const isFav = favorites.includes(item.id);
                    const isPin = pinned.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`group/item flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer relative ${
                          isItemSelected
                            ? 'bg-emerald-800 text-white font-bold shadow-sm'
                            : 'text-emerald-400 hover:bg-emerald-950/30 hover:text-white'
                        }`}
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="flex items-center gap-2 max-w-[130px] truncate">
                          {renderIcon(item.icon, "h-3.5 w-3.5 shrink-0")}
                          <span className="truncate">{t(item)}</span>
                        </div>

                        {/* Interactive badges, pin and star buttons (show on hover) */}
                        <div className="flex items-center gap-1.5 z-10">
                          {badgeValue !== null && (
                            <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                              {badgeValue}
                            </span>
                          )}

                          {/* Pin Toggle Button */}
                          <button
                            onClick={(e) => handlePinToggle(e, item.id)}
                            className={`opacity-0 group-hover/item:opacity-100 p-0.5 hover:bg-emerald-900/60 rounded text-[9px] transition-all ${
                              isPin ? 'opacity-100 text-yellow-500' : 'text-emerald-600'
                            }`}
                            title={isPin ? "Unpin action" : "Pin action"}
                          >
                            <Icons.Pin className={`h-3 w-3 ${isPin ? 'fill-yellow-500' : ''}`} />
                          </button>

                          {/* Star Toggle Button */}
                          <button
                            onClick={(e) => handleFavoriteToggle(e, item.id)}
                            className={`opacity-0 group-hover/item:opacity-100 p-0.5 hover:bg-emerald-900/60 rounded text-[9px] transition-all ${
                              isFav ? 'opacity-100 text-amber-400' : 'text-emerald-600'
                            }`}
                            title={isFav ? "Remove Favorite" : "Add Favorite"}
                          >
                            <Icons.Star className={`h-3 w-3 ${isFav ? 'fill-amber-400' : ''}`} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic footer matching SAP/Odoo elegance */}
      <div className="p-3.5 border-t border-emerald-950/50 bg-emerald-950/40 text-center flex flex-col items-center">
        {!isCollapsed ? (
          <>
            <span className="text-[10px] text-emerald-600/90 font-bold tracking-wider">APEXION NAV ENGINE v2.0</span>
            <span className="text-[9px] text-emerald-700 font-semibold mt-0.5">
              Role: <span className="text-emerald-500">Administrator</span>
            </span>
          </>
        ) : (
          <span title="APEXION NAV ENGINE v2.0"><Icons.Cpu className="h-4 w-4 text-emerald-700" /></span>
        )}
      </div>
    </aside>
  );
}
