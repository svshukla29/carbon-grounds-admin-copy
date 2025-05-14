import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProjectForm } from "@/components/projects/project-form"

export default function EditProjectPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <ProjectForm id={params.id} />
    </DashboardLayout>
  )
}
