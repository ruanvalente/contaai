"use server";

export async function createExample(data: { name: string }) {
  return { id: "new-id", ...data };
}