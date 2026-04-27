import { TeamDetails } from "@/components/teams/team-details";

export default async function TeamDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TeamDetails id={id} />;
}
