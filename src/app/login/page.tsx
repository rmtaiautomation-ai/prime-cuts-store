"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
// Metadata needs to be in a separate layout file if using "use client" on this page, or we can just remove metadata export here.
// Let's remove export const metadata to avoid Next.js page metadata errors.

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      // 1. Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // 2. Fetch user profile to check if they are an admin
      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", authData.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        }

        toast.success("Successfully logged in!");

        // 3. Smart Routing
        if (profile?.is_admin) {
          router.push("/admin");
        } else {
          router.push("/account");
        }
      }
    } catch (error: any) {
      setAuthError("Invalid credentials. Please check your email and password and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center items-center gap-2 text-[#001a41] hover:opacity-80 transition-opacity font-black uppercase tracking-widest text-2xl mb-6">
          <ArrowLeft className="h-5 w-5" />
          PrimeCuts PH
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 uppercase tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link href="/register" className="font-medium text-[#001a41] hover:text-[#002a66] hover:underline">
            create a new Suki account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-start gap-2 shadow-sm">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{authError}</span>
              </div>
            )}
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#001a41] focus:border-[#001a41] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#001a41] focus:border-[#001a41] sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#001a41] focus:ring-[#001a41] border-gray-300 rounded"
                />
                <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </Label>
              </div>

              <div className="text-sm">
                <Link href="#" className="font-medium text-[#001a41] hover:text-[#002a66] hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#001a41] hover:bg-[#002a66] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#001a41] h-12 disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 h-12"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.73 17.57V20.34H19.29C21.37 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                    <path d="M12 23C14.97 23 17.46 22.01 19.29 20.34L15.73 17.57C14.74 18.23 13.48 18.63 12 18.63C9.13 18.63 6.7 16.7 5.82 14.11H2.15V16.96C3.97 20.57 7.69 23 12 23Z" fill="#34A853"/>
                    <path d="M5.82 14.11C5.6 13.44 5.47 12.73 5.47 12C5.47 11.27 5.6 10.56 5.82 9.89V7.04H2.15C1.4 8.53 0.96 10.21 0.96 12C0.96 13.79 1.4 15.47 2.15 16.96L5.82 14.11Z" fill="#FBBC05"/>
                    <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.38 3.84C17.45 2.05 14.97 1 12 1C7.69 1 3.97 3.43 2.15 7.04L5.82 9.89C6.7 7.3 9.13 5.38 12 5.38Z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </Button>
              </div>

              <div>
                <Button
                  type="button"
                  variant="outline"
                  render={<Link href="/register" />}
                  className="w-full flex justify-center py-2 px-4 border border-[#001a41] text-[#001a41] rounded-md shadow-sm text-sm font-bold bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#001a41] h-12"
                >
                  Create an Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
