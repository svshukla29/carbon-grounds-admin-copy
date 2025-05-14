import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FarmerDetails } from "@/components/farmers/farmer-details"

export default function FarmerDetailsPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <FarmerDetails id={params.id} />
    </DashboardLayout>
  )
}
