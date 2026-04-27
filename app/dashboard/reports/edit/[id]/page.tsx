import { ReportForm } from "@/components/reports/report-form";

export default async function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReportForm id={id} />;
}
