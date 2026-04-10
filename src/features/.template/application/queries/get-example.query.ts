"use server";

import { cache } from "react";

export const getExampleData = cache(async (id?: string) => {
  return { id: id || "default", name: "Example" };
});