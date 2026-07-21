import { Suspense } from "react";
import { FarmerForm } from "@/components/farmers/farmer-form";

export default async function EditFarmerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <FarmerForm id={id} />
    </Suspense>
  );
}
