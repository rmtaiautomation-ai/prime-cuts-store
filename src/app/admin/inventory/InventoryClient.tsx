"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function InventoryClient({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);

  const handleEditClick = (product: any) => {
    setEditingId(product.id);
    setEditStock(product.stock_quantity);
  };

  const handleSaveStock = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: editStock })
        .eq('id', id);

      if (error) throw error;

      setProducts(products.map(p => p.id === id ? { ...p, stock_quantity: editStock } : p));
      setEditingId(null);
      toast.success("Stock updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update stock. Check if you have admin permissions.");
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price / kg</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Stock Quantity</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>₱{Number(product.price).toLocaleString()}</TableCell>
              <TableCell>
                {product.stock_quantity > 10 ? (
                  <Badge variant="outline" className="text-emerald-500 bg-emerald-500/10">In Stock</Badge>
                ) : product.stock_quantity > 0 ? (
                  <Badge variant="outline" className="text-amber-500 bg-amber-500/10">Low Stock</Badge>
                ) : (
                  <Badge variant="outline" className="text-destructive bg-destructive/10">Out of Stock</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingId === product.id ? (
                  <div className="flex justify-end items-center gap-2">
                    <Input 
                      type="number" 
                      value={editStock} 
                      onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                      className="w-20 h-8 text-right"
                    />
                  </div>
                ) : (
                  <span className="font-bold text-lg">{product.stock_quantity}</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingId === product.id ? (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => handleSaveStock(product.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => handleEditClick(product)}>Edit</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
