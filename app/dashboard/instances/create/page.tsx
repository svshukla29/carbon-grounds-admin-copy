import { Suspense } from "react";
import { InstanceForm } from "@/components/instances/instance-form";

export default function CreateInstancePage() {
  return (
    <Suspense fallback={null}>
      <InstanceForm />
    </Suspense>
  );
}
