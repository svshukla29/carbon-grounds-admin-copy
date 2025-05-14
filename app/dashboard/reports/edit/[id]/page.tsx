import { ReportForm } from "@/components/reports/report-form";

export default function EditReportPage({ params }: { params: { id: string } }) {
  return <ReportForm id={params.id} />;
}
