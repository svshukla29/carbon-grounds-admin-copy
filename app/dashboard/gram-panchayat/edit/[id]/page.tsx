import { Suspense } from "react";
import { GramPanchayatForm } from "@/components/gram-panchayat/gram-panchayat-form";

export default async function EditGramPanchayatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <GramPanchayatForm id={id} />
    </Suspense>
  );
}
