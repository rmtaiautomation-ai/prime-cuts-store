"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { addProduct } from "@/app/actions/admin";
import { toast } from "sonner";
import Image from "next/image";

const CATEGORIES = ["Beef", "Pork", "Poultry", "Seafood", "Lamb", "Others"];

export function AddProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    category: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select an image for the product.");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // 3. Save to database via Server Action
      const result = await addProduct({
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity),
        category: formData.category,
        imageUrl: publicUrl,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Product added successfully!");
      setIsOpen(false);
      
      // Reset form
      setFormData({ name: "", description: "", price: "", stock_quantity: "", category: "" });
      setFile(null);
      setPreview(null);
      
    } catch (error: any) {
      console.error("Add product error:", error);
      toast.error(error.message || "Failed to add product. Ensure you have admin access.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#001a41] hover:bg-[#002a66] text-white flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#001a41]">Add New Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          
          {/* Image Upload Area */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 relative group hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => document.getElementById('image-upload')?.click()}>
            <input 
              type="file" 
              id="image-upload" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
            
            {preview ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image src={preview} alt="Preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Change Image
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-white p-3 rounded-full inline-block shadow-sm mb-3">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700">Click to upload product image</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG or WEBP (max. 5MB)</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Product Name</label>
              <Input 
                required
                placeholder="e.g. Premium Ribeye Steak"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Price (₱)</label>
              <Input 
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Initial Stock</label>
              <Input 
                required
                type="number"
                min="0"
                placeholder="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Textarea 
                required
                placeholder="Describe the cut, origin, and best cooking methods..."
                className="h-24"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-400 text-[#001a41] font-bold">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                "Save Product"
              )}
            </Button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
}
