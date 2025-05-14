import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PartnerForm } from "@/components/partners/partner-form"

export default function EditPartnerPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <PartnerForm id={params.id} />
    </DashboardLayout>
  )
}
