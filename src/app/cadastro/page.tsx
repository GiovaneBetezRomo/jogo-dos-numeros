import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function CadastroPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center font-mono text-xs uppercase text-valorant-muted">
          Carregando cadastro...
        </div>
      }
    >
      <AuthForm mode="register" />
    </Suspense>
  );
}
