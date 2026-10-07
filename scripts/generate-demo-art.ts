/**
 * Gera as ilustrações SVG dos produtos de demonstração em public/demo.
 * Uso: npm run demo:art
 * Apenas para o conteúdo DEMO — produtos reais usam fotos do admin.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { demoArt, demoCollectionArt, type ArtKind } from "../src/data/demo/art.ts";

const OUT = join(process.cwd(), "public", "demo");

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => {
    const v = (n >> s) & 255;
    const t = amt < 0 ? 0 : 255;
    return Math.round(v + (t - v) * Math.abs(amt));
  };
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, "0")).join("")}`;
}
const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 150;
};

let uid = 0;
/** Gradiente do corpo do objeto, com luz dourada sutil na borda */
function bodyGrad(c: string): { id: string; def: string } {
  const id = `g${++uid}`;
  return {
    id,
    def: `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(c, 0.22)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -0.35)}"/></linearGradient>`,
  };
}
const rim = (c: string) => (isLight(c) ? shade(c, -0.25) : shade(c, 0.28));

function screen(x: number, y: number, w: number, h: number, r: number): string {
  const id = `s${++uid}`;
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a1f0b"/><stop offset=".45" stop-color="#14141a"/><stop offset="1" stop-color="#0b0b10"/></linearGradient></defs>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${id})"/>
  <path d="M${x + w * 0.1} ${y + h} L${x + w * 0.62} ${y} L${x + w * 0.78} ${y} L${x + w * 0.26} ${y + h}Z" fill="#fff" opacity=".04"/>
  <text x="${x + w / 2}" y="${y + h / 2 + 14}" text-anchor="middle" font-family="Georgia,serif" font-size="${Math.min(w, h) * 0.32}" fill="#d9a93b" opacity=".85">Ω</text>`;
}

const draw: Record<ArtKind, (c: string, view: number) => string> = {
  phone: (c, view) => {
    const g = bodyGrad(c);
    if (view < 0)
      return `<defs>${g.def}</defs><rect x="270" y="130" width="260" height="540" rx="46" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>
      ${screen(282, 142, 236, 516, 36)}<rect x="360" y="160" width="80" height="22" rx="11" fill="#000"/>`;
    return `<defs>${g.def}</defs><rect x="270" y="130" width="260" height="540" rx="46" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>
      <rect x="292" y="152" width="112" height="112" rx="30" fill="${shade(c, -0.15)}" stroke="${rim(c)}" stroke-width="2"/>
      <circle cx="325" cy="185" r="22" fill="#0c0c10" stroke="${rim(c)}" stroke-width="4"/><circle cx="371" cy="231" r="22" fill="#0c0c10" stroke="${rim(c)}" stroke-width="4"/>
      <circle cx="380" cy="176" r="6" fill="${shade(c, 0.4)}"/>`;
  },
  "phone-pro": (c, view) => {
    const g = bodyGrad(c);
    if (view < 0)
      return `<defs>${g.def}</defs><rect x="268" y="124" width="264" height="552" rx="44" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="4"/>
      ${screen(278, 134, 244, 532, 36)}<circle cx="400" cy="160" r="9" fill="#000"/>`;
    return `<defs>${g.def}</defs><rect x="268" y="124" width="264" height="552" rx="44" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="4"/>
      <rect x="288" y="144" width="150" height="150" rx="38" fill="${shade(c, -0.12)}" stroke="${rim(c)}" stroke-width="2"/>
      ${[[328, 184], [328, 254], [398, 219]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="27" fill="#0b0b0f" stroke="${rim(c)}" stroke-width="5"/><circle cx="${x}" cy="${y}" r="10" fill="#1d2a3f"/>`).join("")}
      <circle cx="410" cy="170" r="7" fill="${shade(c, 0.45)}"/>`;
  },
  tablet: (c) => {
    const g = bodyGrad(c);
    return `<defs>${g.def}</defs><rect x="190" y="150" width="420" height="520" rx="34" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>${screen(206, 166, 388, 488, 22)}`;
  },
  console: (c) => {
    const g = bodyGrad(c);
    return `<defs>${g.def}</defs>
      <path d="M330 110 C300 260 300 560 318 700 L370 700 L370 110Z" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>
      <path d="M470 110 C500 260 500 560 482 700 L430 700 L430 110Z" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>
      <rect x="368" y="130" width="64" height="566" rx="10" fill="#111216"/>
      <rect x="390" y="560" width="20" height="8" rx="4" fill="#3b7bff" opacity=".8"/>`;
  },
  controller: (c) => {
    const g = bodyGrad(c);
    const dark = isLight(c) ? "#1b1c21" : shade(c, -0.4);
    return `<defs>${g.def}</defs>
      <path d="M240 320 C270 270 530 270 560 320 C620 420 660 560 600 590 C560 610 530 540 500 500 L300 500 C270 540 240 610 200 590 C140 560 180 420 240 320Z" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>
      <path d="M330 300 L470 300 L460 400 L340 400Z" fill="${dark}" opacity=".85"/>
      <circle cx="330" cy="450" r="34" fill="${dark}"/><circle cx="470" cy="450" r="34" fill="${dark}"/>
      <circle cx="330" cy="450" r="20" fill="#2a2b31"/><circle cx="470" cy="450" r="20" fill="#2a2b31"/>
      ${[[540, 360], [570, 390], [540, 420], [510, 390]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="none" stroke="${dark}" stroke-width="4"/>`).join("")}
      <path d="M250 375 h40 M270 355 v40" stroke="${dark}" stroke-width="12" stroke-linecap="round"/>
      <rect x="368" y="408" width="64" height="5" rx="2" fill="#3b7bff"/>`;
  },
  headset: (c) => {
    const g = bodyGrad(c);
    return `<defs>${g.def}</defs>
      <path d="M220 470 C220 220 580 220 580 470" fill="none" stroke="${shade(c, -0.1)}" stroke-width="34" stroke-linecap="round"/>
      <path d="M240 470 C240 260 560 260 560 470" fill="none" stroke="#1b1c21" stroke-width="14" stroke-linecap="round"/>
      <rect x="170" y="420" width="120" height="190" rx="56" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>
      <rect x="510" y="420" width="120" height="190" rx="56" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>
      <rect x="276" y="450" width="26" height="130" rx="12" fill="#1b1c21"/><rect x="498" y="450" width="26" height="130" rx="12" fill="#1b1c21"/>`;
  },
  earbuds: (c) => {
    const g = bodyGrad(c);
    return `<defs>${g.def}</defs>
      <rect x="250" y="360" width="300" height="230" rx="80" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>
      <path d="M250 440 H550" stroke="${rim(c)}" stroke-width="3"/><circle cx="400" cy="520" r="6" fill="#3ccf8e"/>
      ${[310, 490].map((x, i) => `<g transform="rotate(${i ? 18 : -18} ${x} 300)"><ellipse cx="${x}" cy="270" rx="38" ry="44" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/><rect x="${x - 13}" y="290" width="26" height="90" rx="13" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/></g>`).join("")}`;
  },
  speaker: (c) => {
    const g = bodyGrad(c);
    return `<defs>${g.def}</defs>
      <rect x="190" y="290" width="420" height="260" rx="90" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>
      <circle cx="400" cy="420" r="92" fill="${shade(c, -0.25)}"/>
      <circle cx="400" cy="420" r="92" fill="url(#dots)" opacity=".5"/>
      <rect x="360" y="408" width="80" height="24" rx="8" fill="${shade(c, 0.3)}"/>
      <rect x="205" y="260" width="40" height="40" rx="14" fill="none" stroke="${rim(c)}" stroke-width="8"/>`;
  },
  laptop: (c) => {
    const g = bodyGrad(c);
    return `<defs>${g.def}</defs>
      <rect x="180" y="190" width="440" height="300" rx="16" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>
      ${screen(196, 206, 408, 268, 8)}
      <path d="M130 500 H670 L640 560 H160Z" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>
      <path d="M200 510 H600" stroke="#c0392b" stroke-width="3" opacity=".7"/>
      <rect x="350" y="530" width="100" height="14" rx="5" fill="${shade(c, -0.3)}"/>`;
  },
  pc: (c) => {
    const g = bodyGrad("#18181d");
    return `<defs>${g.def}</defs>
      <rect x="250" y="130" width="300" height="560" rx="20" fill="url(#${g.id})" stroke="#34343c" stroke-width="3"/>
      <rect x="270" y="150" width="190" height="520" rx="10" fill="#0d0d12" stroke="${c}" stroke-opacity=".5" stroke-width="2"/>
      ${[230, 380, 530].map((y) => `<circle cx="365" cy="${y}" r="58" fill="none" stroke="${c}" stroke-width="6"/><circle cx="365" cy="${y}" r="14" fill="${c}" opacity=".9"/>`).join("")}
      <rect x="480" y="150" width="50" height="520" rx="8" fill="#1e1e24"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="490" y="${180 + i * 30}" width="30" height="6" rx="3" fill="#2c2c34"/>`).join("")}
      <circle cx="505" cy="640" r="10" fill="none" stroke="${c}" stroke-width="3"/>`;
  },
  case: (c) => {
    const g = bodyGrad(c);
    return `<defs>${g.def}</defs>
      <rect x="276" y="130" width="248" height="540" rx="52" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="4"/>
      <rect x="296" y="150" width="122" height="122" rx="32" fill="#0b0b0f" stroke="${rim(c)}" stroke-width="3"/>
      <circle cx="400" cy="440" r="70" fill="none" stroke="${rim(c)}" stroke-width="3" opacity=".6"/>
      <rect x="392" y="520" width="16" height="40" rx="4" fill="${rim(c)}" opacity=".6"/>`;
  },
  film: (c) => `<g transform="rotate(-8 400 400)">
      <rect x="270" y="150" width="270" height="520" rx="40" fill="${c}" opacity=".18" stroke="${shade(c, 0.4)}" stroke-width="3"/>
      <rect x="250" y="130" width="270" height="520" rx="40" fill="${c}" opacity=".3" stroke="${shade(c, 0.55)}" stroke-width="3"/>
      <path d="M290 640 L470 140 L510 140 L330 640Z" fill="#fff" opacity=".18"/>
      <rect x="355" y="150" width="60" height="16" rx="8" fill="${shade(c, 0.6)}" opacity=".6"/>
      <text x="385" y="430" text-anchor="middle" font-family="Arial" font-weight="700" font-size="44" fill="#fff" opacity=".55">9H</text></g>`,
  charger: (c) => {
    const g = bodyGrad(c);
    return `<defs>${g.def}</defs>
      <rect x="300" y="300" width="200" height="220" rx="32" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>
      <rect x="370" y="470" width="60" height="18" rx="9" fill="#2a2b31"/>
      <rect x="350" y="230" width="18" height="80" rx="4" fill="#c9cbd1"/><rect x="432" y="230" width="18" height="80" rx="4" fill="#c9cbd1"/>
      <text x="400" y="410" text-anchor="middle" font-family="Arial" font-weight="700" font-size="40" fill="${rim(c)}">20W</text>`;
  },
  cable: (c) =>
    `<path d="M240 250 C560 200 600 360 400 400 C200 440 220 600 560 560" fill="none" stroke="${c}" stroke-width="18" stroke-linecap="round"/>
     <rect x="180" y="226" width="80" height="44" rx="12" fill="${shade(c, -0.08)}" stroke="#bbb" stroke-width="2"/><rect x="140" y="236" width="44" height="24" rx="6" fill="#c9cbd1"/>
     <rect x="540" y="538" width="80" height="44" rx="12" fill="${shade(c, -0.08)}" stroke="#bbb" stroke-width="2"/><rect x="616" y="550" width="40" height="20" rx="4" fill="#c9cbd1"/>`,
  hdmi: (c) =>
    `<path d="M220 260 C560 220 600 380 400 410 C200 440 220 600 560 560" fill="none" stroke="${c}" stroke-width="22" stroke-linecap="round"/>
     <rect x="160" y="230" width="90" height="56" rx="10" fill="#2b2c33" stroke="#d9a93b" stroke-width="3"/><path d="M110 240 h52 v36 h-52 l-8 -10 v-16z" fill="#c9cbd1"/>
     <rect x="540" y="530" width="90" height="56" rx="10" fill="#2b2c33" stroke="#d9a93b" stroke-width="3"/><path d="M628 540 h52 l8 10 v16 l-8 10 h-52z" fill="#c9cbd1"/>`,
  tshirt: (c) => {
    const g = bodyGrad(c);
    const ink = isLight(c) ? "#1a1203" : "#d9a93b";
    return `<defs>${g.def}</defs>
      <path d="M300 170 L240 190 L120 290 L190 380 L250 330 L250 660 L550 660 L550 330 L610 380 L680 290 L560 190 L500 170 C480 220 320 220 300 170Z" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>
      <text x="400" y="430" text-anchor="middle" font-family="Georgia,serif" font-size="150" fill="${ink}">Ω</text>
      <text x="400" y="500" text-anchor="middle" font-family="Arial" font-weight="700" letter-spacing="6" font-size="22" fill="${ink}">OMEGA</text>`;
  },
  hoodie: (c) => {
    const g = bodyGrad(c);
    return `<defs>${g.def}</defs>
      <path d="M310 190 L230 220 L140 420 L150 640 L230 640 L250 400 L250 670 L550 670 L550 400 L570 640 L650 640 L660 420 L570 220 L490 190 C480 120 320 120 310 190Z" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>
      <path d="M330 200 C340 260 460 260 470 200" fill="none" stroke="${rim(c)}" stroke-width="3"/>
      <path d="M300 520 H500 L480 600 H320Z" fill="${shade(c, -0.2)}" stroke="${rim(c)}" stroke-width="2"/>
      <path d="M340 330 l60 -40 l60 40 l-60 40z" fill="none" stroke="#d9a93b" stroke-width="5"/>`;
  },
  watch: (c) => {
    const g = bodyGrad(c);
    return `<defs>${g.def}</defs>
      <rect x="330" y="120" width="140" height="190" rx="30" fill="${shade(c, -0.1)}"/><rect x="330" y="490" width="140" height="190" rx="30" fill="${shade(c, -0.1)}"/>
      <rect x="280" y="270" width="240" height="260" rx="60" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="4"/>
      ${screen(300, 290, 200, 220, 46)}`;
  },
  game: (c) =>
    `<rect x="250" y="140" width="300" height="520" rx="14" fill="#14141a" stroke="#2c2c34" stroke-width="3"/>
     <rect x="250" y="140" width="300" height="56" rx="14" fill="${c}"/><rect x="250" y="180" width="300" height="16" fill="${c}"/>
     <rect x="272" y="160" width="60" height="16" rx="4" fill="#fff" opacity=".85"/>
     <rect x="270" y="215" width="260" height="420" rx="6" fill="url(#gameArt)"/>
     <defs><linearGradient id="gameArt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a1d0a"/><stop offset=".5" stop-color="#1a1a28"/><stop offset="1" stop-color="#0c0c12"/></linearGradient></defs>
     <path d="M270 520 L400 360 L530 520Z" fill="#d9a93b" opacity=".35"/><circle cx="460" cy="300" r="34" fill="#f3cf6c" opacity=".5"/>`,
  stand: (c) => {
    const g = bodyGrad(c);
    return `<defs>${g.def}</defs>
      <rect x="250" y="600" width="300" height="70" rx="18" fill="url(#${g.id})" stroke="#d9a93b" stroke-opacity=".5" stroke-width="2"/>
      <path d="M360 120 C335 260 335 500 350 600 L450 600 C465 500 465 260 440 120Z" fill="#e9e9ee" opacity=".9"/>
      <rect x="378" y="135" width="44" height="460" rx="6" fill="#111216"/>
      ${[290, 510].map((x) => `<rect x="${x - 26}" y="520" width="52" height="80" rx="10" fill="#2a2b31"/><circle cx="${x}" cy="635" r="8" fill="#3ccf8e"/>`).join("")}
      ${[290, 320, 480, 510].map((x) => `<rect x="${x - 2}" y="610" width="4" height="50" fill="#2c2c34"/>`).join("")}`;
  },
  mouse: (c) => {
    const g = bodyGrad(c);
    return `<defs>${g.def}</defs>
      <path d="M400 170 C520 170 560 300 560 420 C560 560 490 640 400 640 C310 640 240 560 240 420 C240 300 280 170 400 170Z" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>
      <path d="M400 175 V330" stroke="#0b0b0f" stroke-width="4"/><rect x="386" y="220" width="28" height="60" rx="14" fill="#2a2b31"/>
      <path d="M260 470 C300 600 500 600 540 470" fill="none" stroke="url(#rgb)" stroke-width="8"/>
      <defs><linearGradient id="rgb"><stop offset="0" stop-color="#ff3b6b"/><stop offset=".5" stop-color="#7a5cff"/><stop offset="1" stop-color="#2ad4ff"/></linearGradient></defs>`;
  },
  keyboard: (c) => {
    const g = bodyGrad(c);
    const keys: string[] = [];
    for (let r = 0; r < 5; r++)
      for (let k = 0; k < 14; k++)
        keys.push(`<rect x="${158 + k * 35}" y="${315 + r * 36}" width="29" height="29" rx="5" fill="#2a2b31" stroke="${["#ff3b6b", "#7a5cff", "#2ad4ff", "#3ccf8e", "#d9a93b"][r]}" stroke-opacity=".7" stroke-width="1.5"/>`);
    return `<defs>${g.def}</defs><rect x="140" y="295" width="520" height="210" rx="16" fill="url(#${g.id})" stroke="${rim(c)}" stroke-width="3"/>${keys.join("")}`;
  },
};

function wrap(inner: string, label?: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <radialGradient id="bg" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#25252d"/><stop offset=".6" stop-color="#141419"/><stop offset="1" stop-color="#0c0c10"/></radialGradient>
    <radialGradient id="floor" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#d9a93b" stop-opacity=".35"/><stop offset="1" stop-color="#d9a93b" stop-opacity="0"/></radialGradient>
    <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="3" fill="#000"/></pattern>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <ellipse cx="400" cy="715" rx="260" ry="40" fill="url(#floor)"/>
  ${inner}
  ${label ? `<text x="40" y="770" font-family="Arial" font-size="18" letter-spacing="3" fill="#75726c">${label}</text>` : ""}
</svg>`;
}

mkdirSync(join(OUT, "products"), { recursive: true });
mkdirSync(join(OUT, "collections"), { recursive: true });

let count = 0;
for (const [slug, art] of Object.entries(demoArt)) {
  art.colors.forEach((color, i) => {
    writeFileSync(join(OUT, "products", `${slug}-${i + 1}.svg`), wrap(draw[art.kind](color, i), "IMAGEM ILUSTRATIVA"));
    count++;
  });
}

/** Banners de coleção: 3 objetos lado a lado em formato largo */
for (const [slug, art] of Object.entries(demoCollectionArt)) {
  const items = art.kinds
    .map((kind, i) => {
      const cx = [640, 870, 1090][i];
      const sc = i === 1 ? 0.62 : 0.5;
      const dy = i === 1 ? 20 : 90;
      return `<g transform="translate(${cx - 400 * sc} ${dy}) scale(${sc})">${draw[kind](art.colors[i], 0)}</g>`;
    })
    .join("");
  writeFileSync(
    join(OUT, "collections", `${slug}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" width="1200" height="600">
  <defs><pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="3" fill="#000"/></pattern>
  <radialGradient id="cbg" cx=".75" cy=".45" r=".8"><stop offset="0" stop-color="#2a2418"/><stop offset=".55" stop-color="#15151a"/><stop offset="1" stop-color="#0c0c10"/></radialGradient></defs>
  <rect width="1200" height="600" fill="url(#cbg)"/>
  ${items}
</svg>`,
  );
  count++;
}
console.log(`✓ ${count} ilustrações geradas em public/demo`);
