"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, GraduationCap, Building, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import BackgroundGradient from "@/components/ui/BackgroundGradient";
import { useRouter } from "next/navigation";
import AnimatedBackground from "../ui/AnimatedBackground";

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  year: string;
  universityId: string;
  sex: string;
  phoneNumber: string;
}

interface University {
  id: string;
  name: string;
}

export default function SignUpClient() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    year: "",
    universityId: "",
    sex: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch("/api/universities");
        if (response.ok) {
          const data = await response.json();
          setUniversities(data.universities);
        }
      } catch (error) {
        console.error("Error fetching universities:", error);
      } finally {
        setLoadingUniversities(false);
      }
    };

    fetchUniversities();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setAuthError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 8) {
      setAuthError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          year: parseInt(formData.year) || null,
          universityId: formData.universityId || null,
          sex: formData.sex || null,
          phoneNumber: formData.phoneNumber || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Une erreur s'est produite lors de l'inscription"
        );
      }

      setIsSuccess(true);
      setSuccessMessage(
        data.message ||
          "Compte créé avec succès ! Vérifiez votre email pour l'activation."
      );
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        year: "",
        universityId: "",
        sex: "",
        phoneNumber: "",
      });

      // Redirect to sign-in after a delay
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 3000);
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Erreur lors de l'inscription"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative">
        <AnimatedBackground
          particleCount={200}
          colors={[
            "bg-blue-400",
            "bg-purple-400",
            "bg-pink-400",
            "bg-indigo-400",
            "bg-violet-400",
            "bg-cyan-400",
            "bg-emerald-400",
            "bg-yellow-400",
          ]}
        />
        <BackgroundGradient />
        <div className="max-w-md w-full space-y-8 relative z-20">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Inscription réussie !
            </h2>
            <p className="text-gray-600 mb-6">{successMessage}</p>
            <p className="text-sm text-gray-500">
              Redirection vers la page de connexion...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
              <AnimatedBackground
          particleCount={50}
          colors={[
            "bg-blue-400",
            "bg-purple-400",
            "bg-pink-400",
            "bg-indigo-400",
            "bg-violet-400",
            "bg-cyan-400",
            "bg-emerald-400",
            "bg-yellow-400",
          ]}
        />
        <BackgroundGradient />
      <div className="max-w-lg w-full space-y-8 relative z-20">
        <div className="text-center relative z-20">
          <Link href="/" className="inline-block">
            <Image
              src="/pharmapedia-logo.png"
              alt="Pharmapedia"
              width={200}
              height={50}
              className="mx-auto"
            />
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Créer un compte
          </h2>
          <p className="mt-2 text-sm text-gray-100">
            Rejoignez Pharmapedia pour accéder aux ressources pédagogiques
          </p>
        </div>

        <form className="mt-8 space-y-6 relative z-20" onSubmit={handleSubmit}>
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative z-20">
            {authError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{authError}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nom complet
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Votre nom complet"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Minimum 8 caractères"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Confirmer votre mot de passe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="sex"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sexe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="sex"
                      name="sex"
                      value={formData.sex}
                      onChange={handleChange}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sélectionner</option>
                      <option value="MALE">Homme</option>
                      <option value="FEMALE">Femme</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="+213 XXX XXX XXX"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Année d'étude
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GraduationCap className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sélectionner</option>
                      <option value="1">1ère année</option>
                      <option value="2">2ème année</option>
                      <option value="3">3ème année</option>
                      <option value="4">4ème année</option>
                      <option value="5">5ème année</option>
                      <option value="6">6ème année</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="universityId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Université
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="universityId"
                      name="universityId"
                      value={formData.universityId}
                      onChange={handleChange}
                      disabled={loadingUniversities}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">
                        {loadingUniversities
                          ? "Chargement..."
                          : "Sélectionner une université"}
                      </option>
                      {universities.map((university) => (
                        <option key={university.id} value={university.id}>
                          {university.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-[1.02] font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création en cours...
                  </>
                ) : (
                  "Créer mon compte"
                )}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Vous avez déjà un compte ?{" "}
                <Link
                  href="/auth/sign-in"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </form>

        <div className="text-center relative z-20">
          <p className="text-xs text-white">
            En créant un compte, vous acceptez nos{" "}
            <Link href="/terms" className="text-white hover:text-gray-200 underline">
              Conditions d'utilisation
            </Link>{" "}
            et notre{" "}
            <Link href="/privacy" className="text-white hover:text-gray-200 underline">
              Politique de confidentialité
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
