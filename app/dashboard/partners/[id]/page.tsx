import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PartnerDetails } from "@/components/partners/partner-details";

export default function PartnerDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <DashboardLayout>
      <PartnerDetails id={params.id} />
    </DashboardLayout>
  );
}
