import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
      year?: number;
      university?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
    year?: number;
    password?: string;
    university?: string;
    image?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
    year?: number;
    university?: string;
  }
}
