import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  console.log("Admin access check for user:", user.id);
  console.log("Profile fetched:", profile);
  console.log("Profile error:", profileError);

  if (!profile?.is_admin) {
    console.log("Redirecting to home because user is not admin.");
    redirect("/"); // Redirect non-admins to home
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row font-sans text-foreground selection:bg-primary/30">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-background border-r border-border min-h-screen p-4 flex flex-col shadow-sm">
        <div className="flex items-center gap-2 mb-8 px-2 mt-4">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h2 className="text-xl font-black tracking-tight uppercase text-primary">Admin Panel</h2>
        </div>
        
        <nav className="flex flex-col gap-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Link>
          <Link href="/admin/inventory" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
            <Package className="h-4 w-4" />
            Inventory
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
            <ShoppingCart className="h-4 w-4" />
            Orders
          </Link>
          <Link href="/admin/customers" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
            <Users className="h-4 w-4" />
            Customers
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
