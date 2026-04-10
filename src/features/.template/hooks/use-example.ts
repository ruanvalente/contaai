"use client";

import { useState } from "react";

type UseExampleReturn = {
  data: string | null;
  isLoading: boolean;
  setData: (data: string | null) => void;
};

export function useExampleHook(): UseExampleReturn {
  const [data, setData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return { data, isLoading, setData };
}