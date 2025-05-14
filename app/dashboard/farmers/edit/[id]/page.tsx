import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FarmerForm } from "@/components/farmers/farmer-form";

export default function EditFarmerPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <FarmerForm id={params.id} />
    </DashboardLayout>
  );
}
