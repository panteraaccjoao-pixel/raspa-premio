import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/9bkp-auth";
import AdminPanel from "@/components/9bkpPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/9bkp/login");
  return <AdminPanel />;
}
