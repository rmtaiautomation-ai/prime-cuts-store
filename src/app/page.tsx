import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ShieldCheck, Truck, Star, Building2, ThumbsUp, CreditCard, Users } from "lucide-react";
import { ProductGrid } from "@/components/ProductGrid";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { HeroCarousel } from "@/components/HeroCarousel";
import { supabase } from "@/lib/supabase/client";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let products = MOCK_PRODUCTS;

  try {
    const { data: dbProducts, error } = await supabase.from("products").select("*");
    if (!error && dbProducts && dbProducts.length > 0) {
      products = dbProducts.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        price: Number(p.price),
        category: p.category as any || "Beef",
        imageUrl: encodeURI(p.image_url || ""),
        isFeatured: true,
        stockQuantity: p.stock_quantity || 0,
      }));
    }
  } catch (err) {
    console.error("Failed to fetch products from Supabase:", err);
  }
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      
      {/* Tier 1: Top Promo Banner */}
      <div className="bg-primary text-primary-foreground text-xs font-bold text-center py-2 px-4">
        Free delivery for all orders above ₱4,000. | Next-day delivery cut-off is at 7:30PM.
      </div>

      {/* Tier 2: Trust Indicators */}
      <div className="bg-[#374151] text-white text-[10px] md:text-xs py-2 px-4 hidden sm:block">
        <div className="container mx-auto flex justify-between items-center max-w-5xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Guaranteed Palengke-Fresh</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span>Free Delivery Above ₱4,000</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>Trusted by 4,000+ Sukis</span>
          </div>
        </div>
      </div>

      {/* Main navigation is now handled globally by layout.tsx */}

      <main className="flex-1 flex flex-col w-full">
        <HeroCarousel />
      </main>

      {/* Featured Products Section */}
      <section className="bg-background py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6 border-b border-border pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground">Shop by Category</h2>
            </div>
            <Button variant="outline" className="hidden md:flex border-border hover:border-primary/50 text-foreground group transition-all">
              View All Categories
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-background py-16 md:py-24 border-t border-border">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-10">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Why PrimeCuts PH</h3>
            <h2 className="text-3xl md:text-4xl font-black text-[#111827] uppercase tracking-tight">Fast, Reliable, and Wallet-Friendly</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-[#111827] rounded-full p-3 flex-shrink-0 text-white">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#111827] uppercase text-sm mb-2"><span className="bg-yellow-400 text-[#111827] px-2 py-1 rounded-sm">Same Day Delivery</span></h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">Get your order when you need it—swift, reliable, and hassle-free</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-[#111827] rounded-full p-3 flex-shrink-0 text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#111827] uppercase text-sm mb-2">Guaranteed Premium Quality</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">Experience the best in every product, backed by our quality assurance</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-[#111827] rounded-full p-3 flex-shrink-0 text-white">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#111827] uppercase text-sm mb-2">Trusted By 50+ Establishments</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">Supplying premium products to leading restaurants and hotels across the country</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-[#111827] rounded-full p-3 flex-shrink-0 text-white">
                  <ThumbsUp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#111827] uppercase text-sm mb-2">40,000+ Happy Customers</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">Join thousands who trust us for quality and service, ensuring satisfaction with every order</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-[#111827] rounded-full p-3 flex-shrink-0 text-white">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#111827] uppercase text-sm mb-2">Flexible Payment Options</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">Pay easily with Cash on Delivery or Credit Card for your convenience</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-[#111827] rounded-full p-3 flex-shrink-0 text-white">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#111827] uppercase text-sm mb-2">Earn Store Credits By Referring Friends</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">Share the love and get rewarded with store credits for every successful referral</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
