import { notFound } from "next/navigation";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import ModulePlaceholder from "@/components/modulos/module-placeholder";
import { moduleContent, type ModuleSlug } from "@/content/modules";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ modulo: string }>;
}) {
  const { modulo } = await params;

  if (!(modulo in moduleContent)) {
    notFound();
  }

  const currentModule = moduleContent[modulo as ModuleSlug];

  return (
    <DashboardShell>
      <ModulePlaceholder
        title={currentModule.title}
        description={currentModule.description}
      />
    </DashboardShell>
  );
}
