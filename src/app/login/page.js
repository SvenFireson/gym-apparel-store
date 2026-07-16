import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-lg px-6 py-16 text-center">
          <p className="text-gray-400">Loading sign in...</p>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}