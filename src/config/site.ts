import type { SiteConfig } from "./types";

const local = (path: string) =>
  `${import.meta.env.BASE_URL}assets/images/${path}.webp`;

// Generate frame URLs - using every 3rd frame for optimized burger opening animation
const generateFrameUrls = () => {
  const frames: string[] = [];
  for (let i = 1; i <= 150; i += 2) {
    const frameNum = String(i).padStart(4, "0");
    frames.push(
      `${import.meta.env.BASE_URL}assets/frames/frame_${frameNum}.webp`,
    );
  }
  return frames;
};

export const CONFIG: SiteConfig = {
  brand: {
    name: "3 GUYS CAFE",
    headline: "FULLY LOADED",
    headlineAccent: "OBSESSED",
    heroAltHeadline: "TARAMRI & ALI PUR'S FAVORITE SPOT",
    tagline: "Deep dish pizza, burgers, loaded fries, wraps.",
    subTagline:
      "A loud, high-contrast storefront for crave-heavy orders, fast bag building, and WhatsApp checkout.",
    locationLine: "Taramri Chowk + Ali Pur, Islamabad",
    whatsappNumber: "923107777821",
    whatsappDisplay: "0310 7777 821",
    socialLinks: [
      {
        id: "instagram",
        label: "Instagram",
        url: "https://instagram.com/3guyscafe",
      },
      {
        id: "facebook",
        label: "Facebook",
        url: "https://facebook.com/3guyscafe",
      },
      { id: "tiktok", label: "TikTok" },
    ],
  },
  story: {
    eyebrow: "The Fully Loaded Obsession",
    title: "Built To Hit Hard",
    body: "Big type, hot color, stacked cravings. The experience is tuned for quick scanning, dramatic food imagery, and a checkout flow that feels made for mobile thumbs.",
    quote:
      "Deep dish, burgers, loaded fries, wraps. Everything else should get out of the way.",
    stats: [
      { label: "Zones Covered", value: "02" },
      { label: "Core Categories", value: "04" },
      { label: "Checkout Flow", value: "WA" },
    ],
  },
  ordering: {
    quickOrderLabel: "Quick Order",
    bagTitle: "THE BAG",
    checkoutTitle: "Finish On WhatsApp",
    addressPrompt: "House, street, area, and any landmark.",
    notePrompt:
      "Optional notes: spice level, sauces, cutlery, or pickup preference.",
  },
  frames: {
    urls: generateFrameUrls(),
  },
  locations: [
    {
      id: "taramri",
      name: "Taramri Chowk",
      shortAddress: "Seri Chowk Simly Dam Road, Bhara Kahu",
      fullAddress:
        "3 Guys Cafe, Seri Chowk Simly Dam Road Bhara, Kaho, Phulgran, Bhara kahu, 44000",
      phoneDisplay: "0310 7777 821",
      hours: "Daily 12 PM - 12 AM",
      mapsUrl:
        "https://www.google.com/maps/dir//3+Guys+Cafe,+Seri+Chowk+Simly+Dam+Road+Bhara,+Kaho,+Phulgran,+Bhara+kahu,+44000/data=!4m6!4m5!1m1!4e2!1m2!1m1!1s0x38dfc3002dba7279:0x43140c4e3e759c2c?sa=X&ved=1t:57443&ictx=111",
    },
    {
      id: "alipur",
      name: "Ali Pur",
      shortAddress: "J5VC+W6C Ali Pur",
      fullAddress: "J5VC+W6C 3 Guys Pizza, Ali Pur",
      phoneDisplay: "0310 7777 821",
      hours: "Daily 12 PM - 12 AM",
      mapsUrl:
        "https://www.google.com/maps/dir//J5VC%2BW6C+3+Guys+Pizza,+Ali+Pur/data=!4m6!4m5!1m1!4e2!1m2!1m1!1s0x38dfeb005567e2f1:0x1967c4778bb56b2f?sa=X&ved=1t:57443&ictx=111",
    },
  ],
  menu: [
    {
      id: "pizza",
      category: "Pizza",
      emoji: "🍕",
      blurb: "Fire-blistered crusts, extra cheese, and heavy toppings.",
      items: [
        {
          id: "pizza-deep-dish-dynamo",
          name: "Deep-Dish Dynamo",
          desc: "Double-layered crust with extra sauce and a full mozzarella crown.",
          price: 2450,
          tag: "Signature",
          image: local("pizza-deep-dish"),
        },
        {
          id: "pizza-vesuvio-spice",
          name: "Vesuvio Spice",
          desc: "Spicy pepperoni, jalapenos, and chili oil over a blistered base.",
          price: 1850,
          tag: "Spicy",
          image: local("pizza-vesuvio"),
        },
        {
          id: "pizza-cheese-obsession",
          name: "Cheese Obsession",
          desc: "A rich four-cheese build for the all-cheese crowd.",
          price: 1650,
          image: local("pizza-cheese"),
        },
      ],
    },
    {
      id: "burgers",
      category: "Burgers",
      emoji: "🍔",
      blurb: "Smashed, sauced, and built for one-hand damage.",
      items: [
        {
          id: "burger-big-guy",
          name: "The Big Guy",
          desc: "Double beef patties, grilled onions, cheese, and house sauce.",
          price: 950,
          tag: "Bestseller",
          image: local("burger-big-guy"),
        },
        {
          id: "burger-chicken-heavyweight",
          name: "Chicken Heavyweight",
          desc: "Crispy chicken, slaw, and honey mustard on a soft bun.",
          price: 850,
          image: local("burger-chicken"),
        },
        {
          id: "burger-taramri-fire",
          name: "Taramri Fire",
          desc: "Beef, jalapeno heat, pepper jack, and extra attitude.",
          price: 880,
          tag: "Hot",
          image: local("burger-taramri"),
        },
      ],
    },
    {
      id: "fries",
      category: "Fries",
      emoji: "🍟",
      blurb: "Messy in the best possible way.",
      items: [
        {
          id: "fries-fully-loaded",
          name: "Fully Loaded Fries",
          desc: "Cheese, crispy bits, sauce drizzle, and signature seasoning.",
          price: 550,
          tag: "Obsession",
          image: local("fries-loaded"),
        },
        {
          id: "fries-animal",
          name: "Animal Fries",
          desc: "Beef bits, onions, and sauce over golden-cut fries.",
          price: 650,
          image: local("fries-animal"),
        },
      ],
    },
    {
      id: "wraps",
      category: "Wraps",
      emoji: "🌯",
      blurb: "Fast, hot, and easy to fire into the bag.",
      items: [
        {
          id: "wrap-beast",
          name: "The Beast Wrap",
          desc: "Grilled chicken, garlic aioli, fries, and crisp vegetables.",
          price: 750,
          image: local("wrap-beast"),
        },
      ],
    },
  ],
  deals: [
    {
      id: "deal-squad",
      name: "The Squad Deal",
      desc: "1 large pizza, 2 burgers, and 2 drinks.",
      price: 3200,
      saving: 850,
      tag: "Most Popular",
    },
    {
      id: "deal-feast",
      name: "Deep Dish Feast",
      desc: "2 pizzas, 1 loaded fries, and a 1.5L drink.",
      price: 4500,
      saving: 1200,
      tag: "Groups",
    },
    {
      id: "deal-solo",
      name: "Solo Smash",
      desc: "1 burger, loaded fries, and 1 drink.",
      price: 1400,
      saving: 350,
      tag: "Best Value",
    },
  ],
  popups: [
    {
      id: "popup-welcome",
      enabled: true,
      delayMs: 15000, // 15 seconds
      title: "🔥 Fully Loaded Deals",
      message:
        "Check out our amazing deals and save big on your favorite items!",
      showTopDeal: true,
      actionButtonText: "View All Deals",
      dismissButtonText: "Maybe Later",
    },
    {
      id: "popup-return",
      enabled: false,
      delayMs: 45000, // 45 seconds (30 second gap from first popup)
      title: "💰 Back For More?",
      message: "Don't miss out on our exclusive limited-time offers!",
      showTopDeal: true,
      actionButtonText: "See Deals Now",
      dismissButtonText: "Dismiss",
    },
  ],
  tooltips: [
    {
      id: "tooltip-top-savings",
      enabled: true,
      text: "💰 Save up to 1200 PKR on our deals!",
      dealId: "deal-feast",
      backgroundColor: "bg-accent",
      textColor: "text-white",
    },
    {
      id: "tooltip-limited",
      enabled: true,
      text: "⏰ Limited Time Offers - Order Now!",
      backgroundColor: "bg-amber-500",
      textColor: "text-white",
    },
  ],
  seo: {
    title: "3 Guys Cafe Islamabad | Fully Loaded Obsession",
    description:
      "Premium fast-food storefront concept for 3 Guys Cafe with deep dish pizza, burgers, loaded fries, wraps, and WhatsApp ordering.",
    canonicalUrl: "https://3guyscafe.pk",
  },
};
