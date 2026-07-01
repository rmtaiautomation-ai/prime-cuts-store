import { getAdminOrders } from "@/app/actions/admin";
import { OrdersClient } from "./OrdersClient";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const result = await getAdminOrders();
  const orders = result.success ? result.orders : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Order Management</h1>
        <p className="text-muted-foreground mt-1">Track and update the status of customer deliveries.</p>
      </div>
      <OrdersClient initialOrders={orders || []} />
    </div>
  );
}
