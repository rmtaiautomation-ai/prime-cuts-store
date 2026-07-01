"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Package, User, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

export default function AccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      setUser(session.user);

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
        
      if (!profileData && profileError?.code === 'PGRST116') {
        // PGRST116 means no rows returned. The trigger might have failed.
        // Auto-heal by creating the profile now.
        const newProfile = {
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || "",
          is_admin: false,
        };
        
        await supabase.from("profiles").insert(newProfile);
        setProfile(newProfile);
      } else {
        setProfile(profileData);
      }

      // Fetch Orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*, order_items(*, products(*))")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
        
      if (ordersData) {
        setOrders(ordersData);
      }
      
      setIsLoading(false);
    };

    fetchUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001a41]"></div>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "Suki";
  const fullName = profile?.full_name || user?.user_metadata?.full_name || "No name provided";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 py-6 px-4 md:px-12 bg-white flex justify-between items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-[#001a41] hover:opacity-80 transition-opacity font-black uppercase tracking-widest text-2xl">
          <ArrowLeft className="h-5 w-5 md:hidden" />
          <span className="hidden md:inline">PrimeCuts PH</span>
        </Link>
        <div className="text-sm font-semibold text-gray-600">
          Welcome back, {firstName}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">My Account</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your orders and preferences.</p>
          </div>
          <div className="flex gap-3">
            {profile?.is_admin && (
              <Button render={<Link href="/admin" />} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Admin Panel
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Order History */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-[#001a41]" />
              Order History
            </h2>
            
            {orders.length === 0 ? (
              <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                  <Package className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="font-medium text-gray-900 mb-1">You haven't placed any orders yet.</p>
                  <p className="text-sm mb-6">Once you buy your first steak, it will appear here.</p>
                  <Button render={<Link href="/" />} className="bg-[#001a41] hover:bg-[#002a66] text-white">
                    Start Shopping
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Order Placed</p>
                        <p className="text-sm text-gray-900">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Amount</p>
                        <p className="text-sm text-gray-900 font-medium">₱{Number(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Order ID</p>
                        <p className="text-sm font-mono text-gray-600">{order.id.split('-')[0]}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                              <img src={item.products?.image_url} alt={item.products?.name} className="h-full w-full object-cover object-center" />
                            </div>
                            <div className="flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>{item.products?.name}</h3>
                                  <p className="ml-4">₱{Number(item.price_at_purchase).toLocaleString()}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">{item.products?.category}</p>
                              </div>
                              <div className="flex flex-1 items-end justify-between text-sm">
                                <p className="text-gray-500">Qty {item.quantity}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <Button variant="outline" className="w-full sm:w-auto">
                          View Receipt
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Details */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-[#001a41]" />
              Account Details
            </h2>

            <div className="bg-white shadow rounded-lg border border-gray-200 p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Profile</h3>
                <p className="text-sm text-gray-600 font-medium">{fullName}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" /> Shipping Address
                </h3>
                {profile?.shipping_address || (orders && orders.length > 0 && orders[0].shipping_address) ? (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium">{profile?.full_name || (orders.length > 0 && orders[0].customer_name) || 'No Name'}</p>
                    <p>{profile?.phone || (orders.length > 0 && orders[0].customer_phone)}</p>
                    <p>{profile?.shipping_address || (orders.length > 0 && orders[0].shipping_address)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Your shipping address will be automatically saved here the first time you checkout and place an order!
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
