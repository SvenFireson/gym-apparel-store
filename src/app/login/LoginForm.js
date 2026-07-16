"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage("Invalid email or password.");
        return;
      }

      window.location.href = "/account";
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("Unable to sign in right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-lg px-6 py-16">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          Welcome back
        </p>

        <h1 className="mt-3 text-4xl font-bold">Sign in</h1>

        <p className="mt-4 text-gray-400">
          Access your IRONWEAR account and orders.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-10 space-y-6 rounded-2xl border border-gray-800 bg-gray-950 p-6"
      >
        {registered ? (
          <div className="rounded-md border border-green-900 bg-green-950/40 px-4 py-3 text-sm text-green-300">
            Account created successfully. You can now sign in.
          </div>
        ) : null}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300"
          >
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none transition focus:border-white"
          />
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="rounded-md border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300"
          >
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-sm text-gray-400">
          Need an account?{" "}
          <Link href="/register" className="font-semibold text-white underline">
            Create one
          </Link>
        </p>
      </form>
    </section>
  );
}