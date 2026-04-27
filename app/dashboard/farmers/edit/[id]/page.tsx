import { FarmerForm } from "@/components/farmers/farmer-form";

export default async function EditFarmerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FarmerForm id={id} />;
}
