import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Add Product | Admin Dashboard",
};

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/inventory" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Add New Product</h1>
          <p className="text-muted-foreground mt-1">Create a new item in your catalog.</p>
        </div>
      </div>

      <ProductForm />
    </div>
  );
}
