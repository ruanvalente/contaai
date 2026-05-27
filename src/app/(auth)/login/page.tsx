import { LoginFormWidget } from "@/features/auth/widgets/login-form.widget";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginFormWidget />
    </Suspense>
  );
}
