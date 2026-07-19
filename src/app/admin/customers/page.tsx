import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { auth } from "@/auth/auth";

type AdminCustomersPageProps = {
  searchParams: Promise<{
    search?: string;
  }>;
};


function formatCurrency(amountInCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function AdminCustomersPage({
  searchParams,
}: AdminCustomersPageProps) {
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
  const { search = "" } = await searchParams;
  const normalizedSearch = search.trim();

 const customers = await prisma.user.findMany({
  where: {
    OR: [
      {
        role: "CUSTOMER",
      },
      {
        orders: {
          some: {},
        },
      },
    ],
    ...(normalizedSearch
      ? {
          AND: [
            {
              OR: [
                {
                  name: {
                    contains: normalizedSearch,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: normalizedSearch,
                    mode: "insensitive",
                  },
                },
              ],
            },
          ],
        }
      : {}),
  },
  select: {
    id: true,
    name: true,
    email: true,
    createdAt: true,
    orders: {
      select: {
        totalInCents: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    },
  },
  orderBy: {
    createdAt: "desc",
  },
});

  const customerRows = customers.map((customer) => {
    const totalSpentInCents = customer.orders.reduce(
      (total, order) => total + order.totalInCents,
      0,
    );

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      createdAt: customer.createdAt,
      orderCount: customer.orders.length,
      totalSpentInCents,
      lastOrderDate: customer.orders[0]?.createdAt ?? null,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          Administration
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Customers</h1>
            <p className="mt-2 text-zinc-400">
              View customer accounts and purchase history.
            </p>
          </div>

          <p className="text-sm text-zinc-400">
            {customerRows.length}{" "}
            {customerRows.length === 1 ? "customer" : "customers"}
          </p>
        </div>
      </div>

      <form className="flex max-w-xl gap-3" method="GET">
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search by name or email"
          className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
        />

        <button
          type="submit"
          className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          Search
        </button>

        {normalizedSearch ? (
          <Link
            href="/admin/customers"
            className="rounded-lg border border-zinc-800 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600 hover:text-white"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        {customerRows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-white">
              No customers found
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              {normalizedSearch
                ? `No customers matched “${normalizedSearch}”.`
                : "Registered customers will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-zinc-800 bg-zinc-900/50">
                <tr className="text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium">Orders</th>
                  <th className="px-6 py-4 font-medium">Total spent</th>
                  <th className="px-6 py-4 font-medium">Last order</th>
                  <th className="px-6 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-800">
                {customerRows.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition hover:bg-zinc-900/60"
                  >
                    <td className="px-6 py-5">
                      <p className="font-medium text-white">
                        {customer.name || "Unnamed customer"}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {customer.email}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm text-zinc-300">
                      {formatDate(customer.createdAt)}
                    </td>

                    <td className="px-6 py-5 text-sm text-zinc-300">
                      {customer.orderCount}
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-white">
                      {formatCurrency(customer.totalSpentInCents)}
                    </td>

                    <td className="px-6 py-5 text-sm text-zinc-300">
                      {customer.lastOrderDate
                        ? formatDate(customer.lastOrderDate)
                        : "No orders"}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="text-sm font-semibold text-white underline-offset-4 hover:underline"
                      >
                        View customer
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}