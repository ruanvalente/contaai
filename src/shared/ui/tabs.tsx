"use client";

type TabsProps = {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className = "" }: TabsProps) {
  return (
    <div
      className={`flex gap-2 overflow-x-auto pb-2 scrollbar-hide ${className}`}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
            activeTab === tab
              ? "bg-accent-500 text-white"
              : "bg-surface text-gray-700 hover:bg-gray-100 border border-border"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
