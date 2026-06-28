export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Beef" | "Pork" | "Seafood" | "Specials";
  imageUrl: string;
  isFeatured: boolean;
  stockQuantity: number;
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    name: "A5 Japanese Wagyu Ribeye",
    description: "The pinnacle of beef. Intensely marbled, melt-in-your-mouth texture with a rich, buttery flavor profile. Certificate of authenticity included.",
    price: 18500,
    category: "Beef",
    imageUrl: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&q=80&w=800",
    isFeatured: true,
    stockQuantity: 12,
  },
  {
    id: "prod_2",
    name: "USDA Prime Tomahawk Steak",
    description: "A show-stopping 40oz bone-in ribeye. Exceptional marbling and tenderness, perfect for a premium reverse-sear experience.",
    price: 4200,
    category: "Beef",
    imageUrl: "https://images.unsplash.com/photo-1594046243098-0fce2af7075c?auto=format&fit=crop&q=80&w=800",
    isFeatured: true,
    stockQuantity: 8,
  },
  {
    id: "prod_3",
    name: "Kurobuta Pork Belly",
    description: "The 'Wagyu of Pork'. Pasture-raised Berkshire pork featuring extraordinary sweetness, deep color, and luxurious fat.",
    price: 1800,
    category: "Pork",
    imageUrl: "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?auto=format&fit=crop&q=80&w=800",
    isFeatured: true,
    stockQuantity: 24,
  },
  {
    id: "prod_4",
    name: "Hokkaido Scallops (Sashimi Grade)",
    description: "Jumbo, sweet, and incredibly tender sea scallops harvested from the cold, pristine waters of Hokkaido.",
    price: 3500,
    category: "Seafood",
    imageUrl: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80&w=800",
    isFeatured: false,
    stockQuantity: 15,
  },
  {
    id: "prod_5",
    name: "Dry-Aged Angus Porterhouse",
    description: "45-day dry-aged porterhouse delivering intense, nutty flavors. The ultimate combination of NY Strip and Filet Mignon.",
    price: 5800,
    category: "Beef",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
    isFeatured: true,
    stockQuantity: 5,
  },
  {
    id: "prod_6",
    name: "Ora King Salmon Fillet",
    description: "Sustainably raised in New Zealand. Known for its brilliant orange flesh, striking marble lines, and rich, elegant taste.",
    price: 2800,
    category: "Seafood",
    imageUrl: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800",
    isFeatured: false,
    stockQuantity: 20,
  }
];
