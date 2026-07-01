"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

function sanitizeHtml(str: string) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function getAdminSupabase() {
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) throw new Error("Unauthorized: Admins only");

  return supabase;
}

export async function addProduct(productData: {
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
  imageUrl: string;
}) {
  try {
    if (productData.price < 0) throw new Error("Price cannot be negative.");
    if (productData.stock_quantity < 0 || !Number.isInteger(productData.stock_quantity)) {
      throw new Error("Invalid stock quantity.");
    }

    const supabase = await getAdminSupabase();

    const { error } = await supabase
      .from("products")
      .insert([{
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stock_quantity: productData.stock_quantity,
        category: productData.category,
        imageUrl: productData.imageUrl,
        is_active: true
      }]);

    if (error) throw error;

    revalidatePath("/admin/inventory");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error adding product:", error);
    return { success: false, error: error.message };
  }
}

export async function editProduct(productId: string, productData: {
  name: string;
  description: string;
  price: number;
  category: string;
  is_active: boolean;
}) {
  try {
    if (productData.price < 0) throw new Error("Price cannot be negative.");

    const supabase = await getAdminSupabase();

    const { error } = await supabase
      .from("products")
      .update({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        is_active: productData.is_active,
      })
      .eq("id", productId);

    if (error) throw error;

    revalidatePath("/admin/inventory");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error editing product:", error);
    return { success: false, error: error.message };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const supabase = await getAdminSupabase();

    // Fetch the current status first
    const { data: currentOrder, error: fetchError } = await supabase
      .from("orders")
      .select("status, customer_email, customer_name, id")
      .eq("id", orderId)
      .single();

    if (fetchError) throw fetchError;

    // If changing to Cancelled or Refunded from a different state
    if (
      (status === "Cancelled" || status === "Refunded") &&
      currentOrder.status !== "Cancelled" &&
      currentOrder.status !== "Refunded"
    ) {
      // Fetch order items to restock
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;

      // Restock loop
      for (const item of orderItems) {
        if (!item.product_id) continue;
        const { data: product, error: prodErr } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", item.product_id)
          .single();
          
        if (product && !prodErr) {
          await supabase
            .from("products")
            .update({ stock_quantity: product.stock_quantity + item.quantity })
            .eq("id", item.product_id);
        }
      }
    }

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) throw error;

    // Send Status Update Email
    if (process.env.RESEND_API_KEY && currentOrder.customer_email) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const safeName = sanitizeHtml(currentOrder.customer_name);
        const brandedOrderId = `ORD-${currentOrder.id.substring(0, 8).toUpperCase()}`;

        if (status === "Out for Delivery" && currentOrder.status !== "Out for Delivery") {
          await resend.emails.send({
            from: "PrimeCuts PH <onboarding@resend.dev>",
            to: currentOrder.customer_email,
            subject: `Your order is on the way! - ${brandedOrderId}`,
            html: `<h1>Good news, ${safeName || 'Valued Customer'}!</h1><p>Your PrimeCuts order is now <strong>Out for Delivery</strong>.</p>`,
          });
        } else if (status === "Delivered" && currentOrder.status !== "Delivered") {
          await resend.emails.send({
            from: "PrimeCuts PH <onboarding@resend.dev>",
            to: currentOrder.customer_email,
            subject: `Your order has been delivered! - ${brandedOrderId}`,
            html: `<h1>Delivered!</h1><p>Hi ${safeName || 'Valued Customer'}, your PrimeCuts order has been successfully delivered. Enjoy your premium cuts!</p>`,
          });
        }
      } catch (emailErr) {
        console.error("Failed to send status update email:", emailErr);
      }
    }

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminCustomers() {
  try {
    const supabase = await getAdminSupabase();

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) throw profilesError;

    // Fetch all orders to aggregate spend/counts
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("user_id, total_amount");

    if (ordersError) throw ordersError;

    // Aggregate
    const customersWithStats = profiles.map(profile => {
      const userOrders = orders.filter(o => o.user_id === profile.id);
      const totalOrders = userOrders.length;
      const lifetimeSpend = userOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

      return {
        ...profile,
        totalOrders,
        lifetimeSpend
      };
    });

    return { success: true, customers: customersWithStats };
  } catch (error: any) {
    console.error("Error fetching admin customers:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminStats() {
  try {
    const supabase = await getAdminSupabase();

    const [
      { count: productsCount, error: productsError },
      { data: orders, error: ordersError },
      { count: profilesCount, error: profilesError }
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total_amount, created_at, status"),
      supabase.from("profiles").select("*", { count: "exact", head: true })
    ]);

    if (productsError) throw productsError;
    if (ordersError) throw ordersError;
    if (profilesError) throw profilesError;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;
    let thisMonthOrders = 0;
    let lastMonthOrders = 0;
    let revenue = 0;

    orders.forEach((order) => {
      // Skip cancelled/refunded for revenue calculations
      if (order.status !== "Cancelled" && order.status !== "Refunded") {
        const amount = Number(order.total_amount || 0);
        revenue += amount;

        const orderDate = new Date(order.created_at);
        const orderMonth = orderDate.getMonth();
        const orderYear = orderDate.getFullYear();

        if (orderYear === currentYear && orderMonth === currentMonth) {
          thisMonthRevenue += amount;
          thisMonthOrders++;
        } else if (
          (orderYear === currentYear && orderMonth === currentMonth - 1) ||
          (orderYear === currentYear - 1 && currentMonth === 0 && orderMonth === 11)
        ) {
          lastMonthRevenue += amount;
          lastMonthOrders++;
        }
      }
    });

    return {
      success: true,
      stats: {
        products: productsCount || 0,
        orders: orders.length || 0, // total orders including all statuses
        customers: profilesCount || 0,
        revenue,
        thisMonthRevenue,
        lastMonthRevenue,
        thisMonthOrders,
        lastMonthOrders,
      }
    };
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminOrders(page: number = 1, limit: number = 10) {
  try {
    const supabase = await getAdminSupabase();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: orders, error, count } = await supabase
      .from("orders")
      .select(`
        *, 
        profiles(full_name, phone, shipping_address),
        order_items(
          *,
          products(name, image_url)
        )
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return { success: true, orders, totalCount: count || 0 };
  } catch (error: any) {
    console.error("Error fetching admin orders:", error);
    return { success: false, error: error.message };
  }
}
