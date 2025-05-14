import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReportForm } from "@/components/reports/report-form"

export default function EditReportPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <ReportForm id={params.id} />
    </DashboardLayout>
  )
}
