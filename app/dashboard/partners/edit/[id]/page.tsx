import { PartnerForm } from "@/components/partners/partner-form";

export default function EditPartnerPage({
  params,
}: {
  params: { id: string };
}) {
  return <PartnerForm id={params.id} />;
}
