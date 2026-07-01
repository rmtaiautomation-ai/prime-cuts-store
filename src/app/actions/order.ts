"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function createSecureOrder(orderData: {
  items: { productId: string; quantity: number }[];
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  tipAmount: number;
}) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // 1. Get current user (if any)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 2. Fetch products securely from DB to verify prices
    const productIds = orderData.items.map((i) => i.productId);
    const { data: dbProducts, error: productsError } = await supabase
      .from("products")
      .select("id, name, price")
      .in("id", productIds);

    if (productsError || !dbProducts) {
      throw new Error("Failed to fetch products for price verification.");
    }

    // 3. Calculate total securely
    let subtotal = 0;
    const orderItemsToInsert = [];

    for (const item of orderData.items) {
      const dbProduct = dbProducts.find((p) => p.id === item.productId);
      if (!dbProduct) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const itemTotal = Number(dbProduct.price) * item.quantity;
      subtotal += itemTotal;

      orderItemsToInsert.push({
        product_id: dbProduct.id,
        quantity: item.quantity,
        price_at_purchase: dbProduct.price,
      });
    }

    const finalTotal = subtotal + orderData.tipAmount; // Add shipping fee here if applicable

    // 4. Create the Order securely
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        total_amount: finalTotal,
        status: "Pending",
        customer_email: orderData.customerEmail,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        shipping_address: orderData.shippingAddress,
        user_id: user?.id || null,
      })
      .select("id")
      .single();

    if (orderError || !newOrder) {
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order.");
    }

    // 5. Create Order Items
    const itemsWithOrderId = orderItemsToInsert.map((item) => ({
      ...item,
      order_id: newOrder.id,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsWithOrderId);

    if (itemsError) {
      console.error("Order items error:", itemsError);
      throw new Error("Failed to add items to order.");
    }

    // 6. Send Email Notifications via Resend (Async)
    if (process.env.RESEND_API_KEY) {
      try {
        // Send to Customer
        await resend.emails.send({
          from: "PrimeCuts PH <onboarding@resend.dev>", // Replace with verified domain
          to: orderData.customerEmail,
          subject: `Order Confirmation - PrimeCuts PH #${newOrder.id.substring(0, 8)}`,
          html: `
            <h1>Thank you for your order, ${orderData.customerName}!</h1>
            <p>Your order has been successfully placed and is now <strong>Pending</strong>.</p>
            <p><strong>Total Amount:</strong> ₱${finalTotal.toLocaleString()}</p>
            <p><strong>Shipping Address:</strong> ${orderData.shippingAddress}</p>
            <p>We will notify you once it's out for delivery.</p>
          `,
        });

        // Send to Admin
        await resend.emails.send({
          from: "PrimeCuts System <onboarding@resend.dev>", // Replace with verified domain
          to: "admin@primecuts.ph", // Replace with actual admin email or use the onboarding address to test
          subject: `New Order Received - ₱${finalTotal.toLocaleString()}`,
          html: `
            <h1>New Order Alert</h1>
            <p><strong>Customer:</strong> ${orderData.customerName} (${orderData.customerEmail})</p>
            <p><strong>Total Amount:</strong> ₱${finalTotal.toLocaleString()}</p>
            <p>Log in to the Admin Panel to view details.</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // We don't throw here because the order was already successful
      }
    }

    return { success: true, orderId: newOrder.id };
  } catch (error: any) {
    console.error("Secure Checkout Error:", error);
    return { success: false, error: error.message };
  }
}
