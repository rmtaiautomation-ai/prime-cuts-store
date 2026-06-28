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
      
      setIsLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

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
          <Button variant="outline" className="border-gray-300 text-gray-700 cursor-pointer" onClick={handleLogout}>
            Log out
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Order History */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-[#001a41]" />
              Order History
            </h2>
            
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
                <p className="text-sm text-gray-500 italic">
                  Your shipping address will be automatically saved here the first time you checkout and place an order!
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
