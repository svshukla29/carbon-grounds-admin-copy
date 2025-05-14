import { ProjectForm } from "@/components/projects/project-form";

export default function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  return <ProjectForm id={params.id} />;
}
