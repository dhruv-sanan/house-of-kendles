"use client"

import Link from "next/link"
import * as React from "react"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const homeDecorItems = [
  {
    title: "All Home Decor",
    href: "/home-decor",
    description: "Explore our full collection of artisanal pieces.",
  },
  {
    title: "The Urli Collection",
    href: "/home-decor#urli",
    description: "Traditional vessels reimagined for modern homes.",
  },
  {
    title: "Candle Holders",
    href: "/home-decor#candle-holders",
    description: "Elegant stands for your favorite pillars and votives.",
  },
  {
    title: "Trays & Platters",
    href: "/home-decor#trays",
    description: "Serve in style with our handcrafted trays.",
  },
]

const candleItems = [
    {
      title: "Shop All Candles",
      href: "/candles",
      description: "Hand-poured soy wax candles for every mood.",
    },
    {
      title: "The Coffee Bar",
      href: "/candles#coffee-bar",
      description: "Rich, aromatic coffee-inspired blends.",
    },
    {
      title: "Moods & Quotes", // Updated
      href: "/candles#mood-quotes",
      description: "Fun, relatable scents that speak your mind.",
    },
    {
      title: "Floral Sculptures", // Updated
      href: "/candles#floral",
      description: "Intricate botanical designs and bouquets.",
    },
  ]
  

export function MainNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Candles</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-4">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-brand/50 to-brand p-6 no-underline outline-none focus:shadow-md"
                    href="/candles"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium text-white">
                      The Candle Collection
                    </div>
                    <p className="text-sm leading-tight text-white/90">
                      Discover scents that transform your space.
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              {candleItems.map((item) => (
                <ListItem key={item.title} title={item.title} href={item.href}>
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Home Decor</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {homeDecorItems.map((item) => (
                <ListItem key={item.title} title={item.title} href={item.href}>
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/bath-salt" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Bath Salt
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/gifting" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Gifting
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/our-story" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Our Story
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        
         <NavigationMenuItem>
          <Link href="/quiz" legacyBehavior passHref>
            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "text-gold font-semibold")}>
              Find Your Scent
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"