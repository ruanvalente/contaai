import { cn } from "@/utils/cn";
import { LibraryTab } from "@/features/library/hooks/use-library-tabs";

type LibraryTabBarProps = {
  activeTab: LibraryTab;
  onTabChange: (tab: LibraryTab) => void;
};

const tabs: { id: LibraryTab; label: string }[] = [
  { id: "my-stories", label: "Minhas Histórias" },
  { id: "reading", label: "Em Leitura" },
  { id: "completed", label: "Concluídas" },
];

export function LibraryTabBar({ activeTab, onTabChange }: LibraryTabBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors",
            activeTab === tab.id
              ? "bg-accent-500 text-white"
              : "bg-white text-gray-700 border border-primary-300 hover:bg-primary-200"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
