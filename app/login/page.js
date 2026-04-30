import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import LoginForm from "@/components/login-form";
import { AUTH_COOKIE_NAME } from "@/lib/session";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}

