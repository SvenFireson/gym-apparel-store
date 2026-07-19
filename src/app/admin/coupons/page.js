import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  createCoupon,
  toggleCoupon,
} from "./actions";

function formatCurrency(amountInCents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100);
}

function formatDate(date) {
  if (!date) {
    return "No limit";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

export default async function AdminCouponsPage({
  searchParams,
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const admin = await prisma.user.findUnique({
    where: {
      email: session.user.email.trim().toLowerCase(),
    },
    select: {
      role: true,
    },
  });

  if (!admin || admin.role !== "ADMIN") {
    redirect("/account");
  }

  const params = await searchParams;
  const error = params?.error;
  const success = params?.success;

  const coupons = await prisma.coupon.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
          Admin
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Coupons
        </h1>

        <p className="mt-2 text-zinc-400">
          Create and manage discount codes for IRONWEAR.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-6 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
          {success}
        </div>
      ) : null}

      <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-xl font-semibold text-white">
          Create coupon
        </h2>

        <form
          action={createCoupon}
          className="mt-6 grid gap-5 md:grid-cols-2"
        >
          <label className="block">
            <span className="text-sm text-zinc-300">
              Coupon code
            </span>

            <input
              name="code"
              required
              placeholder="IRON10"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-zinc-400"
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-300">
              Description
            </span>

            <input
              name="description"
              placeholder="10% launch discount"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-zinc-400"
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-300">
              Discount type
            </span>

            <select
              name="discountType"
              required
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-zinc-400"
            >
              <option value="PERCENTAGE">
                Percentage
              </option>

              <option value="FIXED_AMOUNT">
                Fixed amount
              </option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-zinc-300">
              Discount value
            </span>

            <input
              name="discountValue"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="10"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-zinc-400"
            />

            <span className="mt-1 block text-xs text-zinc-500">
              Enter 10 for 10% or 10 for $10.
            </span>
          </label>

          <label className="block">
            <span className="text-sm text-zinc-300">
              Minimum spend
            </span>

            <input
              name="minimumSpend"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-zinc-400"
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-300">
              Maximum uses
            </span>

            <input
              name="maximumUses"
              type="number"
              min="1"
              step="1"
              placeholder="Leave blank for unlimited"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-zinc-400"
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-300">
              Starts at
            </span>

            <input
              name="startsAt"
              type="datetime-local"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-zinc-400"
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-300">
              Expires at
            </span>

            <input
              name="expiresAt"
              type="datetime-local"
              className="mt-2 w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-zinc-400"
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
            >
              Create coupon
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-6 py-5">
          <h2 className="text-xl font-semibold text-white">
            Existing coupons
          </h2>
        </div>

        {coupons.length === 0 ? (
          <div className="px-6 py-12 text-center text-zinc-500">
            No coupons have been created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">
                    Minimum spend
                  </th>
                  <th className="px-6 py-4">Uses</th>
                  <th className="px-6 py-4">Expires</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">
                {coupons.map((coupon) => {
                  const discount =
                    coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discountValue}%`
                      : formatCurrency(
                          coupon.discountValue,
                        );

                  const usageLimit =
                    coupon.maximumUses === null
                      ? "Unlimited"
                      : `${coupon.timesUsed} / ${coupon.maximumUses}`;

                  return (
                    <tr key={coupon.id}>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-white">
                          {coupon.code}
                        </p>

                        {coupon.description ? (
                          <p className="mt-1 text-sm text-zinc-500">
                            {coupon.description}
                          </p>
                        ) : null}
                      </td>

                      <td className="px-6 py-5 text-zinc-300">
                        {discount}
                      </td>

                      <td className="px-6 py-5 text-zinc-300">
                        {formatCurrency(
                          coupon.minimumSpendCents,
                        )}
                      </td>

                      <td className="px-6 py-5 text-zinc-300">
                        {usageLimit}
                      </td>

                      <td className="px-6 py-5 text-zinc-300">
                        {formatDate(coupon.expiresAt)}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={
                            coupon.isActive
                              ? "rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300"
                              : "rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-400"
                          }
                        >
                          {coupon.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <form action={toggleCoupon}>
                          <input
                            type="hidden"
                            name="couponId"
                            value={coupon.id}
                          />

                          <button
                            type="submit"
                            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:border-zinc-500"
                          >
                            {coupon.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}