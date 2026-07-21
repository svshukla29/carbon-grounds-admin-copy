import { Suspense } from "react";
import { FarmerForm } from "@/components/farmers/farmer-form";

export default function CreateFarmerPage() {
  return (
    <Suspense fallback={null}>
      <FarmerForm />
    </Suspense>
  );
}
