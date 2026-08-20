export type Product = {
  id: string;
  slug: string;
  sku?: string;
  name: string;
  category: string;
  categoryId?: string;
  price: number;
  oldPrice?: number;
  description: string;
  featured?: boolean;
  popular?: boolean;
  stock: number;
  image: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  seoTitle?: string | null;
  metaDescription?: string | null;
  images?: Array<{
    id: string;
    mediaId?: string | null;
    url: string;
    alt?: string | null;
    order: number;
    isPrimary: boolean;
  }>;
  videos?: Array<{
    id: string;
    mediaId: string;
    url: string;
    mimeType: string;
    order: number;
  }>;
};
export type Article = {
  id: number | string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
  content?: string;
  media?: Array<{
    id: string;
    url: string;
    fileType: string;
    mimeType: string;
    alt?: string | null;
    caption?: string | null;
  }>;
};
export const categories = [
  "کودهای ارگانیک",
  "کودهای ماکرو",
  "کودهای میکرو",
  "آمینو اسید",
  "اصلاح‌کننده آب و خاک",
  "کودهای زیستی",
  "صابون و امولسیفایر",
  "آفت‌کش‌ها",
];
const gradients = ["#dce4d6", "#e9e2d3", "#d6e1dc", "#ebe4d4"];
export const initialProducts: Product[] = Array.from(
  { length: 12 },
  (_, i) => ({
    id: String(i + 1),
    slug: [
      "bio-root",
      "green-npk",
      "micro-plus",
      "amino-grow",
      "soil-care",
      "calcium-boron",
      "humic-pro",
      "seaweed-max",
      "iron-chelate",
      "potassium-plus",
      "bio-shield",
      "leaf-shine",
    ][i],
    name: [
      "ریشه‌زای زیستی بایو روت",
      "کود کامل گرین NPK",
      "میکرو پلاس جوانه",
      "آمینو گرو",
      "اصلاح‌کننده سالت‌کر",
      "کلسیم بور",
      "هیومیک پرو",
      "عصاره جلبک سی‌مکس",
      "کلات آهن سبزینه",
      "پتاسیم پلاس",
      "محافظ زیستی بایوشیلد",
      "صابون کشاورزی برگ‌تاب",
    ][i],
    category: categories[i % categories.length],
    price: 385000 + i * 47000,
    oldPrice: i % 3 === 0 ? 480000 + i * 47000 : undefined,
    description:
      "محصول تخصصی برای بهبود تغذیه و سلامت گیاه. اطلاعات مصرف باید بر اساس آزمون خاک و نظر کارشناس تعیین شود.",
    featured: i < 4,
    stock: i === 7 ? 0 : 10 + i,
    image: gradients[i % 4],
  }),
);
export const initialArticles: Article[] = [
  {
    id: 1,
    slug: "soil-test",
    title: "آزمون خاک؛ اولین قدم یک برنامه تغذیه دقیق",
    excerpt: "چطور نتیجه آزمون خاک را به تصمیم‌های بهتر برای مزرعه تبدیل کنیم؟",
    category: "تغذیه گیاه",
    image: gradients[0],
    date: "۲۴ مرداد ۱۴۰۵",
  },
  {
    id: 2,
    slug: "summer-stress",
    title: "مدیریت تنش گرما در باغ",
    excerpt: "نشانه‌های تنش و اقدام‌های ایمن و قابل اجرا برای روزهای گرم.",
    category: "مدیریت باغ",
    image: gradients[1],
    date: "۱۸ مرداد ۱۴۰۵",
  },
  {
    id: 3,
    slug: "irrigation",
    title: "آبیاری هوشمند و سلامت ریشه",
    excerpt: "زمان‌بندی درست آبیاری چه اثری بر جذب عناصر غذایی دارد؟",
    category: "آب و خاک",
    image: gradients[2],
    date: "۱۰ مرداد ۱۴۰۵",
  },
  {
    id: 4,
    slug: "fertilizer-label",
    title: "چطور برچسب کود را بخوانیم؟",
    excerpt: "راهنمای ساده شناخت آنالیز، تاریخ و شماره ثبت محصول.",
    category: "راهنمای خرید",
    image: gradients[3],
    date: "۲ مرداد ۱۴۰۵",
  },
];
export const money = (n: number) =>
  new Intl.NumberFormat("fa-IR").format(n) + " تومان";
export type ThemeId = "natural" | "pistachio" | "olive" | "earth" | "premium";
export type BrandTheme = {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    primary: string;
    hover: string;
    dark: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    muted: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    danger: string;
  };
};
export const themes: BrandTheme[] = [
  {
    id: "natural",
    name: "سبز طبیعی",
    description: "تازه، حرفه‌ای و قابل اعتماد",
    colors: {
      primary: "#315c45",
      hover: "#264b38",
      dark: "#1e3b2d",
      secondary: "#71806e",
      accent: "#b79b5b",
      background: "#f7f6f1",
      surface: "#ffffff",
      muted: "#f0f1eb",
      text: "#252a26",
      textSecondary: "#59615b",
      textMuted: "#7c837e",
      border: "#e2e3dc",
      success: "#477658",
      warning: "#9a7835",
      danger: "#9a4f49",
    },
  },
  {
    id: "pistachio",
    name: "پسته‌ای",
    description: "گرم، تازه و الهام‌گرفته از باغ پسته",
    colors: {
      primary: "#63754a",
      hover: "#52623e",
      dark: "#3d4c31",
      secondary: "#8b9277",
      accent: "#b68e59",
      background: "#f8f5ed",
      surface: "#fffefa",
      muted: "#f0eee3",
      text: "#2b2e27",
      textSecondary: "#616658",
      textMuted: "#85897d",
      border: "#e3e1d5",
      success: "#637a50",
      warning: "#9b773c",
      danger: "#9b514c",
    },
  },
  {
    id: "olive",
    name: "زیتونی",
    description: "بالغ، طبیعی و ریشه‌دار",
    colors: {
      primary: "#626345",
      hover: "#515238",
      dark: "#3f402d",
      secondary: "#85816b",
      accent: "#aa8a4f",
      background: "#f5f3eb",
      surface: "#fdfcf8",
      muted: "#ecebe1",
      text: "#2c2d27",
      textSecondary: "#626157",
      textMuted: "#86847a",
      border: "#deddd3",
      success: "#66724b",
      warning: "#99773d",
      danger: "#94524b",
    },
  },
  {
    id: "earth",
    name: "خاک",
    description: "ارگانیک، آرام و متصل به زمین",
    colors: {
      primary: "#536a54",
      hover: "#455846",
      dark: "#374738",
      secondary: "#84786b",
      accent: "#a87950",
      background: "#f6f1e9",
      surface: "#fffdf9",
      muted: "#eee8df",
      text: "#302c28",
      textSecondary: "#685f57",
      textMuted: "#8b8178",
      border: "#e2dcd3",
      success: "#58745a",
      warning: "#a07543",
      danger: "#99524b",
    },
  },
  {
    id: "premium",
    name: "ممتاز",
    description: "شرکتی، ظریف و مدرن با هویت کشاورزی",
    colors: {
      primary: "#244c3e",
      hover: "#1d4034",
      dark: "#18342b",
      secondary: "#66746e",
      accent: "#b09158",
      background: "#f4f5f2",
      surface: "#ffffff",
      muted: "#ecefeb",
      text: "#202724",
      textSecondary: "#545e59",
      textMuted: "#7a847f",
      border: "#dce1dd",
      success: "#3f7055",
      warning: "#987238",
      danger: "#914a47",
    },
  },
];
