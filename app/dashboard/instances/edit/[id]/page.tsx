import { Suspense } from "react";
import { InstanceForm } from "@/components/instances/instance-form";

export default async function EditInstancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <InstanceForm id={id} />
    </Suspense>
  );
}
