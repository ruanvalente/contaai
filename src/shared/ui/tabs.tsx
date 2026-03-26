"use client";

import { useId, useState, KeyboardEvent, ReactNode } from "react";
import { motion } from "framer-motion";

type Tab = {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
  content?: ReactNode;
};

type TabsProps = {
  tabs: Tab[] | string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
  variant?: "default" | "pills" | "underline";
  renderContent?: (tabId: string) => ReactNode;
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  variant = "pills",
  renderContent,
}: TabsProps) {
  const baseId = useId();
  const tabsListRef = useId();

  const normalizedTabs: Tab[] = tabs.map((tab) =>
    typeof tab === "string" ? { id: tab.toLowerCase().replace(/\s+/g, "-"), label: tab } : tab
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabledTabs = normalizedTabs.filter((t) => !t.disabled);
    const currentEnabledIndex = enabledTabs.findIndex((t) => t.id === normalizedTabs[index].id);
    let newEnabledIndex = currentEnabledIndex;

    switch (e.key) {
      case "ArrowRight":
        newEnabledIndex = (currentEnabledIndex + 1) % enabledTabs.length;
        break;
      case "ArrowLeft":
        newEnabledIndex = (currentEnabledIndex - 1 + enabledTabs.length) % enabledTabs.length;
        break;
      case "Home":
        newEnabledIndex = 0;
        break;
      case "End":
        newEnabledIndex = enabledTabs.length - 1;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onTabChange(normalizedTabs[index].id);
        return;
      default:
        return;
    }

    e.preventDefault();
    const targetTab = enabledTabs[newEnabledIndex];
    onTabChange(targetTab.id);

    const buttons = document.querySelectorAll(`[data-tabs-list="${tabsListRef}"] button`);
    const targetButton = Array.from(buttons).find(
      (btn) => btn.getAttribute("data-tab-id") === targetTab.id
    ) as HTMLButtonElement | undefined;
    targetButton?.focus();
  };

  const getVariantClasses = (isActive: boolean) => {
    const baseFocus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2";

    switch (variant) {
      case "underline":
        return `px-4 py-2 font-medium whitespace-nowrap transition-colors border-b-2 ${
          isActive
            ? "border-accent-500 text-accent-600"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        } ${baseFocus}`;
      case "pills":
      default:
        return `px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
          isActive
            ? "bg-accent-500 text-white"
            : "bg-surface text-gray-700 hover:bg-gray-100 border border-border"
        } ${baseFocus}`;
    }
  };

  return (
    <div className={className}>
      <div
        className={`flex gap-2 ${
          variant === "underline" ? "border-b border-primary-200" : "overflow-x-auto pb-2 scrollbar-hide"
        }`}
        style={variant !== "underline" ? { scrollbarWidth: "none", msOverflowStyle: "none" } : undefined}
        role="tablist"
        aria-label="Categorias"
        id={`tabs-list-${baseId}`}
        data-tabs-list={tabsListRef}
      >
        {normalizedTabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const panelId = `tabpanel-${tab.id}`;
          const tabId = `tab-${tab.id}`;

          return (
            <button
              key={tab.id}
              type="button"
              id={tabId}
              data-tab-id={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              onKeyDown={(e) => !tab.disabled && handleKeyDown(e, index)}
              disabled={tab.disabled}
              className={`${getVariantClasses(isActive)} ${
                tab.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              aria-disabled={tab.disabled}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                    aria-label={`${tab.count} itens`}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {renderContent && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="mt-4"
          tabIndex={0}
        >
          {renderContent(activeTab)}
        </motion.div>
      )}
    </div>
  );
}

export function useTabState(initialTab?: string) {
  const [activeTab, setActiveTab] = useState<string>("");

  const initializeTab = (tabs: string[]) => {
    if (!activeTab && tabs.length > 0) {
      setActiveTab(initialTab || tabs[0]);
    }
  };

  return { activeTab, setActiveTab, initializeTab };
}
