import { AppShell } from "@/components/layout/app-shell";
import { StaffView } from "@/components/staff/staff-view";
import { listStaff, listBranches } from "@/db/repositories";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const [staffs, branches] = await Promise.all([listStaff(), listBranches()]);
  return (
    <AppShell title="Staff Management" subtitle="Kelola tim dan akses karyawan">
      <StaffView initialStaff={staffs} branches={branches} />
    </AppShell>
  );
}
