"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type LibraryTab = "my-stories" | "reading" | "completed";

type UseLibraryTabsReturn = {
  activeTab: LibraryTab;
  setTab: (tab: LibraryTab) => void;
};

export function useLibraryTabs(): UseLibraryTabsReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<LibraryTab>(
    (searchParams.get("tab") as LibraryTab) || "my-stories"
  );

  const setTab = useCallback(
    (tab: LibraryTab) => {
      setActiveTab(tab);
      router.push(`?tab=${tab}`, { scroll: false });
    },
    [router]
  );

  return { activeTab, setTab };
}
