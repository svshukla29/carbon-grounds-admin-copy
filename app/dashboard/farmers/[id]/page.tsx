import { FarmerDetails } from "@/components/farmers/farmer-details";

export default function FarmerDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return <FarmerDetails id={params.id} />;
}
