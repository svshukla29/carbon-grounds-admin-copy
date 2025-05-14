import { TeamDetails } from "@/components/teams/team-details";

export default function TeamDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return <TeamDetails id={params.id} />;
}
