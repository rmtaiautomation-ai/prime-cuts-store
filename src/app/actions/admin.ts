"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

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

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const supabase = await getAdminSupabase();

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) throw error;

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
      supabase.from("orders").select("total_amount"),
      supabase.from("profiles").select("*", { count: "exact", head: true })
    ]);

    if (productsError) throw productsError;
    if (ordersError) throw ordersError;
    if (profilesError) throw profilesError;

    const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

    return {
      success: true,
      stats: {
        products: productsCount || 0,
        orders: orders.length || 0,
        customers: profilesCount || 0,
        revenue
      }
    };
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminOrders() {
  try {
    const supabase = await getAdminSupabase();

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, profiles(full_name, phone, shipping_address)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, orders };
  } catch (error: any) {
    console.error("Error fetching admin orders:", error);
    return { success: false, error: error.message };
  }
}
