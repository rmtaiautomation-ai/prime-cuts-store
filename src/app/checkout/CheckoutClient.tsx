"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/useCartStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, Info, ShieldCheck, ChevronRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { createSecureOrder } from "@/app/actions/order";

export function CheckoutClient() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  const [tipPercentage, setTipPercentage] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("paymongo");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [isEditingAddress, setIsEditingAddress] = useState(true);
  const [hasDefaultAddress, setHasDefaultAddress] = useState(false);
  const [formattedSavedAddress, setFormattedSavedAddress] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        setEmail(session.user.email || "");
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          if (profile.full_name) {
            const parts = profile.full_name.split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
          }
        }
        
        let fetchedAddress = profile?.shipping_address;
        let fetchedPhone = profile?.phone;
        
        // If profile doesn't have an address, fallback to their last order
        if (!fetchedAddress) {
          const { data: lastOrder } = await supabase
            .from("orders")
            .select("shipping_address, customer_phone")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
            
          if (lastOrder?.shipping_address) {
            fetchedAddress = lastOrder.shipping_address;
            if (lastOrder.customer_phone) fetchedPhone = lastOrder.customer_phone;
          }
        }

        if (fetchedPhone) setPhone(fetchedPhone);

        if (fetchedAddress) {
          setHasDefaultAddress(true);
          setIsEditingAddress(false);
          setFormattedSavedAddress(fetchedAddress);
          
          // Attempt to parse existing address back into fields
          const parts = fetchedAddress.split(", ");
          if (parts.length >= 3) {
            setAddress(parts[0]);
            if (parts.length === 4) {
              setApartment(parts[1]);
              setCity(parts[2]);
              setPostalCode(parts[3]);
            } else {
              setCity(parts[1]);
              setPostalCode(parts[2]);
            }
          } else {
            setAddress(fetchedAddress);
          }
        }
      }
    };
    fetchProfile();
  }, []);

  const subtotal = getTotalPrice();
  
  // Calculate tip
  let tipAmount = 0;
  if (tipPercentage !== null) {
    tipAmount = subtotal * (tipPercentage / 100);
  } else if (customTip && !isNaN(Number(customTip))) {
    tipAmount = Number(customTip);
  }

  const shippingFee = 0; // Assuming free shipping for now or standard rate
  const finalTotal = subtotal + shippingFee + tipAmount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        customerEmail: email,
        customerName: `${firstName} ${lastName}`.trim(),
        customerPhone: phone,
        shippingAddress: `${address}, ${apartment ? apartment + ', ' : ''}${city}, ${postalCode}`,
        tipAmount: tipAmount,
      };

      const result = await createSecureOrder(orderData);

      if (!result.success) {
        throw new Error(result.error || "Failed to create order");
      }

      // Update User Profile if logged in
      if (userId) {
        await supabase.from('profiles').update({
          phone: phone,
          shipping_address: `${address}, ${apartment ? apartment + ', ' : ''}${city}, ${postalCode}`
        }).eq('id', userId);
      }

      toast.success("Order placed successfully!");
      clearCart();
      router.push(`/checkout/success?order_id=${result.orderId}`);
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error.message || "There was a problem placing your order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <form onSubmit={handlePayNow} className="flex flex-col-reverse md:flex-row min-h-screen">
      {/* Left Column: Form Section */}
      <div className="w-full md:w-3/5 lg:w-[55%] bg-white px-4 py-8 md:px-12 md:py-12 flex justify-center md:justify-end border-r border-gray-200">
        <div className="w-full max-w-xl space-y-10">
          
          {/* Header Logo (Aligned with form) */}
          <div className="pb-2">
            <Link href="/cart" className="inline-flex items-center gap-2 text-[#001a41] hover:opacity-80 transition-opacity font-black uppercase tracking-widest text-2xl md:text-3xl">
              <ArrowLeft className="h-6 w-6 md:hidden" />
              PrimeCuts PH
            </Link>
          </div>

          {/* Breadcrumb */}
          <nav className="hidden md:flex text-sm text-gray-500 mb-6 items-center gap-2">
            <Link href="/cart" className="hover:text-primary transition-colors">Cart</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold text-gray-900">Information</span>
            <ChevronRight className="h-4 w-4" />
            <span>Shipping</span>
            <ChevronRight className="h-4 w-4" />
            <span>Payment</span>
          </nav>

          {/* Contact */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Contact</h2>
              {!userId && (
                <Link href="#" className="text-sm text-blue-600 hover:underline">Log in</Link>
              )}
            </div>
            <div>
              <Input 
                type="email" 
                placeholder="Email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="news" className="rounded text-blue-600 border-gray-300 w-4 h-4" defaultChecked />
              <Label htmlFor="news" className="text-sm font-normal text-gray-700">Email me with news and offers</Label>
            </div>
          </section>

          {/* Delivery */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Delivery</h2>
            
            {!isEditingAddress && hasDefaultAddress ? (
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50 flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{firstName} {lastName}</p>
                  <p className="text-gray-700 mt-1">{formattedSavedAddress}</p>
                  <p className="text-gray-600 mt-1">{phone}</p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingAddress(true)}
                  className="shrink-0 bg-white"
                >
                  Edit address
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <select className="w-full h-12 border border-gray-300 rounded-md px-3 text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none">
                  <option>Philippines</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="First name" required value={firstName} onChange={e => setFirstName(e.target.value)} className="h-12 border-gray-300 rounded-md" />
                  <Input placeholder="Last name" required value={lastName} onChange={e => setLastName(e.target.value)} className="h-12 border-gray-300 rounded-md" />
                </div>
                <Input placeholder="Address" required value={address} onChange={e => setAddress(e.target.value)} className="h-12 border-gray-300 rounded-md" />
                <Input placeholder="Apartment, suite, etc. (optional)" value={apartment} onChange={e => setApartment(e.target.value)} className="h-12 border-gray-300 rounded-md" />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Postal code" required value={postalCode} onChange={e => setPostalCode(e.target.value)} className="h-12 border-gray-300 rounded-md" />
                  <Input placeholder="City" required value={city} onChange={e => setCity(e.target.value)} className="h-12 border-gray-300 rounded-md" />
                </div>
                <select className="w-full h-12 border border-gray-300 rounded-md px-3 text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none">
                  <option>Metro Manila</option>
                  <option>Cebu</option>
                  <option>Davao</option>
                </select>
                <Input placeholder="Phone" type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="h-12 border-gray-300 rounded-md" />
                
                {hasDefaultAddress && (
                  <div className="pt-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setIsEditingAddress(false)}
                      className="text-blue-600 p-0 h-auto hover:bg-transparent hover:underline"
                    >
                      Cancel and use saved address
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Payment */}
          <section className="space-y-4">
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-bold text-gray-900">Payment</h2>
            </div>
            <p className="text-sm text-gray-500 pb-2">All transactions are secure and encrypted.</p>
            
            <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
              <label className={`flex items-center p-4 border-b border-gray-200 cursor-pointer ${paymentMethod === 'paymongo' ? 'bg-blue-50/30' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="paymongo" 
                  checked={paymentMethod === 'paymongo'}
                  onChange={() => setPaymentMethod('paymongo')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 font-medium text-gray-900">Secure Payments via PayMongo</span>
                <div className="ml-auto flex gap-1">
                  <div className="w-8 h-5 bg-blue-100 rounded text-[10px] flex items-center justify-center font-bold text-blue-800">VISA</div>
                  <div className="w-8 h-5 bg-blue-100 rounded text-[10px] flex items-center justify-center font-bold text-blue-800">MC</div>
                </div>
              </label>
              
              {paymentMethod === 'paymongo' && (
                <div className="p-6 bg-gray-50 flex flex-col items-center justify-center text-center border-b border-gray-200">
                  <ShieldCheck className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    You'll be redirected to Secure Payments via PayMongo to complete your purchase securely.
                  </p>
                </div>
              )}

              <label className={`flex items-center p-4 cursor-pointer ${paymentMethod === 'cod' ? 'bg-blue-50/30' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 font-medium text-gray-900">Cash on Delivery (COD)</span>
              </label>
            </div>
          </section>

          {/* Add Tip */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Add tip</h2>
            <div className="border border-gray-300 rounded-md p-4 bg-white space-y-4">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">Show your support for the team at PrimeCuts</p>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "3%", value: 3, calc: subtotal * 0.03 },
                  { label: "5%", value: 5, calc: subtotal * 0.05 },
                  { label: "10%", value: 10, calc: subtotal * 0.10 },
                ].map((tip) => (
                  <button
                    key={tip.value}
                    type="button"
                    onClick={() => {
                      setTipPercentage(tip.value);
                      setCustomTip("");
                    }}
                    className={`flex flex-col items-center justify-center py-2 border rounded-md transition-colors ${
                      tipPercentage === tip.value 
                        ? "border-blue-600 bg-blue-50 text-blue-800" 
                        : "border-gray-300 hover:border-gray-400 text-gray-700"
                    }`}
                  >
                    <span className="font-semibold">{tip.label}</span>
                    <span className="text-xs text-gray-500">₱{tip.calc.toFixed(0)}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setTipPercentage(null);
                    setCustomTip("");
                  }}
                  className={`flex flex-col items-center justify-center py-2 border rounded-md transition-colors ${
                    tipPercentage === null && customTip === ""
                      ? "border-blue-600 bg-blue-50 text-blue-800" 
                      : "border-gray-300 hover:border-gray-400 text-gray-700"
                  }`}
                >
                  <span className="font-semibold">None</span>
                </button>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                  <Input 
                    placeholder="Custom tip" 
                    type="number" 
                    className="h-12 pl-8 border-gray-300 rounded-md"
                    value={customTip}
                    onChange={(e) => {
                      setCustomTip(e.target.value);
                      setTipPercentage(null);
                    }}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 pt-2">Thank you, we appreciate it.</p>
            </div>
          </section>

          {/* Submit */}
          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isProcessing || items.length === 0}
              className="w-full h-14 text-lg font-bold bg-[#001a41] hover:bg-[#002a66] text-white"
            >
              {isProcessing ? "Processing..." : "Pay now"}
            </Button>
          </div>

          <div className="flex justify-center md:justify-start gap-4 text-xs text-gray-500 pb-12 md:pb-0">
            <Link href="#" className="hover:underline">Refund policy</Link>
            <Link href="#" className="hover:underline">Shipping</Link>
            <Link href="#" className="hover:underline">Privacy policy</Link>
            <Link href="#" className="hover:underline">Terms of service</Link>
          </div>
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="w-full md:w-2/5 lg:w-[45%] bg-[#001a41] px-4 py-8 md:px-12 md:py-12 flex justify-center md:justify-start">
        <div className="w-full max-w-md space-y-6">
          
          <div className="space-y-4 max-h-[40vh] md:max-h-none overflow-y-auto pr-2 custom-scrollbar">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 border border-white/20">
                  <Image 
                    src={item.product.imageUrl} 
                    alt={item.product.name} 
                    fill 
                    className="object-cover"
                  />
                  <span className="absolute -top-2 -right-2 bg-gray-500/80 backdrop-blur-sm text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center z-10 border border-white/20">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="text-sm font-semibold text-white leading-tight mb-1">{item.product.name}</h4>
                  <p className="text-xs text-blue-200/70 truncate">{item.product.category} • Premium Cut</p>
                </div>
                <div className="text-sm font-medium text-white">
                  {formatPrice(item.product.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-white/10 flex gap-3">
            <Input 
              placeholder="Discount code or gift card" 
              className="h-12 bg-white text-gray-900 border-none focus-visible:ring-1 focus-visible:ring-blue-500"
            />
            <Button type="button" className="h-12 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20">
              Apply
            </Button>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-3">
            <div className="flex justify-between text-sm text-blue-100">
              <span>Subtotal • {items.length} items</span>
              <span className="font-medium text-white">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-blue-100 items-center">
              <span className="flex items-center gap-1">Shipping <Info className="w-3 h-3 text-blue-200/50" /></span>
              <span className="text-blue-200 text-xs">Calculated at next step</span>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between text-sm text-blue-100 items-center">
                <span>Tip</span>
                <span className="font-medium text-white">{formatPrice(tipAmount)}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-lg font-bold text-white">Total</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-blue-200 font-medium">PHP</span>
              <span className="text-2xl font-black text-white">{formatPrice(finalTotal)}</span>
            </div>
          </div>
          
        </div>
      </div>
    </form>
  );
}
