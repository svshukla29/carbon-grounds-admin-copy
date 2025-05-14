import { PartnerDetails } from "@/components/partners/partner-details";

export default function PartnerDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return <PartnerDetails id={params.id} />;
}
