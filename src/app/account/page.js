import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth/auth";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
        My account
      </p>

      <h1 className="mt-3 text-4xl font-bold">
        Welcome, {session.user.name || session.user.email}
      </h1>

      <p className="mt-4 text-gray-400">
        Your account is signed in successfully.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="rounded-2xl border border-gray-800 bg-gray-950 p-6 transition hover:border-gray-600"
        >
          <h2 className="text-xl font-semibold">My orders</h2>

          <p className="mt-2 text-gray-400">
            View your order history and payment status.
          </p>
        </Link>

        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
          <h2 className="text-xl font-semibold">Account details</h2>

          <p className="mt-2 text-gray-400">
            {session.user.email}
          </p>
        </div>
      </div>
    </section>
  );
}