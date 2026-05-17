# 3D Icon System

LaundryHub punya signature design dengan 3D illustrated icons. 2 layer system: **Icon3D wrapper** + **custom SVG illustrations**.

## Layer 1: `<Icon3D>` Wrapper

Container glassmorphism yang membungkus icon apa pun (lucide, emoji, SVG) dengan effect 3D.

### File

`src/components/ui/icon3d.tsx`

### Features

✅ Tilt-on-hover (mouse-tracked perspective)  
✅ Gradient surface (10 color variants)  
✅ Inner highlight + outer shadow  
✅ Animations: float / wiggle / spin  
✅ 4 sizes: sm / md / lg / xl  

### Usage

```tsx
import { Icon3D } from "@/components/ui/icon3d";
import { Sparkles } from "lucide-react";

<Icon3D variant="blue" size="md" animate="float">
  <Sparkles size={20} />
</Icon3D>
```

### Props

| Prop          | Type                                       | Default   |
| ------------- | ------------------------------------------ | --------- |
| `children`    | ReactNode (icon to wrap)                   | required  |
| `variant`     | `blue` / `cyan` / `purple` / `pink` / `amber` / `green` / `red` / `indigo` / `teal` / `orange` | `blue`   |
| `size`        | `sm` / `md` / `lg` / `xl`                  | `md`      |
| `animate`     | `float` / `wiggle` / `spin` / `none`       | `none`    |
| `interactive` | `boolean` — enable mouse-tilt              | `true`    |
| `className`   | string                                     | —         |

### Size Map

```
sm:  9×9   text-base   rounded-xl
md:  12×12 text-xl     rounded-2xl
lg:  16×16 text-2xl    rounded-2xl
xl:  20×20 text-3xl    rounded-3xl
```

### Color Variants

```typescript
const variantStyles = {
  blue:    { from: "#60a5fa", to: "#2563eb", shadow: "rgba(37,99,235,0.45)" },
  cyan:    { from: "#67e8f9", to: "#0891b2", shadow: "rgba(8,145,178,0.45)" },
  purple:  { from: "#c084fc", to: "#7c3aed", shadow: "rgba(124,58,237,0.45)" },
  pink:    { from: "#f9a8d4", to: "#db2777", shadow: "rgba(219,39,119,0.45)" },
  amber:   { from: "#fcd34d", to: "#d97706", shadow: "rgba(217,119,6,0.45)" },
  green:   { from: "#86efac", to: "#16a34a", shadow: "rgba(22,163,74,0.45)" },
  red:     { from: "#fca5a5", to: "#dc2626", shadow: "rgba(220,38,38,0.45)" },
  indigo:  { from: "#a5b4fc", to: "#4338ca", shadow: "rgba(67,56,202,0.45)" },
  teal:    { from: "#5eead4", to: "#0d9488", shadow: "rgba(13,148,136,0.45)" },
  orange:  { from: "#fdba74", to: "#ea580c", shadow: "rgba(234,88,12,0.45)" },
};
```

### CSS Foundation

`globals.css`:

```css
.icon-3d {
  position: relative;
  display: inline-flex;
  background: linear-gradient(135deg, var(--from), var(--to));
  box-shadow:
    0 10px 30px -8px var(--shadow),
    inset 0 -4px 8px rgba(0, 0, 0, 0.15),
    inset 0 4px 8px rgba(255, 255, 255, 0.3);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.icon-3d::before {
  /* Top highlight (white-to-transparent gradient) */
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
    rgba(255,255,255,0.4) 0%,
    rgba(255,255,255,0) 50%);
}

.icon-3d::after {
  /* Bottom shadow (drop shadow) */
  content: "";
  position: absolute;
  bottom: -10%;
  background: radial-gradient(ellipse, var(--shadow), transparent 70%);
  filter: blur(4px);
}
```

### Tilt Mechanism

```tsx
const [tilt, setTilt] = useState({ x: 0, y: 0 });

function handleMouseMove(e) {
  const rect = ref.current.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
  const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
  setTilt({ x: y, y: x });
}

style={{
  transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
}}
```

Mouse position di icon dipetakan ke rotation angle (max ±10°). Smooth transition saat mouse leave.

## Layer 2: Custom 3D SVG Icons

Standalone illustrated SVG icons yang sudah punya 3D look bawaan (gradient, highlight, shadow).

### File

`src/components/ui/laundry-icons.tsx`

### Available Icons (30+)

| Icon                | Use case                                   |
| ------------------- | ------------------------------------------ |
| `WashingMachine3D`  | Mesin cuci dengan animated bubbles         |
| `ShirtFolded3D`     | Baju lipat                                 |
| `Hanger3D`          | Hanger / wadah cuci                        |
| `SoapBubbles3D`     | Buih sabun                                 |
| `TruckDelivery3D`   | Truk pickup/delivery                       |
| `Receipt3D`         | Invoice / kuitansi                         |
| `Chart3D`           | Bar chart                                  |
| `Whatsapp3D`        | Logo WhatsApp                              |
| `Sparkles3D`        | Bintang (untuk AI / featured)              |
| `Bag3D`             | Tas laundry                                |
| `Sneaker3D`         | Sepatu                                     |
| `User3D`            | Avatar customer                            |
| `QRCode3D`          | QR code                                    |
| `Crown3D`           | Mahkota (Platinum tier)                    |
| `Detergent3D`       | Botol detergent                            |
| `Perfume3D`         | Botol parfum                               |
| `Package3D`         | Kotak isometrik                            |
| `Avatar3D`          | Generic avatar (6 color variants)          |
| `Money3D`           | Uang dengan symbol Rp                      |
| `Diamond3D`         | Berlian                                    |
| `Trophy3D`          | Piala                                      |
| `Bolt3D`            | Petir (express)                            |
| `CartIcon3D`        | Keranjang belanja                          |
| `AlertWarning3D`    | Segitiga peringatan                        |
| `HouseSimple3D`     | Rumah (tenant)                             |
| `Megaphone3D`       | Megaphone (broadcast)                      |
| `Confetti3D`        | Konfeti (celebration)                      |
| `ScissorsTag3D`     | Tag harga                                  |
| `RecycleArrows3D`   | Recycle (repeat order)                     |
| `ZzzMoon3D`         | Bulan tidur (inactive)                     |
| `ChemicalFlask3D`   | Labu kimia                                 |
| `Scooter3D`         | Skuter driver                              |
| `CarSimple3D`       | Mobil                                      |
| `ClockFast3D`       | Jam (waktu)                                |

### Usage

```tsx
import { WashingMachine3D } from "@/components/ui/laundry-icons";

<WashingMachine3D className="w-12 h-12" />
```

Default size jika tidak `className`: `w-10 h-10`.

### Anatomi SVG

Setiap icon menggunakan SVG `viewBox="0 0 64 64"` dengan:

1. **Linear gradients** untuk dimensi (light-to-dark)
2. **Radial gradients** untuk volumetric (orbs, bubbles)
3. **Stroke + fill** untuk outline
4. **Highlights** white opacity overlays

Contoh structure:

```tsx
export function WashingMachine3D({ className }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("drop-shadow-lg", className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="wm-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
        <radialGradient id="wm-window">
          ...
        </radialGradient>
      </defs>
      
      {/* Body */}
      <rect ... fill="url(#wm-body)" stroke="#0284c7" />
      
      {/* Window with bubbles */}
      <circle cx="32" cy="32" r="16" fill="url(#wm-window)" />
      
      {/* Animated bubbles */}
      <circle cx="28" cy="28" r="3" className="animate-float" />
      
      {/* Status LED */}
      <circle cx="50" cy="13" r="2" fill="#22c55e" />
    </svg>
  );
}
```

## Combining Both

Best UX: pakai 3D SVG icon **inside** Icon3D wrapper:

```tsx
<Icon3D variant="blue" size="lg" animate="float">
  <WashingMachine3D className="w-9 h-9" />
</Icon3D>
```

## When to Use What

| Context                          | Recommendation                              |
| -------------------------------- | ------------------------------------------- |
| Stat card icon                   | `Icon3D` + custom 3D SVG                    |
| Sidebar nav icon                 | `Icon3D` + lucide icon                      |
| Chip / badge inline              | lucide (no 3D wrapper, terlalu besar)       |
| Hero illustration                | Custom 3D SVG (no wrapper, large standalone)|
| Empty state                      | `Icon3D` + 3D SVG, size `xl`                |
| Quick action button              | Custom 3D SVG (visual hero)                 |

## Adding New 3D Icon

1. Open `src/components/ui/laundry-icons.tsx`
2. Append new component:

```tsx
export function MyNewIcon3D({ className }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={cn(base, className ?? "w-10 h-10")}>
      <defs>
        <linearGradient id="my-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path d="..." fill="url(#my-grad)" stroke="#92400e" strokeWidth="1.4" />
    </svg>
  );
}
```

3. Use `viewBox="0 0 64 64"` for consistency
4. Always include `cn(base, className ?? "w-10 h-10")` for default sizing
5. **Unique gradient IDs** — use prefix to avoid conflicts (`wm-body`, `dt-cap`, etc)

## Accessibility

3D icons are decorative. For functional icons:

```tsx
<button aria-label="Cetak invoice">
  <Receipt3D className="w-5 h-5" />
</button>
```

Or use lucide icon dengan accessibility props:

```tsx
<Printer size={16} aria-label="Print" />
```

## Performance

### Inline SVG (current)

✅ No HTTP request  
✅ Style able via CSS  
✅ Animatable  
❌ Increases JS bundle size  

For 30+ icons: ~50KB total. Acceptable.

### Future: SVG sprite

If bundle size becomes issue:

```tsx
// Generate sprite at build time
<svg><use href="#washing-machine-3d" /></svg>
```

### Lazy load

Heavy icons used rarely:

```tsx
const Trophy3D = dynamic(() => import("./laundry-icons").then(m => m.Trophy3D));
```

## No Emoji Policy

Project sengaja **tidak pakai emoji** untuk:
- Konsistensi cross-platform (emoji render beda-beda di OS)
- Branding professional
- Better accessibility (emoji bisa confusing untuk screen reader)

Gunakan lucide icons atau custom 3D SVG selalu.

## Design Tokens

3D icon design ditranslate jadi tokens Tailwind config:

```ts
// tailwind.config.ts
animation: {
  float: "float 4s ease-in-out infinite",
  wiggle: "wiggle 2s ease-in-out infinite",
  bubble: "bubble 3s ease-out infinite",
},
boxShadow: {
  "3d": "0 10px 30px -10px rgba(59,130,246,0.4)...",
  glow: "0 0 30px rgba(59,130,246,0.5)",
},
```

## Selanjutnya

- [Frontend Guide](./frontend-guide.md)
- [Architecture](./architecture.md)
