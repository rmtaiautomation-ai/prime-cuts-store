"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PostCheckoutSignupProps {
  orderEmail: string;
  orderName: string;
}

export function PostCheckoutSignup({ orderEmail, orderName }: PostCheckoutSignupProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: orderEmail,
        password: password,
        options: {
          data: {
            full_name: orderName,
          }
        }
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Account created successfully! Your order has been linked.");
      
      // Redirect to account dashboard after a short delay
      setTimeout(() => {
        router.push("/account");
      }, 2000);
      
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="mt-12 bg-green-50 border border-green-200 rounded-2xl p-6 sm:p-8 text-center animate-in fade-in zoom-in duration-500">
        <h3 className="text-xl font-bold text-green-900 mb-2">Account Created!</h3>
        <p className="text-green-700">Redirecting you to your new dashboard...</p>
      </div>
    );
  }

  return (
    <div className="mt-12 bg-gradient-to-br from-[#001a41] to-[#002a66] rounded-2xl p-6 sm:p-8 text-left text-white shadow-xl relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            <Gift className="w-4 h-4 text-yellow-300" />
            <span className="text-blue-50">Earn Rewards</span>
          </div>
          <h3 className="text-2xl font-bold">Save this order to your new account</h3>
          <p className="text-blue-100">
            Create a password for <span className="font-semibold text-white">{orderEmail}</span> to track this order, earn rewards on future purchases, and check out faster next time.
          </p>
        </div>

        <div className="w-full md:w-auto min-w-[280px]">
          <form onSubmit={handleCreateAccount} className="space-y-3 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/20">
            <div className="space-y-1">
              <label className="text-xs font-medium text-blue-200 px-1">Create a Password</label>
              <Input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white/90 text-gray-900 border-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-yellow-400"
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-yellow-500 hover:bg-yellow-400 text-[#001a41] font-bold text-base transition-all"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating...</>
              ) : (
                <>Create Account <ArrowRight className="ml-2 w-5 h-5" /></>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
