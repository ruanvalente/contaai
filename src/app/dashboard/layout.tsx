import { Suspense } from "react";
import { DashboardShellClient } from "./dashboard-shell-client";
import { PageSkeleton } from "@/shared/ui/skeleton.ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-primary-100"><PageSkeleton /></div>}>
      <DashboardShellClient>{children}</DashboardShellClient>
    </Suspense>
  );
}
