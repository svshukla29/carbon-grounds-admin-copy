import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TeamDetails } from "@/components/teams/team-details";

export default function TeamDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <DashboardLayout>
      <TeamDetails id={params.id} />
    </DashboardLayout>
  );
}
