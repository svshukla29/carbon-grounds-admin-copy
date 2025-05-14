import { ReportDetails } from "@/components/reports/report-details";

export default function ReportDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return <ReportDetails id={params.id} />;
}
