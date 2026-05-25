import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Heart,
  MapPin,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  X,
  Clock,
  Check,
  Hand,
  Footprints,
  Eye,
  Gem,
  Upload,
  CreditCard,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createBooking, uploadPaymentScreenshot } from "@/lib/bookings";
import { cn } from "@/lib/utils";
import heroImg from "@/assets/hero-nails.jpg";
import manicureImg from "@/assets/manicure.jpg";
import pedicureImg from "@/assets/pedicure.jpg";
import extensionsImg from "@/assets/extensions.jpg";
import lashesImg from "@/assets/lashes.jpg";
import nailartImg from "@/assets/nailart.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GR Nails — Luxury Manicure, Pedicure & Lash Studio in Craigieburn" },
      {
        name: "description",
        content:
          "Premium nail and lash studio in Craigieburn. Shellac manicures from $20, builder gel from $60, classic lashes from $50. Book your appointment online today.",
      },
      { property: "og:title", content: "GR Nails — Luxury Nail & Lash Studio" },
      {
        property: "og:description",
        content:
          "Manicures, pedicures, builder gel and lash extensions in Craigieburn. Browse the menu and book your appointment.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

const STUDIO = {
  name: "GR Nails",
  address: "Craigieburn, VIC 3064",
  phone: "+61 475 182 307",
  phoneHref: "tel:+61475182307",
  email: "info@grnails.com.au",
  payId: "0475 182 307",
  payIdName: "Gita Kumari Shahi",
  bsb: "063-788",
  accountNumber: "10371780",
};

type Category = "manicure" | "pedicure" | "builder" | "lashes" | "extras";

type Service = {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  category: Category;
  image: string;
};

const SERVICES: Service[] = [
  // Manicure
  {
    id: "mani-basic",
    name: "Basic Manicure",
    description: "Shape, cuticle care, hand massage and a glossy polish finish.",
    duration: "30 mins",
    price: 20,
    category: "manicure",
    image: manicureImg,
  },
  {
    id: "mani-shellac",
    name: "Gel (Shellac) Manicure",
    description: "Long-lasting shellac colour with mirror shine — up to 2–3 weeks.",
    duration: "45 mins",
    price: 35,
    category: "manicure",
    image: manicureImg,
  },
  // Pedicure
  {
    id: "pedi-basic",
    name: "Basic Pedicure",
    description: "Soak, exfoliation, foot massage and polish — a quiet ritual.",
    duration: "40 mins",
    price: 30,
    category: "pedicure",
    image: pedicureImg,
  },
  {
    id: "pedi-shellac",
    name: "Gel (Shellac) Pedicure",
    description: "Spa pedicure finished with chip-resistant shellac colour.",
    duration: "60 mins",
    price: 45,
    category: "pedicure",
    image: pedicureImg,
  },
  // Builder Gel
  {
    id: "builder-full",
    name: "Builder Gel — Full Set",
    description: "Sculpted length and strength with builder gel extensions.",
    duration: "90 mins",
    price: 60,
    category: "builder",
    image: extensionsImg,
  },
  {
    id: "builder-refill",
    name: "Builder Gel — Refill",
    description: "Reshape and refill your existing builder gel set.",
    duration: "60 mins",
    price: 45,
    category: "builder",
    image: extensionsImg,
  },
  // Lashes
  {
    id: "lash-classic-natural",
    name: "Classic Natural Set",
    description: "A whispered, everyday flutter — applied lash by lash.",
    duration: "60 mins",
    price: 50,
    category: "lashes",
    image: lashesImg,
  },
  {
    id: "lash-classic-full",
    name: "Classic Full Set",
    description: "Full, considered classic lashes for a defined finish.",
    duration: "75 mins",
    price: 65,
    category: "lashes",
    image: lashesImg,
  },
  {
    id: "lash-classic-refill",
    name: "3-Week Classic Refill",
    description: "Top-up of your classic set after three weeks.",
    duration: "45 mins",
    price: 35,
    category: "lashes",
    image: lashesImg,
  },
  {
    id: "lash-hybrid",
    name: "Hybrid Set",
    description: "A layered mix of classic and volume — soft yet dimensional.",
    duration: "90 mins",
    price: 75,
    category: "lashes",
    image: lashesImg,
  },
  {
    id: "lash-hybrid-refill-12",
    name: "Hybrid 1–2 Week Refill",
    description: "Quick top-up to keep your hybrid set looking fresh.",
    duration: "45 mins",
    price: 45,
    category: "lashes",
    image: lashesImg,
  },
  {
    id: "lash-hybrid-refill-3",
    name: "Hybrid 3-Week Refill",
    description: "Three-week refill for hybrid lash sets.",
    duration: "60 mins",
    price: 60,
    category: "lashes",
    image: lashesImg,
  },
  // Extras
  {
    id: "extra-art",
    name: "Nail Art (per nail)",
    description: "Hand-painted bespoke nail art — from delicate to dramatic.",
    duration: "+10 mins",
    price: 5,
    category: "extras",
    image: nailartImg,
  },
  {
    id: "extra-french",
    name: "French Tips",
    description: "Classic or modern French — clean tips, perfect curve.",
    duration: "+15 mins",
    price: 10,
    category: "extras",
    image: nailartImg,
  },
  {
    id: "extra-removal",
    name: "Soak-off Removal",
    description: "Gentle removal of existing gel or builder gel.",
    duration: "20 mins",
    price: 20,
    category: "extras",
    image: nailartImg,
  },
  {
    id: "extra-gems",
    name: "Diamantés / Gems (each)",
    description: "Crystal accents placed by hand — sparkle, finely tuned.",
    duration: "+5 mins",
    price: 1,
    category: "extras",
    image: nailartImg,
  },
];

const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "manicure", label: "Manicure" },
  { id: "pedicure", label: "Pedicure" },
  { id: "builder", label: "Builder Gel" },
  { id: "lashes", label: "Lashes" },
  { id: "extras", label: "Extras" },
];

const NAV = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Visit", href: "#visit" },
];

/* ---------------------------------- Header --------------------------------- */
function Header({ cartCount, onOpenCart }: { cartCount: number; onOpenCart: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
        scrolled ? "bg-[var(--cream)]/90 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-10 h-20 flex items-center justify-between">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="font-serif text-2xl lg:text-3xl tracking-tight text-foreground">
            GR<span className="text-[var(--gold)] italic">.</span>Nails
          </span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Craigieburn
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-10">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-xs uppercase tracking-[0.25em] text-foreground/80 hover:text-[var(--rose)] transition-colors"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCart}
            className="relative inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-xs uppercase tracking-[0.25em] hover:bg-[var(--rose)] transition-colors"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Booking</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 size-5 rounded-full bg-[var(--gold)] text-foreground text-[10px] font-semibold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="md:hidden p-2 ml-1"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className="block w-6 h-px bg-foreground mb-1.5" />
            <span className="block w-6 h-px bg-foreground mb-1.5" />
            <span className="block w-4 h-px bg-foreground ml-auto" />
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-[var(--cream)] border-t border-border px-6 py-6 space-y-4">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block text-sm uppercase tracking-[0.25em]"
            >
              {n.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

/* ----------------------------------- Hero ---------------------------------- */
function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[100svh] flex items-center justify-center text-center text-background overflow-hidden"
    >
      <img
        src={heroImg}
        alt="Luxury blush nail polish flat lay"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/65 via-foreground/55 to-foreground/75" />
      <div className="relative z-10 max-w-3xl px-6 py-32 space-y-8">
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-background/15 backdrop-blur border border-background/25 text-xs uppercase tracking-[0.3em]">
          <Sparkles className="size-3.5 text-[var(--gold)]" />
          Premium Nail & Lash Studio
        </span>
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-8xl leading-[0.95] tracking-tight">
          GR Nails
        </h1>
        <p className="text-base lg:text-xl text-background/85 max-w-xl mx-auto leading-relaxed">
          Bespoke manicures, pedicures, builder gel and luxurious lash sets — crafted in the heart
          of Craigieburn.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="#visit"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-background/15 backdrop-blur border border-background/25 text-xs lg:text-sm hover:bg-background/25 transition-colors"
          >
            <MapPin className="size-4" />
            {STUDIO.address}
          </a>
          <a
            href={STUDIO.phoneHref}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-background/15 backdrop-blur border border-background/25 text-xs lg:text-sm hover:bg-background/25 transition-colors"
          >
            <Phone className="size-4" />
            {STUDIO.phone}
          </a>
          <a
            href={`mailto:${STUDIO.email}`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-background/15 backdrop-blur border border-background/25 text-xs lg:text-sm hover:bg-background/25 transition-colors"
          >
            <Mail className="size-4" />
            {STUDIO.email}
          </a>
        </div>
        <div className="pt-4">
          <a
            href="#services"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--gold)] text-foreground rounded-full text-xs uppercase tracking-[0.3em] hover:bg-background hover:text-foreground transition-colors"
          >
            <CalendarIcon className="size-4" />
            Book Now
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- About ---------------------------------- */
function About() {
  return (
    <section id="about" className="py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--blush)]/40 text-[var(--rose)] text-[10px] uppercase tracking-[0.3em]">
          <BookOpen className="size-3.5" />
          About Us
        </span>
        <h2 className="font-serif text-4xl lg:text-6xl mt-6 leading-tight">
          A quiet sanctuary for hands, feet & lashes
        </h2>
        <div className="mt-12 p-8 lg:p-12 bg-[var(--cream)] border border-border rounded-sm">
          <div className="size-14 rounded-full bg-[var(--gold)]/30 flex items-center justify-center mx-auto">
            <Heart className="size-6 text-[var(--rose)]" />
          </div>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            At GR Nails we believe beauty should feel unhurried. Our boutique studio in Craigieburn
            blends old-world patience with modern technique — every manicure, pedicure and lash set
            is performed by a senior artist, with the time it deserves.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            From a quiet shellac touch-up to a full builder-gel transformation, we work slowly, we
            listen, and we finish what we start — beautifully.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Why Choose Us ----------------------------- */
const WHY = [
  {
    icon: Sparkles,
    title: "Senior Artists Only",
    body: "Every appointment is performed by an experienced nail or lash technician.",
  },
  {
    icon: Heart,
    title: "Premium Products",
    body: "We use trusted shellac, builder gel and lash brands — kind to your natural beauty.",
  },
  {
    icon: Clock,
    title: "Unhurried Sessions",
    body: "Generous appointment times so the work can breathe and the finish can shine.",
  },
  {
    icon: MapPin,
    title: "In the Heart of Craigieburn",
    body: "Easy to find, easy to park — a calm escape minutes from home.",
  },
];

function WhyUs() {
  return (
    <section className="py-24 lg:py-32 bg-[var(--cream)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background border border-border text-[var(--rose)] text-[10px] uppercase tracking-[0.3em]">
            <Sparkles className="size-3.5" />
            Why Choose Us
          </span>
          <h2 className="font-serif text-4xl lg:text-6xl mt-6 leading-tight">
            Considered care, every visit.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Discover what makes GR Nails the chosen studio for clients across Melbourne's north.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
          {WHY.map((w) => (
            <div
              key={w.title}
              className="bg-background border border-border p-7 text-center hover:border-[var(--gold)] transition-colors"
            >
              <div className="size-14 rounded-full bg-[var(--blush)]/40 flex items-center justify-center mx-auto">
                <w.icon className="size-6 text-[var(--rose)]" />
              </div>
              <h3 className="font-serif text-2xl mt-5">{w.title}</h3>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{w.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Services + Cart ------------------------------ */
const CATEGORY_ICON: Record<Category, typeof Hand> = {
  manicure: Hand,
  pedicure: Footprints,
  builder: Sparkles,
  lashes: Eye,
  extras: Gem,
};

function ServiceCard({
  service,
  qty,
  onAdd,
  onRemove,
}: {
  service: Service;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const Icon = CATEGORY_ICON[service.category];
  return (
    <article className="group bg-background border border-border flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/90 backdrop-blur text-[10px] uppercase tracking-[0.25em] text-foreground">
          <Icon className="size-3" />
          {service.category}
        </span>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-serif text-2xl leading-tight">{service.name}</h3>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed flex-1">
          {service.description}
        </p>
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-dashed border-border">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {service.duration}
          </span>
          <span className="font-serif text-3xl text-[var(--rose)]">${service.price}</span>
        </div>
        {qty === 0 ? (
          <button
            onClick={onAdd}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background text-xs uppercase tracking-[0.25em] hover:bg-[var(--rose)] transition-colors"
          >
            <Plus className="size-4" />
            Add to Booking
          </button>
        ) : (
          <div className="mt-5 grid grid-cols-3 items-center bg-[var(--cream)] border border-border">
            <button
              onClick={onRemove}
              className="py-3 flex items-center justify-center hover:bg-[var(--blush)]/30 transition-colors"
              aria-label="Remove one"
            >
              <Minus className="size-4" />
            </button>
            <span className="text-center font-serif text-xl">{qty}</span>
            <button
              onClick={onAdd}
              className="py-3 flex items-center justify-center hover:bg-[var(--blush)]/30 transition-colors"
              aria-label="Add one"
            >
              <Plus className="size-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function Services({
  cart,
  onAdd,
  onRemove,
}: {
  cart: Record<string, number>;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [active, setActive] = useState<Category | "all">("all");
  const filtered = useMemo(
    () => (active === "all" ? SERVICES : SERVICES.filter((s) => s.category === active)),
    [active],
  );
  return (
    <section id="services" className="py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--blush)]/40 text-[var(--rose)] text-[10px] uppercase tracking-[0.3em]">
            <Sparkles className="size-3.5" />
            Our Menu
          </span>
          <h2 className="font-serif text-4xl lg:text-6xl mt-6 leading-tight">
            Choose your moment.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tap any service to add it to your booking. Review and send your selection from the
            booking cart — we'll confirm your time.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`px-5 py-2.5 text-xs uppercase tracking-[0.25em] rounded-full border transition-colors ${
                active === c.id
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:border-[var(--rose)]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {filtered.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              qty={cart[s.id] ?? 0}
              onAdd={() => onAdd(s.id)}
              onRemove={() => onRemove(s.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Visit ---------------------------------- */
function Visit() {
  return (
    <section id="visit" className="py-24 lg:py-32 bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/10 border border-background/20 text-[var(--gold)] text-[10px] uppercase tracking-[0.3em]">
            <MapPin className="size-3.5" />
            Visit
          </span>
          <h2 className="font-serif text-4xl lg:text-6xl mt-6 leading-tight">
            Find <em className="italic">us</em>.
          </h2>
          <p className="mt-6 text-background/70 leading-relaxed max-w-sm">
            Tucked into the heart of Craigieburn. Walk-ins welcome when the chairs allow — but a
            booking is the kindest way.
          </p>
          <a
            href={STUDIO.phoneHref}
            className="mt-8 inline-flex items-center gap-3 px-7 py-4 rounded-full bg-[var(--gold)] text-foreground text-xs uppercase tracking-[0.3em] hover:bg-background transition-colors"
          >
            <Phone className="size-4" />
            Call to reserve
          </a>
        </div>
        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
          {[
            { icon: MapPin, label: "Studio", value: STUDIO.name, sub: STUDIO.address },
            {
              icon: Clock,
              label: "Hours",
              value: "9am — 7pm",
              sub: "Mon – Sat · Sun by appointment",
            },
            { icon: Phone, label: "Phone", value: STUDIO.phone, sub: "Calls & SMS welcome" },
            { icon: Mail, label: "Email", value: STUDIO.email, sub: "We reply within a day" },
          ].map((c) => (
            <div key={c.label} className="border border-background/15 p-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-background/50">
                <c.icon className="size-3.5" />
                {c.label}
              </div>
              <p className="font-serif text-2xl mt-3">{c.value}</p>
              <p className="text-background/70 text-sm mt-1">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-foreground text-background/60 border-t border-background/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10 flex flex-wrap items-center justify-between gap-4">
        <p className="font-serif text-xl text-background">
          GR<span className="text-[var(--gold)] italic">.</span>Nails
        </p>
        <p className="text-xs uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} · Craigieburn · Made with care
        </p>
      </div>
    </footer>
  );
}

/* -------------------------------- Booking Cart ----------------------------- */
const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
];

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/gif"];

function makeBookingRef() {
  const d = new Date();
  const ymd = `${d.getFullYear().toString().slice(-2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GRN-${ymd}-${rand}`;
}

type Step = 1 | 2 | 3 | 4;

function BookingCart({
  open,
  cart,
  onClose,
  onAdd,
  onRemove,
  onClear,
}: {
  open: boolean;
  cart: Record<string, number>;
  onClose: () => void;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [bookingRef] = useState(() => makeBookingRef());
  const [paymentRef, setPaymentRef] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const svc = SERVICES.find((s) => s.id === id);
          if (!svc || qty <= 0) return null;
          return { svc, qty };
        })
        .filter((x): x is { svc: Service; qty: number } => x !== null),
    [cart],
  );
  const total = lines.reduce((sum, l) => sum + l.svc.price * l.qty, 0);
  const count = lines.reduce((sum, l) => sum + l.qty, 0);

  useEffect(() => {
    if (count === 0) setStep(1);
  }, [count]);

  const handleFile = (file: File | undefined | null) => {
    if (!file) return;
    setUploadError(null);
    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
      setUploadError("Please upload a PNG, JPG or GIF image.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError("File is too large. Maximum size is 3MB.");
      return;
    }
    setScreenshot(file);
  };

  const canNext1 = lines.length > 0;
  const canNext2 = name.trim().length > 1 && /^[+\d\s()-]{6,}$/.test(phone) && !!date && !!time;
  const canSubmit = paymentRef.trim().length >= 3 && !!screenshot;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const lineText = lines
        .map((l) => `• ${l.svc.name} ×${l.qty} — $${l.svc.price * l.qty}`)
        .join("%0A");
      const dateStr = date ? format(date, "PPP") : "—";

      console.log("[BookingCart] Uploading payment screenshot to server...");
      const screenshotUpload = screenshot ? await uploadPaymentScreenshot(screenshot) : null;

      console.log("[BookingCart] Saving booking to Firestore...");
      await createBooking({
        reference: bookingRef,
        name,
        phone,
        email,
        date: date ? date.toISOString() : null,
        time,
        services: lines.map((l) => ({
          id: l.svc.id,
          name: l.svc.name,
          qty: l.qty,
          price: l.svc.price,
        })),
        total,
        paymentRef,
        screenshotName: screenshotUpload?.fileName || screenshot?.name || null,
        screenshotUrl: screenshotUpload?.imageUrl || null,
        screenshotPath: screenshotUpload?.imagePath || null,
        notes,
      });
      console.log("[BookingCart] Booking saved successfully. Ref: " + bookingRef);
      setSubmitted(true);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while saving the booking.";
      console.error("[BookingCart] Submission failed:", error);
      setSubmitError(`Booking save failed: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    onClear();
    setStep(1);
    setName("");
    setPhone("");
    setEmail("");
    setDate(undefined);
    setTime("");
    setPaymentRef("");
    setScreenshot(null);
    setUploadError(null);
    setSubmitError(null);
    setNotes("");
    setSubmitted(false);
  };

  const StepDots = () => (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className={cn(
            "h-1.5 rounded-full transition-all",
            step >= n ? "bg-[var(--rose)] w-8" : "bg-border w-4",
          )}
        />
      ))}
    </div>
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full sm:w-[480px] bg-background shadow-2xl transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-border space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--rose)]">
                {submitted ? "Booking Sent" : `Step ${step} of 4`}
              </p>
              <h3 className="font-serif text-2xl mt-1">
                {submitted
                  ? "Thank you!"
                  : step === 1
                    ? `${count} ${count === 1 ? "service" : "services"} selected`
                    : step === 2
                      ? "Choose Date & Time"
                      : step === 3
                        ? "Payment Information"
                        : "Additional Information"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--cream)] rounded-full"
              aria-label="Close booking"
            >
              <X className="size-5" />
            </button>
          </div>
          {!submitted && lines.length > 0 && <StepDots />}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {submitted ? (
            <div className="text-center py-10 space-y-5">
              <div className="size-16 rounded-full bg-[var(--blush)]/40 flex items-center justify-center mx-auto">
                <Check className="size-7 text-[var(--rose)]" />
              </div>
              <div>
                <p className="font-serif text-2xl">Booking request sent</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your reference is <strong>{bookingRef}</strong>. We've opened WhatsApp so you can
                  send your payment screenshot. We'll confirm your appointment shortly.
                </p>
              </div>
              <button
                onClick={() => {
                  resetAll();
                  onClose();
                }}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-xs uppercase tracking-[0.25em]"
              >
                Done
              </button>
            </div>
          ) : lines.length === 0 ? (
            <div className="text-center py-16">
              <div className="size-16 rounded-full bg-[var(--blush)]/30 flex items-center justify-center mx-auto">
                <ShoppingBag className="size-7 text-[var(--rose)]" />
              </div>
              <p className="font-serif text-xl mt-5">Your booking is empty</p>
              <p className="text-sm text-muted-foreground mt-2">
                Browse the menu and add services to begin.
              </p>
              <button
                onClick={onClose}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-xs uppercase tracking-[0.25em]"
              >
                Browse menu
              </button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-4">
                  {lines.map(({ svc, qty }) => (
                    <div
                      key={svc.id}
                      className="flex gap-4 pb-4 border-b border-dashed border-border"
                    >
                      <img
                        src={svc.image}
                        alt={svc.name}
                        className="size-16 object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-lg leading-tight truncate">{svc.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{svc.duration}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="inline-flex items-center bg-[var(--cream)] border border-border">
                            <button
                              onClick={() => onRemove(svc.id)}
                              className="px-2 py-1 hover:bg-[var(--blush)]/30"
                              aria-label="Remove one"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="px-3 text-sm">{qty}</span>
                            <button
                              onClick={() => onAdd(svc.id)}
                              className="px-2 py-1 hover:bg-[var(--blush)]/30"
                              aria-label="Add one"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                          <span className="font-serif text-lg text-[var(--rose)]">
                            ${svc.price * qty}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Full name *
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value.slice(0, 100))}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[var(--rose)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Phone *
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.slice(0, 20))}
                      placeholder="+61 ..."
                      type="tel"
                      className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[var(--rose)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Email (optional)
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value.slice(0, 120))}
                      placeholder="you@example.com"
                      type="email"
                      className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[var(--rose)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Select date *
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 border border-border bg-background text-sm hover:border-[var(--rose)] transition-colors",
                            !date && "text-muted-foreground",
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <CalendarIcon className="size-4" />
                            {date ? format(date, "PPP") : "Pick a date"}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[60]" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(d) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return d < today;
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Select time *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTime(t)}
                          className={cn(
                            "px-2 py-2.5 text-xs border transition-colors",
                            time === t
                              ? "bg-foreground text-background border-foreground"
                              : "bg-background border-border hover:border-[var(--rose)]",
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="bg-[var(--cream)] border border-border p-5 space-y-4">
                    <div className="flex items-center gap-2 text-[var(--rose)]">
                      <CreditCard className="size-4" />
                      <p className="text-xs uppercase tracking-[0.25em]">Please pay to our PayID</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        PayID
                      </p>
                      <p className="font-serif text-2xl">{STUDIO.payId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        Name
                      </p>
                      <p className="font-serif text-lg">{STUDIO.payIdName}</p>
                    </div>
                    <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          BSB
                        </p>
                        <p className="font-serif text-lg">{STUDIO.bsb}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          Account
                        </p>
                        <p className="font-serif text-lg">{STUDIO.accountNumber}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Use your booking reference{" "}
                      <strong className="text-foreground">{bookingRef}</strong> as the payment
                      reference.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Payment reference *
                    </label>
                    <input
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value.slice(0, 60))}
                      placeholder={bookingRef}
                      className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[var(--rose)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Payment screenshot *
                    </label>
                    <label className="block border-2 border-dashed border-border rounded-sm p-6 text-center cursor-pointer hover:border-[var(--rose)] transition-colors">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/gif"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                      />
                      {screenshot ? (
                        <div className="space-y-2">
                          <Check className="size-6 text-[var(--rose)] mx-auto" />
                          <p className="text-sm font-medium truncate">{screenshot.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(screenshot.size / 1024).toFixed(0)} KB · tap to replace
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="size-6 text-muted-foreground mx-auto" />
                          <p className="text-sm">Tap to upload screenshot</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 3MB</p>
                        </div>
                      )}
                    </label>
                    {uploadError && (
                      <p className="flex items-center gap-1.5 text-xs text-destructive">
                        <AlertCircle className="size-3.5" />
                        {uploadError}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Special requests (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                      rows={4}
                      placeholder="Colour preferences, nail art ideas, allergies, anything we should know..."
                      className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:border-[var(--rose)] resize-none"
                    />
                    <p className="text-[11px] text-muted-foreground text-right">
                      {notes.length}/500
                    </p>
                  </div>

                  <div className="bg-[var(--cream)] border border-border p-5 space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--rose)]">
                      Review
                    </p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Name:</span> {name}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Phone:</span> {phone}
                      </p>
                      <p>
                        <span className="text-muted-foreground">When:</span>{" "}
                        {date ? format(date, "PPP") : "—"} at {time || "—"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Ref:</span>{" "}
                        <strong>{bookingRef}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!submitted && lines.length > 0 && (
          <div className="border-t border-border p-5 space-y-3 bg-[var(--cream)]">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Total
              </span>
              <span className="font-serif text-2xl text-[var(--rose)]">${total}</span>
            </div>
            <div className="flex gap-2">
              {step > 1 && (
                <button
                  onClick={() => setStep((s) => (s - 1) as Step)}
                  className="flex-1 px-4 py-3 border border-foreground/40 text-xs uppercase tracking-[0.25em] hover:bg-foreground hover:text-background transition-colors"
                >
                  Back
                </button>
              )}
              {step < 4 && (
                <button
                  onClick={() => setStep((s) => (s + 1) as Step)}
                  disabled={step === 1 ? !canNext1 : step === 2 ? !canNext2 : !canSubmit}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background text-xs uppercase tracking-[0.25em] hover:bg-[var(--rose)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              )}
              {step === 4 && (
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background text-xs uppercase tracking-[0.25em] hover:bg-[var(--rose)] transition-colors disabled:opacity-40"
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  Confirm booking
                </button>
              )}
            </div>
            {submitError && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-sm">
                <p className="text-xs text-destructive font-medium">{submitError}</p>
                <p className="text-[11px] text-destructive/70 mt-1">Check browser console for details.</p>
              </div>
            )}
            {step === 1 && (
              <button
                onClick={onClear}
                className="w-full text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-[var(--rose)]"
              >
                Clear selection
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

/* ---------------------------------- Page ---------------------------------- */
function Home() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const remove = (id: string) =>
    setCart((c) => {
      const next = { ...c, [id]: Math.max(0, (c[id] ?? 0) - 1) };
      if (next[id] === 0) delete next[id];
      return next;
    });

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Header cartCount={count} onOpenCart={() => setCartOpen(true)} />
      <main>
        <Hero />
        <About />
        <WhyUs />
        <Services cart={cart} onAdd={add} onRemove={remove} />
        <Visit />
      </main>
      <Footer />

      {count > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-3 px-6 py-4 rounded-full bg-foreground text-background shadow-2xl hover:bg-[var(--rose)] transition-colors"
        >
          <ShoppingBag className="size-5" />
          <span className="text-xs uppercase tracking-[0.25em]">{count} · View booking</span>
        </button>
      )}

      <BookingCart
        open={cartOpen}
        cart={cart}
        onClose={() => setCartOpen(false)}
        onAdd={add}
        onRemove={remove}
        onClear={() => setCart({})}
      />
    </div>
  );
}
