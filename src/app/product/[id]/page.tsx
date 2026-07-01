import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProductDetailsClient } from "./ProductDetailsClient";
import { Navbar } from "@/components/Navbar";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description")
    .eq("id", resolvedParams.id)
    .single();

  if (!product) return { title: "Product Not Found | PrimeCuts PH" };

  return {
    title: `${product.name} | PrimeCuts PH`,
    description: product.description || `Buy premium ${product.name} at PrimeCuts PH.`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product || !product.is_active) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-16">
        <ProductDetailsClient product={product} />
      </main>
    </div>
  );
}
