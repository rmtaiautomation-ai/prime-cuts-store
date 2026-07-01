"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function sanitizeHtml(str: string) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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

    // 1.5 Anti-Spam / Rate Limiting Check
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recentOrders } = await supabase
      .from("orders")
      .select("id")
      .eq("customer_email", orderData.customerEmail)
      .gte("created_at", oneMinuteAgo);

    if (recentOrders && recentOrders.length > 0) {
      throw new Error("Too many requests. Please wait 60 seconds before placing another order.");
    }

    // 2. Fetch products securely from DB to verify prices
    const productIds = orderData.items.map((i) => i.productId);
    const { data: dbProducts, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity")
      .in("id", productIds);

    if (productsError || !dbProducts) {
      throw new Error("Failed to fetch products for price verification.");
    }

    // 3. Calculate total securely & check stock
    let subtotal = 0;
    const orderItemsToInsert = [];
    const productsToUpdate = [];

    for (const item of orderData.items) {
      const dbProduct = dbProducts.find((p) => p.id === item.productId);
      if (!dbProduct) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        throw new Error(`Invalid quantity for ${dbProduct.name}.`);
      }

      if (orderData.tipAmount < 0) {
        throw new Error("Tip amount cannot be negative.");
      }

      if (dbProduct.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${dbProduct.name}. Only ${dbProduct.stock_quantity} left in stock.`);
      }

      const itemTotal = Number(dbProduct.price) * item.quantity;
      subtotal += itemTotal;

      orderItemsToInsert.push({
        product_id: dbProduct.id,
        quantity: item.quantity,
        price_at_purchase: dbProduct.price,
      });

      productsToUpdate.push({
        id: dbProduct.id,
        name: dbProduct.name,
        new_stock: dbProduct.stock_quantity - item.quantity,
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

    // 6. Deduct Stock Quantities
    for (const update of productsToUpdate) {
      const { error: stockError } = await supabase
        .from("products")
        .update({ stock_quantity: update.new_stock })
        .eq("id", update.id);
        
      if (stockError) {
        console.error(`Failed to deduct stock for product ${update.id}:`, stockError);
        // We log it but don't fail the whole order if one stock update fails post-purchase
      }
    }

    // 7. Send Email Notifications via Resend (Async)
    if (process.env.RESEND_API_KEY) {
      try {
        const safeName = sanitizeHtml(orderData.customerName);
        const safeEmail = sanitizeHtml(orderData.customerEmail);
        const safeAddress = sanitizeHtml(orderData.shippingAddress);
        const brandedOrderId = `ORD-${newOrder.id.substring(0, 8).toUpperCase()}`;

        // Send to Customer
        await resend.emails.send({
          from: "PrimeCuts PH <onboarding@resend.dev>", // Replace with verified domain
          to: orderData.customerEmail,
          subject: `Order Confirmation - PrimeCuts PH ${brandedOrderId}`,
          html: `
            <h1>Thank you for your order, ${safeName}!</h1>
            <p>Your order has been successfully placed and is now <strong>Pending</strong>.</p>
            <p><strong>Total Amount:</strong> ₱${finalTotal.toLocaleString()}</p>
            <p><strong>Shipping Address:</strong> ${safeAddress}</p>
            <p>We will notify you once it's out for delivery.</p>
          `,
        });

        // Send to Admin
        await resend.emails.send({
          from: "PrimeCuts System <onboarding@resend.dev>", // Replace with verified domain
          to: "admin@primecuts.ph", // Replace with actual admin email or use the onboarding address to test
          subject: `New Order Received - ${brandedOrderId} (₱${finalTotal.toLocaleString()})`,
          html: `
            <h1>New Order Alert</h1>
            <p><strong>Customer:</strong> ${safeName} (${safeEmail})</p>
            <p><strong>Total Amount:</strong> ₱${finalTotal.toLocaleString()}</p>
            <p>Log in to the Admin Panel to view details.</p>
          `,
        });

        // Low Stock Alerts
        for (const update of productsToUpdate) {
          if (update.new_stock < 5) {
            await resend.emails.send({
              from: "PrimeCuts System <onboarding@resend.dev>",
              to: "admin@primecuts.ph",
              subject: `Low Stock Alert - ${update.name}`,
              html: `
                <h1 style="color: red;">Low Stock Warning</h1>
                <p><strong>Product:</strong> ${update.name}</p>
                <p><strong>Remaining Stock:</strong> ${update.new_stock}</p>
                <p>Please restock this item soon in the Admin Inventory tab!</p>
              `,
            });
          }
        }
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
