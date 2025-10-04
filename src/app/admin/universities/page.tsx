import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import UniversitiesManagementClient from "@/components/admin/UniversitiesManagementClient";

export const metadata: Metadata = {
  title: "Universities Management | Pharmapedia Admin",
  description: "Manage universities and their drive links",
};

export default async function UniversitiesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/sign-in");
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <UniversitiesManagementClient />
    </div>
  );
}