"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

const slides = [
  {
    id: 1,
    title: "Fresh Meat",
    description: "All your essential cuts of local beef, pork, chicken, and goat, freshly-cut and carefully delivered. These meats are fresh, not frozen, so it's fresher than your regular meat shop.",
    imageUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: 2,
    title: "Freshness You Can Taste",
    description: "Fresh seafood, handpicked daily. We source directly from the palengke to ensure maximum quality and flavor.",
    imageUrl: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=2000",
  },
  {
    id: 3,
    title: "Premium Artisanal Sausages",
    description: "Crafted by experts using traditional methods. No artificial preservatives, just 100% real meat and spices.",
    imageUrl: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=2000",
  }
];

export function HeroCarousel() {
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full relative"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            <div className="relative w-full h-[300px] md:h-[500px]">
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                className="object-cover"
                priority={slide.id === 1}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center px-4 max-w-3xl space-y-4">
                  <h2 className="text-3xl md:text-5xl font-bold text-white">
                    {slide.title}
                  </h2>
                  <p className="text-white/90 text-sm md:text-lg text-balance">
                    {slide.description}
                  </p>
                  <Button size="lg" className="mt-4 bg-primary text-white hover:bg-primary/90 font-bold border-none">
                    Shop Now
                  </Button>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white text-black border-none" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white text-black border-none" />
    </Carousel>
  );
}
