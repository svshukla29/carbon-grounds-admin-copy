import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TeamForm } from "@/components/teams/team-form"

export default function EditTeamPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <TeamForm id={params.id} />
    </DashboardLayout>
  )
}
