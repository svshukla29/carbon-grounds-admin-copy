import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TeamForm } from "@/components/teams/team-form";

export default function CreateTeamPage() {
  return (
    <DashboardLayout>
      <TeamForm />
    </DashboardLayout>
  );
}
