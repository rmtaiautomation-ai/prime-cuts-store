"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";
import { updateOrderStatus } from "@/app/actions/admin";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

import { useRouter } from "next/navigation";

export function OrdersClient({ 
  initialOrders, 
  totalCount, 
  currentPage, 
  limit 
}: { 
  initialOrders: any[]; 
  totalCount: number; 
  currentPage: number; 
  limit: number; 
}) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  
  // Sync orders if initialOrders change (on page navigation)
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (currentPage - 1) * limit;

  const handlePageChange = (page: number) => {
    router.push(`/admin/orders?page=${page}`);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);

      if (!result.success) throw new Error(result.error);

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status. Check permissions.");
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'bg-amber-500/10 text-amber-500';
      case 'preparing': return 'bg-blue-500/10 text-blue-500';
      case 'out for delivery': return 'bg-purple-500/10 text-purple-500';
      case 'delivered': return 'bg-emerald-500/10 text-emerald-500';
      case 'cancelled': return 'bg-red-500/10 text-red-500';
      case 'refunded': return 'bg-rose-500/10 text-rose-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden pb-32">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">ORD-{order.id.split('-')[0].toUpperCase()}</TableCell>
              <TableCell>
                <div className="font-medium">{order.profiles?.full_name || order.customer_name || 'Guest'}</div>
                <div className="text-xs text-muted-foreground">{order.profiles?.shipping_address || order.shipping_address || 'No Address'}</div>
              </TableCell>
              <TableCell className="align-top pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs">View Items</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-[#001a41]">Order Items</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-3">
                      {order.order_items && order.order_items.length > 0 ? (
                        order.order_items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100">
                            <div>
                              <div className="font-semibold text-gray-900">{item.products?.name || 'Unknown Item'}</div>
                              <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                            </div>
                            <div className="font-bold text-[#001a41]">
                              ₱{Number(item.price_at_purchase).toLocaleString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No items found for this order.</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
              <TableCell className="font-bold align-top pt-4">₱{Number(order.total_amount).toLocaleString()}</TableCell>
              <TableCell className="text-muted-foreground text-sm align-top pt-4">
                {new Date(order.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
              </TableCell>
              <TableCell className="align-top pt-4">
                <Badge variant="outline" className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Select 
                  defaultValue={order.status} 
                  onValueChange={(val) => handleStatusChange(order.id, val)}
                  disabled={order.status === 'Cancelled' || order.status === 'Refunded'}
                >
                  <SelectTrigger className="w-[160px] h-8 ml-auto">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Preparing">Preparing</SelectItem>
                    <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No orders found yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t border-border gap-4 bg-gray-50/50">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{totalCount === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + limit, totalCount)}</span> of <span className="font-medium">{totalCount}</span> orders
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1 || totalCount === 0}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1 hidden sm:flex">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-1 text-muted-foreground text-xs">...</span>;
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalCount === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
