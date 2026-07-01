"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { AddProductModal } from "./AddProductModal";
import { EditProductModal } from "./EditProductModal";

export function InventoryClient({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#001a41]">Inventory</h2>
          <p className="text-muted-foreground">Manage your product catalog and stock levels.</p>
        </div>
        <AddProductModal />
      </div>
      
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
                {!product.is_active ? (
                  <Badge variant="outline" className="text-gray-500 bg-gray-500/10">Archived</Badge>
                ) : product.stock_quantity > 10 ? (
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
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditClick(product)}>Stock</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingProduct(product)}>Edit</Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      <EditProductModal 
        product={editingProduct} 
        isOpen={!!editingProduct} 
        onClose={() => setEditingProduct(null)} 
        onSuccess={() => {
          // A full page refresh is needed to see updated details if we don't update local state
          window.location.reload();
        }}
      />
    </div>
  );
}
