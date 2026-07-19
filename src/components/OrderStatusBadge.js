const statusStyles = {
  PENDING: "border-yellow-700 bg-yellow-950/40 text-yellow-300",
  PAID: "border-emerald-700 bg-emerald-950/40 text-emerald-300",
  PROCESSING: "border-blue-700 bg-blue-950/40 text-blue-300",
  SHIPPED: "border-violet-700 bg-violet-950/40 text-violet-300",
  DELIVERED: "border-green-700 bg-green-950/40 text-green-300",
  CANCELLED: "border-red-700 bg-red-950/40 text-red-300",
};

export default function OrderStatusBadge({ status }) {
  const styles =
    statusStyles[status] ??
    "border-gray-700 bg-gray-950 text-gray-300";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles}`}
    >
      {status}
    </span>
  );
}