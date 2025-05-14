import { DashboardLayout } from "@/components/dashboard-layout";
import React from "react";

const DashboardLayoutPage = ({ children }: { children: React.ReactNode }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default DashboardLayoutPage;
