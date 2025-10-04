import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import StudentCoursesClient from "@/components/student/StudentCoursesClient";

export const metadata: Metadata = {
  title: "Mes Cours | Pharmapedia",
  description: "Accédez à vos cours et ressources pédagogiques par université",
};

export default async function StudentCoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/auth/sign-in");
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Cours</h1>
        <p className="text-gray-600">
          Accédez à vos cours et ressources pédagogiques organisés par université et année académique.
        </p>
      </div>
      
      <StudentCoursesClient />
    </div>
  );
}