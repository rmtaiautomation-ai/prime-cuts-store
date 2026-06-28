import Link from "next/link";
import { CheckCircle, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <div className="flex-1 bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 text-center flex flex-col items-center">
          
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Account Created!
          </h2>
          
          <p className="text-sm text-gray-600 mb-8 max-w-sm">
            We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 w-full flex items-start text-left gap-3">
            <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900">Didn't receive the email?</h4>
              <p className="text-xs text-blue-700 mt-1">
                Check your spam folder or wait a few minutes. 
              </p>
            </div>
          </div>

          <Button
            render={<Link href="/login" />}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#001a41] hover:bg-[#002a66] h-12"
          >
            Return to Login <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

        </div>
      </div>
    </div>
  );
}
