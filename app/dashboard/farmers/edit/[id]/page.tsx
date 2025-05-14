import { FarmerForm } from "@/components/farmers/farmer-form";

export default function EditFarmerPage({ params }: { params: { id: string } }) {
  return <FarmerForm id={params.id} />;
}
