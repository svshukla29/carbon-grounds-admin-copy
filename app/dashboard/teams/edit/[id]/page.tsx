import { TeamForm } from "@/components/teams/team-form";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TeamForm id={id} />;
}
