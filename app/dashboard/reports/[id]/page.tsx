import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ReportDetails } from "@/components/reports/report-details";

export default function ReportDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <DashboardLayout>
      <ReportDetails id={params.id} />
    </DashboardLayout>
  );
}
