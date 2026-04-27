import { FarmerDetails } from "@/components/farmers/farmer-details";

export default async function FarmerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FarmerDetails id={id} />;
}
