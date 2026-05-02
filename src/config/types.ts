export interface SocialLink {
  id: "instagram" | "facebook" | "tiktok";
  label: string;
  url?: string;
}

export interface LocationConfig {
  id: string;
  name: string;
  shortAddress: string;
  fullAddress: string;
  phoneDisplay: string;
  hours: string;
  mapsUrl: string;
}

export interface MenuItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  tag?: string;
  image: string;
}

export interface MenuCategory {
  id: string;
  category: string;
  emoji: string;
  blurb: string;
  items: MenuItem[];
}

export interface DealConfig {
  id: string;
  name: string;
  desc: string;
  price: number;
  saving: number;
  tag: string;
}

export interface PopupConfig {
  id: string;
  enabled: boolean;
  delayMs: number; // Delay in milliseconds before showing
  title: string;
  message: string;
  showTopDeal: boolean; // Show the top deal prominently
  actionButtonText: string;
  dismissButtonText: string;
}

export interface TooltipAlertConfig {
  id: string;
  enabled: boolean;
  text: string;
  dealId?: string; // Link to specific deal if needed
  backgroundColor: string; // Tailwind color class
  textColor: string; // Tailwind color class
}

export interface StatConfig {
  label: string;
  value: string;
}

export interface SiteConfig {
  brand: {
    name: string;
    headline: string;
    headlineAccent: string;
    heroAltHeadline: string;
    tagline: string;
    subTagline: string;
    locationLine: string;
    whatsappNumber: string;
    whatsappDisplay: string;
    socialLinks: SocialLink[];
  };
  story: {
    eyebrow: string;
    title: string;
    body: string;
    quote: string;
    stats: StatConfig[];
  };
  ordering: {
    quickOrderLabel: string;
    bagTitle: string;
    checkoutTitle: string;
    addressPrompt: string;
    notePrompt: string;
  };
  frames: {
    urls: string[];
  };
  locations: LocationConfig[];
  menu: MenuCategory[];
  deals: DealConfig[];
  popups: PopupConfig[];
  tooltips: TooltipAlertConfig[];
  seo: {
    title: string;
    description: string;
    canonicalUrl: string;
  };
}
