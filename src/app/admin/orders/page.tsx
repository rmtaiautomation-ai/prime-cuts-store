import { getAdminOrders } from "@/app/actions/admin";
import { OrdersClient } from "./OrdersClient";

export const dynamic = 'force-dynamic';

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;
  const limit = 10;

  const result = await getAdminOrders(page, limit);
  const orders = result.success ? result.orders : [];
  const totalCount = result.success ? result.totalCount : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Order Management</h1>
        <p className="text-muted-foreground mt-1">Track and update the status of customer deliveries.</p>
      </div>
      <OrdersClient 
        initialOrders={orders || []} 
        totalCount={totalCount || 0}
        currentPage={page}
        limit={limit}
      />
    </div>
  );
}
