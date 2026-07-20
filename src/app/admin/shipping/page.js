import { redirect } from "next/navigation";
import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import {
  createShippingMethod,
  toggleShippingMethod,
  updateShippingMethod,
} from "./actions";
function formatMoney(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function AdminShippingPage({
  searchParams,
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email.toLowerCase(),
    },
    select: {
      role: true,
    },
  });

  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  const resolvedSearchParams = await searchParams;
  const success = resolvedSearchParams?.success;
  const error = resolvedSearchParams?.error;

  const methods = await prisma.shippingMethod.findMany({
    orderBy: [
      {
        position: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          Admin
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Shipping methods
        </h1>

        <p className="mt-4 max-w-2xl text-gray-400">
          Create and manage the delivery options shown during
          checkout.
        </p>
      </div>

      {success ? (
        <div className="mt-8 rounded-lg border border-green-900 bg-green-950/30 px-4 py-3 text-green-300">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="mt-8 rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-red-300">
          {error}
        </div>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[380px_1fr]">
        <form
          action={createShippingMethod}
          className="h-fit space-y-5 rounded-2xl border border-gray-800 bg-gray-950 p-6"
        >
          <h2 className="text-xl font-semibold">
            Add shipping method
          </h2>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300"
            >
              Name
            </label>

            <input
              id="name"
              name="name"
              required
              placeholder="Overnight Shipping"
              className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
            />
          </div>

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-300"
            >
              Code
            </label>

            <input
              id="code"
              name="code"
              required
              placeholder="OVERNIGHT"
              className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 uppercase text-white outline-none focus:border-white"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Delivery on the next business day"
              className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
            />
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-300"
            >
              Price
            </label>

            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="19.99"
              className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
            />
          </div>

          <div>
            <label
              htmlFor="freeAbove"
              className="block text-sm font-medium text-gray-300"
            >
              Free above
            </label>

            <input
              id="freeAbove"
              name="freeAbove"
              type="number"
              min="0"
              step="0.01"
              placeholder="100.00"
              className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="estimatedMinDays"
                className="block text-sm font-medium text-gray-300"
              >
                Minimum days
              </label>

              <input
                id="estimatedMinDays"
                name="estimatedMinDays"
                type="number"
                min="0"
                required
                className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
              />
            </div>

            <div>
              <label
                htmlFor="estimatedMaxDays"
                className="block text-sm font-medium text-gray-300"
              >
                Maximum days
              </label>

              <input
                id="estimatedMaxDays"
                name="estimatedMaxDays"
                type="number"
                min="0"
                required
                className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="position"
              className="block text-sm font-medium text-gray-300"
            >
              Display position
            </label>

            <input
              id="position"
              name="position"
              type="number"
              min="0"
              required
              defaultValue="3"
              className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-white px-5 py-3 font-semibold text-black transition hover:bg-gray-200"
          >
            Add shipping method
          </button>
        </form>

        <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-950">
          <div className="border-b border-gray-800 px-6 py-5">
            <h2 className="text-xl font-semibold">
              Current methods
            </h2>
          </div>

          <div className="divide-y divide-gray-800">
            {methods.map((method) => (
              <div
  key={method.id}
  className="px-6 py-5"
>
  <div className="grid gap-5 md:grid-cols-[1fr_auto]">
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-semibold">
          {method.name}
        </h3>

        <span className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-400">
          {method.code}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            method.isActive
              ? "bg-green-950 text-green-300"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          {method.isActive
            ? "Active"
            : "Inactive"}
        </span>
      </div>

      {method.description ? (
        <p className="mt-3 text-sm text-gray-400">
          {method.description}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
        <span>
          Price:{" "}
          <strong className="text-white">
            {formatMoney(method.priceInCents)}
          </strong>
        </span>

        <span>
          Free above:{" "}
          <strong className="text-white">
            {method.freeAboveCents === null
              ? "Never"
              : formatMoney(method.freeAboveCents)}
          </strong>
        </span>

        <span>
          Delivery:{" "}
          <strong className="text-white">
            {method.estimatedMinDays}–
            {method.estimatedMaxDays} days
          </strong>
        </span>

        <span>
          Position:{" "}
          <strong className="text-white">
            {method.position}
          </strong>
        </span>
      </div>
    </div>

    <form
      action={toggleShippingMethod}
      className="self-start"
    >
      <input
        type="hidden"
        name="id"
        value={method.id}
      />

      <button
        type="submit"
        className="rounded-md border border-gray-700 px-4 py-2 text-sm font-semibold transition hover:border-white"
      >
        {method.isActive
          ? "Disable"
          : "Enable"}
      </button>
    </form>
  </div>

  <details className="mt-5 rounded-xl border border-gray-800 bg-black/40">
    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white">
      Edit shipping method
    </summary>

    <form
      action={updateShippingMethod}
      className="grid gap-5 border-t border-gray-800 p-5 md:grid-cols-2"
    >
      <input
        type="hidden"
        name="id"
        value={method.id}
      />

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Name
        </label>

        <input
          name="name"
          required
          defaultValue={method.name}
          className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Code
        </label>

        <input
          name="code"
          required
          defaultValue={method.code}
          className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 uppercase text-white outline-none focus:border-white"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-300">
          Description
        </label>

        <textarea
          name="description"
          rows={3}
          defaultValue={method.description || ""}
          className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Price
        </label>

        <input
          name="price"
          type="number"
          min="0"
          step="0.01"
          required
          defaultValue={(
            method.priceInCents / 100
          ).toFixed(2)}
          className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Free above
        </label>

        <input
          name="freeAbove"
          type="number"
          min="0"
          step="0.01"
          defaultValue={
            method.freeAboveCents === null
              ? ""
              : (
                  method.freeAboveCents / 100
                ).toFixed(2)
          }
          className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Minimum days
        </label>

        <input
          name="estimatedMinDays"
          type="number"
          min="0"
          required
          defaultValue={method.estimatedMinDays}
          className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Maximum days
        </label>

        <input
          name="estimatedMaxDays"
          type="number"
          min="0"
          required
          defaultValue={method.estimatedMaxDays}
          className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Display position
        </label>

        <input
          name="position"
          type="number"
          min="0"
          required
          defaultValue={method.position}
          className="mt-2 w-full rounded-md border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-white"
        />
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          className="w-full rounded-md bg-white px-5 py-3 font-semibold text-black transition hover:bg-gray-200"
        >
          Save changes
        </button>
      </div>
    </form>
  </details>
</div>
    ))}
  </div>
</div>
</div>
</section>
  );
}
