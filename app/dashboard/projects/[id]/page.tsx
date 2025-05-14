import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProjectDetails } from "@/components/projects/project-details"

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <ProjectDetails id={params.id} />
    </DashboardLayout>
  )
}
