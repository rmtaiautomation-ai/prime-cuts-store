import { supabase } from "@/lib/supabase/client";
import { InventoryClient } from "./InventoryClient";

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Inventory Management</h1>
        <p className="text-muted-foreground mt-1">Manage your stock levels and catalog items.</p>
      </div>
      <InventoryClient initialProducts={products || []} />
    </div>
  );
}
