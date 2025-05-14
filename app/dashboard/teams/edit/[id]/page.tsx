import { TeamForm } from "@/components/teams/team-form";

export default function EditTeamPage({ params }: { params: { id: string } }) {
  return <TeamForm id={params.id} />;
}
