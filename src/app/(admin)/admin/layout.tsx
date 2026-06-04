import { AdminShell } from "../../../features/admin/components/admin-shell";
import { requireAdmin } from "../../../features/admin/lib/rbac";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
