"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadProductImage } from "@/lib/supabase/storage";
import { createProduct, updateProduct } from "@/app/actions/inventory";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2 } from "lucide-react";

type ProductFormProps = {
  initialData?: any;
};

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      let imageUrl = initialData?.image_url || null;

      // Upload image if a new one is selected
      if (imageFile) {
        const uploadedUrl = await uploadProductImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          throw new Error("Failed to upload image");
        }
      }

      if (!initialData && !imageUrl) {
        throw new Error("An image is required for new products");
      }

      if (initialData) {
        await updateProduct(initialData.id, formData, imageUrl);
        toast.success("Product updated successfully");
      } else {
        await createProduct(formData, imageUrl as string);
        toast.success("Product created successfully");
      }

      router.push("/admin/inventory");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-md shadow-sm border border-border">
      <div className="space-y-4">
        <div>
          <Label htmlFor="image">Product Image</Label>
          <div className="mt-2 flex items-center gap-6">
            <div className="h-32 w-32 relative rounded-md overflow-hidden bg-muted border border-border flex-shrink-0 flex items-center justify-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
              ) : (
                <span className="text-muted-foreground text-sm">No Image</span>
              )}
            </div>
            <div className="flex-1">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Recommended size: 800x800px. Max size: 2MB.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" name="name" required defaultValue={initialData?.name} placeholder="e.g. A5 Wagyu Ribeye" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select 
              id="category" 
              name="category" 
              required 
              defaultValue={initialData?.category || "Beef"}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Beef">Beef</option>
              <option value="Pork">Pork</option>
              <option value="Seafood">Seafood</option>
              <option value="Specials">Specials</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (₱) per kg/item</Label>
            <Input id="price" name="price" type="number" step="0.01" required defaultValue={initialData?.price} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stockQuantity">Initial Stock Quantity</Label>
            <Input id="stockQuantity" name="stockQuantity" type="number" required defaultValue={initialData?.stock_quantity ?? 0} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            name="description" 
            rows={4} 
            defaultValue={initialData?.description} 
            placeholder="Describe the cut, origin, and best cooking methods..." 
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            initialData ? "Update Product" : "Save Product"
          )}
        </Button>
      </div>
    </form>
  );
}
