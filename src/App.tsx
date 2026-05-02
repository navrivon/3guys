import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from 'motion/react';
import {
  ArrowUpRight,
  Clock3,
  Facebook,
  Flame,
  Instagram,
  MapPin,
  Menu as MenuIcon,
  Minus,
  Phone,
  Plus,
  Send,
  ShoppingBag,
  Star,
  X,
} from 'lucide-react';
import { CONFIG, type MenuItem, type SocialLink } from './config';

interface CartItem extends MenuItem {
  quantity: number;
}

const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

const BurgerLogo = ({ className = 'h-12 w-12' }: { className?: string }) => (
  <img
    src={`${import.meta.env.BASE_URL}assets/logo.png`}
    alt="3 Guys Logo"
    className={`${className} object-contain`}
    style={{ maxWidth: '100%', height: 'auto' }}
  />
);

const TiktokIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.88 3c.3 2.3 1.6 3.67 3.82 3.83v2.6a6.86 6.86 0 0 1-3.8-1.18v6.11c0 3.14-2.52 5.64-5.86 5.64a5.7 5.7 0 0 1-3.02-.86 5.54 5.54 0 0 1-2.68-4.78c0-3.15 2.52-5.65 5.7-5.65.26 0 .52.03.77.06v2.84a2.84 2.84 0 0 0-.77-.11 2.8 2.8 0 0 0-2.88 2.86c0 1.02.56 1.92 1.39 2.4.42.25.9.39 1.44.39a2.84 2.84 0 0 0 2.95-2.84V3h2.94Z" />
  </svg>
);

const socialIconMap: Record<SocialLink['id'], React.ReactNode> = {
  instagram: <Instagram className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  tiktok: <TiktokIcon className="h-5 w-5" />,
};

const menuCardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.06, type: 'spring', stiffness: 120, damping: 18 },
  }),
};

const App: React.FC = () => {
  const allItems = useMemo(
    () => CONFIG.menu.flatMap((section) => section.items.map((item) => ({ ...item, categoryId: section.id, categoryLabel: section.category }))),
    [],
  );

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(CONFIG.locations[0]?.id ?? '');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isOrderProcessing, setIsOrderProcessing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [showSalesPopup, setShowSalesPopup] = useState(false);
  const [activePopups, setActivePopups] = useState<Set<string>>(new Set());
  const [showAlerts, setShowAlerts] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll();

  const filteredItems = useMemo(
    () => (activeCategory === 'all' ? allItems : allItems.filter((item) => item.categoryId === activeCategory)),
    [activeCategory, allItems],
  );
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const selectedLocationData = useMemo(
    () => CONFIG.locations.find((location) => location.id === selectedLocation) ?? CONFIG.locations[0],
    [selectedLocation],
  );

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    setIsScrolled(value > 0.05);
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = value * video.duration;
    }
    // Dismiss alert banner once user scrolls down
    if (value > 0.08) {
      setShowAlerts(false);
    }
  });

  useEffect(() => {
    document.title = CONFIG.seo.title;

    const metaDescription =
      document.querySelector('meta[name="description"]') ?? document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    metaDescription.setAttribute('content', CONFIG.seo.description);
    document.head.appendChild(metaDescription);
  }, []);

  // Show sales popup after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSalesPopup(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  // Setup multiple configurable popups - one at a time, each 15s apart after sales popup
  useEffect(() => {
    const enabledPopups = CONFIG.popups.filter((p) => p.enabled);
    const timers: NodeJS.Timeout[] = [];

    enabledPopups.forEach((popup, index) => {
      // First configurable popup at 30s (15s after sales), then +15s each
      const delay = 30000 + index * 15000;
      const timer = setTimeout(() => {
        setActivePopups(new Set([popup.id]));
      }, delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isCartOpen || isOrderProcessing ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen, isOrderProcessing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleReady = () => {
      setIsVideoReady(true);
      const progress = scrollYProgress.get();
      if (Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = progress * video.duration;
      }
    };

    video.addEventListener('loadedmetadata', handleReady);
    video.addEventListener('canplay', handleReady);

    return () => {
      video.removeEventListener('loadedmetadata', handleReady);
      video.removeEventListener('canplay', handleReady);
    };
  }, []);

  const addToCart = (item: MenuItem) => {
    setCheckoutError('');
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) {
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry,
        );
      }

      return [...current, { ...item, quantity: 1 }];
    });
  };

  const addDealToCart = (deal: (typeof CONFIG.deals)[0]) => {
    setCheckoutError('');
    const dealItem: CartItem = {
      id: deal.id,
      name: deal.name,
      desc: deal.desc,
      price: deal.price,
      image: '', // Deals don't have images
      tag: deal.tag,
      quantity: 1,
      categoryId: 'deals',
      categoryLabel: 'Deal',
    };

    setCart((current) => {
      const existing = current.find((entry) => entry.id === deal.id);
      if (existing) {
        return current.map((entry) =>
          entry.id === deal.id ? { ...entry, quantity: entry.quantity + 1 } : entry,
        );
      }

      return [...current, dealItem];
    });
  };

  const closePopup = (popupId: string) => {
    setActivePopups((prev) => {
      const updated = new Set(prev);
      updated.delete(popupId);
      return updated;
    });
  };

  const handlePopupAction = (popupId: string) => {
    closePopup(popupId);
    const dealsSection = document.getElementById('deals');
    if (dealsSection) {
      setTimeout(() => {
        dealsSection.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      setCheckoutError('Add something to the bag first.');
      return;
    }
    if (!selectedLocationData) {
      setCheckoutError('Choose a pickup or delivery location.');
      return;
    }
    if (!address.trim()) {
      setCheckoutError('Add a delivery address so the order is usable.');
      return;
    }

    setCheckoutError('');
    setIsOrderProcessing(true);

    const lines = cart.map(
      (item) => `- ${item.name} x${item.quantity} (${formatPrice(item.price * item.quantity)})`,
    );
    const message = [
      `*NEW ORDER - ${CONFIG.brand.name}*`,
      '',
      customerName.trim() ? `*Name:* ${customerName.trim()}` : undefined,
      `*Location:* ${selectedLocationData.name}`,
      `*Address:* ${address.trim()}`,
      notes.trim() ? `*Notes:* ${notes.trim()}` : undefined,
      '',
      '*Items:*',
      ...lines,
      '',
      `*Total:* ${formatPrice(cartTotal)}`,
    ]
      .filter(Boolean)
      .join('\n');

    window.setTimeout(() => {
      window.open(
        `https://wa.me/${CONFIG.brand.whatsappNumber}?text=${encodeURIComponent(message)}`,
        '_blank',
        'noopener,noreferrer',
      );
      setIsOrderProcessing(false);
      setIsCartOpen(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-bg-base text-ink selection:bg-accent/20 selection:text-white">
      <div className="fixed inset-0 z-0 bg-ink">
        <video
          ref={videoRef}
          src={`${import.meta.env.BASE_URL}assets/videos/burger.mp4`}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover brightness-[0.2] contrast-120 saturate-[1.3]"
          style={{ objectPosition: 'center bottom', transform: 'translateY(20px)' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,24,55,0.20),transparent_35%),linear-gradient(180deg,rgba(26,23,20,0.30),rgba(26,23,20,0.68))]" />
        {!isVideoReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.06, 1], rotate: [0, 1.5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="rounded-full border border-white/10 bg-white/5 p-6 shadow-2xl"
            >
              <BurgerLogo className="h-16 w-16" />
            </motion.div>
          </div>
        )}
      </div>

      {/* Floating Alert Notification — appears below navbar, dismisses on scroll */}
      <AnimatePresence>
        {showAlerts && CONFIG.tooltips.filter((t) => t.enabled).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            className="fixed inset-x-0 top-20 z-[45] flex justify-center px-4 sm:top-24 pointer-events-none"
          >
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 sm:gap-3 rounded-2xl border border-white/15 bg-ink/80 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-5">
              {CONFIG.tooltips.filter((t) => t.enabled).map((tooltip) => (
                <a
                  key={tooltip.id}
                  href={`https://wa.me/${CONFIG.brand.whatsappNumber}?text=${encodeURIComponent('Hi! I\'m interested in your deals.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-extrabold uppercase tracking-[0.2em] transition hover:scale-105 active:scale-95 ${tooltip.backgroundColor} ${tooltip.textColor}`}
                >
                  {tooltip.text}
                </a>
              ))}
              <button
                type="button"
                onClick={() => setShowAlerts(false)}
                aria-label="Dismiss alerts"
                className="ml-1 rounded-full p-1 text-white/50 transition hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'border-b border-white/10 bg-ink/85 backdrop-blur-xl' : ''
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-6 sm:py-4">
          <a href="#top" className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-none">
            <BurgerLogo className="h-10 w-10 shrink-0 sm:h-12 sm:w-12 md:h-14 md:w-14" />
            <div className="min-w-0">
              <div className="font-brand text-lg sm:text-2xl md:text-3xl lg:text-4xl leading-none text-white truncate">{CONFIG.brand.name}</div>
              <div className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-[0.2em] sm:tracking-[0.28em] text-white/60 truncate">
                {CONFIG.brand.locationLine}
              </div>
            </div>
          </a>

          <div className="hidden items-center gap-4 lg:gap-7 text-[10px] lg:text-[11px] font-extrabold uppercase tracking-[0.3em] text-white/70 lg:flex">
            <a href="#menu" className="transition hover:text-white">Menu</a>
            <a href="#deals" className="transition hover:text-white">Deals</a>
            <a href="#locations" className="transition hover:text-white">Locations</a>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${CONFIG.brand.whatsappDisplay.replace(/\s+/g, '')}`}
              className="hidden items-center gap-1 sm:gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 sm:px-4 sm:py-3 text-[9px] sm:text-xs font-extrabold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white backdrop-blur md:flex transition hover:bg-white/10"
            >
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden lg:inline">{CONFIG.brand.whatsappDisplay}</span>
            </a>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex h-10 sm:h-12 md:h-13 w-10 sm:w-auto items-center justify-center rounded-full bg-accent px-0 sm:px-4 text-xs sm:text-sm font-extrabold uppercase tracking-[0.15em] sm:tracking-[0.18em] text-white shadow-[0_18px_60px_rgba(227,24,55,0.35)] transition hover:scale-[1.02] active:scale-95 shrink-0"
            >
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
              <span className="hidden sm:inline">Bag</span>
              {cartCount > 0 && (
                <span className="ml-1 sm:ml-3 rounded-full bg-white px-1.5 py-0.5 sm:px-2 sm:py-1 text-[9px] sm:text-[10px] text-accent font-black">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        <header id="top" className="min-h-screen px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
          <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-8 pb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, type: 'spring' }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.34em] text-white/85 backdrop-blur"
              >
                <Flame className="h-4 w-4 text-accent" />
                {CONFIG.story.eyebrow}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                <h1 className="max-w-4xl font-brand text-[4.4rem] uppercase leading-[0.82] text-white sm:text-[6rem] md:text-[8.5rem] xl:text-[10.5rem]">
                  {CONFIG.brand.headline}
                  <span className="block text-accent">{CONFIG.brand.headlineAccent}</span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
                className="max-w-xl text-base font-bold leading-7 text-white/78 sm:text-lg"
              >
                {CONFIG.brand.heroAltHeadline}. {CONFIG.brand.tagline} {CONFIG.brand.subTagline}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-3"
              >
                <a
                  href="#menu"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-ink transition hover:scale-[1.02] active:scale-95"
                >
                  See The Menu
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const dealsSection = document.getElementById('deals');
                    if (dealsSection) {
                      dealsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                    setTimeout(() => setIsCartOpen(true), 500);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-accent px-7 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white transition hover:scale-[1.02] active:scale-95"
                >
                  {CONFIG.ordering.quickOrderLabel}
                  <ShoppingBag className="h-4 w-4" />
                </button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="grid gap-4 self-center lg:justify-self-end"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {CONFIG.story.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="w-full min-w-[220px] rounded-[1.75rem] border border-white/12 bg-white/8 p-5 text-white shadow-2xl backdrop-blur-xl"
                  >
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/55">{stat.label}</div>
                    <div className="mt-3 font-brand text-5xl leading-none text-white">{stat.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </header>

        <div className="hidden fixed right-5 top-1/2 z-40 -translate-y-1/2 gap-3 lg:flex lg:flex-col">
          {CONFIG.brand.socialLinks.map((social) => (
            <a
              key={social.id}
              href={social.url ?? '#'}
              target={social.url ? '_blank' : undefined}
              rel={social.url ? 'noreferrer' : undefined}
              aria-label={social.label}
              className={`inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/12 backdrop-blur ${
                social.url
                  ? 'bg-white/8 text-white transition hover:scale-105 hover:bg-accent'
                  : 'cursor-default bg-white/5 text-white/35'
              }`}
            >
              {socialIconMap[social.id]}
            </a>
          ))}
        </div>

        <main className="rounded-t-[2rem] bg-bg-base shadow-[0_-24px_80px_rgba(0,0,0,0.2)] sm:rounded-t-[3rem]">
          <section id="menu" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.34em] text-accent">Section 01</div>
                <h2 className="mt-4 font-brand text-6xl uppercase leading-[0.86] text-ink sm:text-7xl md:text-8xl">
                  Menu Built To Move
                </h2>
                <p className="mt-4 max-w-xl text-base font-bold leading-7 text-ink/68">
                  Big categories, fast filtering, and every primary action one tap away.
                </p>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All' },
                  ...CONFIG.menu.map((section) => ({ id: section.id, label: section.category })),
                ].map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveCategory(section.id)}
                    className={`shrink-0 rounded-full px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] transition ${
                      activeCategory === section.id
                        ? 'bg-accent text-white shadow-[0_16px_40px_rgba(227,24,55,0.28)]'
                        : 'bg-ink/6 text-ink/65 hover:bg-ink/12'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item, index) => (
                <motion.article
                  key={item.id}
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={menuCardVariants}
                  className="overflow-hidden rounded-[1.9rem] border border-black/6 bg-white shadow-[0_18px_50px_rgba(26,23,20,0.08)]"
                >
                  <div className="relative aspect-[1/1] overflow-hidden bg-ink/5">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-700 hover:scale-105" />
                    {item.tag && (
                      <div className="absolute left-4 top-4 rounded-full bg-accent px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white">
                        {item.tag}
                      </div>
                    )}
                  </div>
                  <div className="space-y-5 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-accent">
                          {item.categoryLabel}
                        </div>
                        <h3 className="mt-2 text-2xl font-black uppercase leading-tight text-ink">{item.name}</h3>
                      </div>
                      <div className="text-right text-lg font-black text-accent">{formatPrice(item.price)}</div>
                    </div>
                    <p className="min-h-14 text-sm font-bold leading-6 text-ink/62">{item.desc}</p>
                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-[1.1rem] bg-ink px-5 py-4 text-xs font-extrabold uppercase tracking-[0.2em] text-white transition hover:scale-[1.01] hover:bg-accent active:scale-95"
                    >
                      Add To Bag
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          <section id="deals" className="border-y border-black/6 bg-ink px-4 py-18 text-white sm:px-6">
            <div className="mx-auto max-w-7xl">
              <div className="max-w-2xl">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.34em] text-accent">Section 02</div>
                <h2 className="mt-4 font-brand text-6xl uppercase leading-[0.86] sm:text-7xl md:text-8xl">
                  Fully Loaded Deals
                </h2>
              </div>
              <div className="mt-12 grid gap-5 lg:grid-cols-3">
                {CONFIG.deals.map((deal) => (
                  <motion.div
                    key={deal.id}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur transition hover:border-white/30 hover:bg-white/8"
                  >
                    <div className="inline-flex rounded-full border border-white/12 bg-accent/18 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white">
                      {deal.tag}
                    </div>
                    <h3 className="mt-5 text-3xl font-black uppercase">{deal.name}</h3>
                    <p className="mt-3 text-sm font-bold leading-6 text-white/72">{deal.desc}</p>
                    <div className="mt-8 flex items-end justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-white/50">Deal Price</div>
                        <div className="mt-2 text-3xl font-black text-accent">{formatPrice(deal.price)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-white/50">You Save</div>
                        <div className="mt-2 text-xl font-black">{formatPrice(deal.saving)}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addDealToCart(deal)}
                      className="mt-6 w-full rounded-full bg-white px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-accent transition hover:scale-[1.02] active:scale-95"
                    >
                      Add Deal To Bag
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
              <div className="space-y-6">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.34em] text-accent">Section 03</div>
                <h2 className="font-brand text-6xl uppercase leading-[0.86] text-ink sm:text-7xl md:text-8xl">
                  {CONFIG.story.title}
                </h2>
                <p className="max-w-xl text-base font-bold leading-7 text-ink/68">{CONFIG.story.body}</p>
                <div className="rounded-[2rem] border border-black/6 bg-white p-6 shadow-[0_16px_50px_rgba(26,23,20,0.06)]">
                  <div className="flex items-center gap-3 text-accent">
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                  <p className="mt-4 text-lg font-black uppercase leading-8 text-ink">{CONFIG.story.quote}</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {CONFIG.menu.map((section) => (
                  <div key={section.id} className="rounded-[2rem] border border-black/6 bg-accent p-6 text-white shadow-[0_20px_50px_rgba(227,24,55,0.18)]">
                    <div className="text-3xl">{section.emoji}</div>
                    <h3 className="mt-4 text-2xl font-black uppercase">{section.category}</h3>
                    <p className="mt-3 text-sm font-bold leading-6 text-white/80">{section.blurb}</p>
                    <div className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.24em] text-white/60">
                      {section.items.length} Items Configured
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="locations" className="border-t border-black/6 px-4 py-20 sm:px-6 sm:py-24">
            <div className="mx-auto max-w-7xl">
              <div className="max-w-2xl">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.34em] text-accent">Section 04</div>
                <h2 className="mt-4 font-brand text-6xl uppercase leading-[0.86] text-ink sm:text-7xl md:text-8xl">
                  Find The Guys
                </h2>
              </div>
              <div className="mt-12 grid gap-6 lg:grid-cols-2">
                {CONFIG.locations.map((location) => (
                  <div key={location.id} className="rounded-[2rem] border border-black/6 bg-white p-6 shadow-[0_18px_50px_rgba(26,23,20,0.06)] sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-accent">Location</div>
                        <h3 className="mt-3 text-3xl font-black uppercase text-ink">{location.name}</h3>
                      </div>
                      <div className="rounded-full bg-accent/10 p-3 text-accent">
                        <MapPin className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-5 max-w-sm text-base font-bold leading-7 text-ink/68">{location.fullAddress}</p>
                    <div className="mt-7 grid gap-3 text-sm font-bold text-ink/75">
                      <div className="flex items-center gap-3">
                        <Clock3 className="h-4 w-4 text-accent" />
                        {location.hours}
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-accent" />
                        {location.phoneDisplay}
                      </div>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <a
                        href={`tel:${location.phoneDisplay.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white transition hover:scale-[1.02]"
                      >
                        Call Now
                      </a>
                      <a
                        href={location.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-ink px-5 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white transition hover:scale-[1.02]"
                      >
                        Open Maps
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="border-t border-black/6 bg-ink px-4 py-8 text-center text-white/60 sm:px-6">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.34em]">
              {new Date().getFullYear()} {CONFIG.brand.name}
            </div>
          </footer>
        </main>
      </div>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close bag"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-ink/72 backdrop-blur-sm"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 180, damping: 24 }}
              className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl"
              aria-modal="true"
              role="dialog"
            >
              <div className="flex items-center justify-between border-b border-black/6 px-5 py-5 sm:px-6">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-accent">Live Bag</div>
                  <h3 className="mt-2 font-brand text-4xl leading-none text-ink">{CONFIG.ordering.bagTitle}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-full bg-ink/5 p-3 text-ink transition hover:bg-ink hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="rounded-full bg-accent/10 p-6 text-accent">
                      <ShoppingBag className="h-12 w-12" />
                    </div>
                    <h4 className="mt-6 text-2xl font-black uppercase text-ink">Bag is empty</h4>
                    <p className="mt-3 max-w-sm text-sm font-bold leading-6 text-ink/58">
                      Add a pizza, burger, fries, or wrap and the WhatsApp order will build itself.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-5 rounded-[1.6rem] border border-black/8 bg-white p-5 shadow-[0_4px_18px_rgba(26,23,20,0.06)]">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="h-28 w-28 shrink-0 rounded-[1.2rem] object-cover" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="text-xl font-black uppercase leading-tight text-ink">{item.name}</h4>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -item.quantity)}
                              className="shrink-0 rounded-full p-2 text-ink/35 transition hover:bg-accent hover:text-white"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-2 text-base font-black text-accent">{formatPrice(item.price)}</div>
                          <div className="mt-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="rounded-full bg-ink/6 p-2.5 transition hover:bg-ink hover:text-white"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <div className="min-w-10 text-center text-base font-black text-ink">{item.quantity}</div>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="rounded-full bg-ink/6 p-2.5 transition hover:bg-accent hover:text-white"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="text-right text-base font-black text-ink">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-black/6 bg-bg-base px-5 py-5 sm:px-6">
                <div className="space-y-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-accent">
                    {CONFIG.ordering.checkoutTitle}
                  </div>
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-[1.1rem] border border-black/8 bg-white px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-accent"
                  />
                  <select
                    value={selectedLocation}
                    onChange={(event) => setSelectedLocation(event.target.value)}
                    className="w-full rounded-[1.1rem] border border-black/8 bg-white px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-accent"
                  >
                    {CONFIG.locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder={CONFIG.ordering.addressPrompt}
                    className="min-h-24 w-full rounded-[1.1rem] border border-black/8 bg-white px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-accent"
                  />
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder={CONFIG.ordering.notePrompt}
                    className="min-h-20 w-full rounded-[1.1rem] border border-black/8 bg-white px-4 py-3 text-sm font-bold text-ink outline-none transition focus:border-accent"
                  />
                  {checkoutError ? <p className="text-sm font-bold text-accent">{checkoutError}</p> : null}
                </div>

                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-ink/42">Grand Total</div>
                    <div className="mt-2 text-3xl font-black text-ink">{formatPrice(cartTotal)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_12px_36px_rgba(227,24,55,0.25)] transition hover:scale-[1.02] active:scale-95"
                  >
                    WhatsApp Order
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOrderProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-ink/90 px-4"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-md rounded-[2rem] border border-white/12 bg-accent p-8 text-center text-white shadow-[0_28px_80px_rgba(227,24,55,0.35)]"
            >
              <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-white/14">
                <BurgerLogo className="h-12 w-12" />
              </div>
              <h3 className="mt-6 font-brand text-5xl uppercase leading-none">Fired Up</h3>
              <p className="mt-4 text-sm font-extrabold uppercase tracking-[0.26em] text-white/78">
                Opening WhatsApp with your structured order
              </p>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.1, ease: 'linear', repeat: Infinity }}
                className="mx-auto mt-8 h-12 w-12 rounded-full border-4 border-white/25 border-t-white"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSalesPopup && (
          <>
            <motion.button
              type="button"
              aria-label="Close sales popup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-ink/60 backdrop-blur-sm"
              onClick={() => setShowSalesPopup(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-[101] flex items-center justify-center px-4"
            >
              <div className="w-full max-w-md rounded-[2.5rem] border border-white/15 bg-gradient-to-b from-accent to-accent/90 p-8 text-center text-white shadow-[0_32px_100px_rgba(227,24,55,0.45)]">
                <div className="inline-flex rounded-full border-2 border-white/30 bg-white/10 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.28em] text-white/90 mb-4">
                  🔥 Limited Time Offer
                </div>

                <h3 className="font-brand text-4xl uppercase leading-tight mt-4">Fully Loaded Deals</h3>

                <p className="mt-4 text-sm font-bold leading-6 text-white/85">
                  Check out our amazing deals and save big on your favorite items!
                </p>

                <div className="mt-6 space-y-3">
                  {CONFIG.deals.map((deal) => (
                    <div key={deal.id} className="rounded-full bg-white/15 px-4 py-3 backdrop-blur-sm border border-white/20">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-left">
                          <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/70">{deal.tag}</div>
                          <div className="text-sm font-black uppercase">{deal.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-white/70">Save</div>
                          <div className="text-lg font-black">{formatPrice(deal.saving)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSalesPopup(false);
                      const dealsSection = document.getElementById('deals');
                      if (dealsSection) {
                        setTimeout(() => {
                          dealsSection.scrollIntoView({ behavior: 'smooth' });
                        }, 300);
                      }
                    }}
                    className="w-full rounded-full bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-accent transition hover:scale-[1.02] active:scale-95 shadow-lg"
                  >
                    View All Deals
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSalesPopup(false)}
                    className="w-full rounded-full border border-white/30 bg-transparent px-6 py-3 text-sm font-extrabold uppercase tracking-[0.18em] text-white transition hover:bg-white/10 active:scale-95"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Configurable Popups */}
      <AnimatePresence>
        {Array.from(activePopups).map((popupId) => {
          const popup = CONFIG.popups.find((p) => p.id === popupId);
          if (!popup) return null;

          const topDeal = CONFIG.deals.reduce((max, deal) => (deal.saving > max.saving ? deal : max));

          return (
            <div key={popupId}>
              <motion.button
                type="button"
                aria-label={`Close ${popup.title}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[105] bg-ink/40 backdrop-blur-sm"
                onClick={() => closePopup(popupId)}
              />
              <motion.div
                initial={{ scale: 0.88, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 10 }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                className="fixed inset-0 z-[106] flex items-center justify-center px-4 py-6 sm:px-6 overflow-hidden"
              >
                <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[2.5rem] border border-white/15 bg-gradient-to-br from-accent via-accent to-accent/95 p-6 sm:p-8 lg:p-10 text-center text-white shadow-[0_40px_120px_rgba(227,24,55,0.5)] scrollbar-hide"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  
                  {/* Header with Badge */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex rounded-full border-2 border-white/30 bg-white/15 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.28em] text-white/95"
                  >
                    {popup.title}
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="font-brand text-3xl sm:text-4xl lg:text-5xl uppercase leading-tight mt-6"
                  >
                    {popup.title}
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-sm sm:text-base font-bold leading-6 text-white/90"
                  >
                    {popup.message}
                  </motion.p>

                  {/* Top Deal Highlight */}
                  {popup.showTopDeal && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 }}
                      className="mt-6 rounded-[1.8rem] border-2 border-white/25 bg-white/10 p-5 sm:p-6 backdrop-blur-sm cursor-pointer hover:bg-white/15 hover:border-white/40 transition active:scale-95"
                      onClick={() => {
                        addDealToCart(topDeal);
                        closePopup(popupId);
                      }}
                    >
                      <div className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-white/80">Top Deal</div>
                      <h4 className="mt-3 text-xl sm:text-2xl font-black uppercase text-white">{topDeal.name}</h4>
                      <p className="mt-2 text-xs sm:text-sm font-bold text-white/85">{topDeal.desc}</p>
                      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                        <div>
                          <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/70">Price</div>
                          <div className="mt-2 text-2xl sm:text-3xl font-black text-white">{formatPrice(topDeal.price)}</div>
                        </div>
                        <div className="hidden sm:block h-10 w-0.5 bg-white/20" />
                        <div>
                          <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/70">Save</div>
                          <div className="mt-2 text-2xl sm:text-3xl font-black text-yellow-300">{formatPrice(topDeal.saving)}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* All Deals Grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {CONFIG.deals.map((deal) => (
                      <motion.div
                        key={deal.id}
                        whileHover={{ scale: 1.02 }}
                        className="rounded-[1.3rem] border border-white/20 bg-white/10 p-4 cursor-pointer transition hover:bg-white/15 hover:border-white/30 active:scale-95"
                        onClick={() => {
                          addDealToCart(deal);
                          closePopup(popupId);
                        }}
                      >
                        <div className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/75">{deal.tag}</div>
                        <h5 className="mt-2 text-sm sm:text-base font-black uppercase leading-tight text-white">{deal.name}</h5>
                        <p className="mt-2 text-xs font-bold text-white/75 line-clamp-2">{deal.desc}</p>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div>
                            <div className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-white/60">Price</div>
                            <div className="text-sm font-black text-white">{formatPrice(deal.price)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-white/60">Save</div>
                            <div className="text-sm font-black text-yellow-300">{formatPrice(deal.saving)}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="mt-8 flex flex-col sm:flex-row gap-3"
                  >
                    <button
                      type="button"
                      onClick={() => handlePopupAction(popupId)}
                      className="flex-1 rounded-full bg-white px-6 py-3 sm:py-4 text-xs sm:text-sm font-extrabold uppercase tracking-[0.18em] text-accent transition hover:scale-[1.02] active:scale-95 shadow-lg"
                    >
                      {popup.actionButtonText}
                    </button>
                    <button
                      type="button"
                      onClick={() => closePopup(popupId)}
                      className="flex-1 rounded-full border-2 border-white/30 bg-transparent px-6 py-3 sm:py-4 text-xs sm:text-sm font-extrabold uppercase tracking-[0.18em] text-white transition hover:bg-white/10 hover:border-white/50 active:scale-95"
                    >
                      {popup.dismissButtonText}
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </AnimatePresence>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/92 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 text-xs font-extrabold uppercase tracking-[0.18em] text-ink"
          >
            <MenuIcon className="h-4 w-4" />
            Browse Bag
          </button>
          <button
            type="button"
            onClick={() => {
              const dealsSection = document.getElementById('deals');
              if (dealsSection) {
                dealsSection.scrollIntoView({ behavior: 'smooth' });
              }
              setTimeout(() => setIsCartOpen(true), 500);
            }}
            className="inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 text-xs font-extrabold uppercase tracking-[0.18em] text-white transition active:scale-95"
          >
            {CONFIG.ordering.quickOrderLabel}
            <span>{cartTotal > 0 ? formatPrice(cartTotal) : 'Hot Deals →'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
