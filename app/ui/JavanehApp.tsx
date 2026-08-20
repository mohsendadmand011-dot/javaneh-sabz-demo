"use client";
/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/media-has-caption, react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, no-irregular-whitespace */
import { FormEvent, useEffect, useState } from "react";
import {
  Article,
  categories,
  initialArticles,
  initialProducts,
  money,
  Product,
  themes,
  ThemeId,
} from "./data";

const nav = [
  ["محصولات", "/shop"],
  ["راهکارها", "/training"],
  ["آموزش", "/training"],
  ["مجله", "/magazine"],
  ["نمایندگان", "/representatives"],
  ["درباره ما", "/about"],
  ["تماس", "/contact"],
];
const go = (p: string) => {
  history.pushState({}, "", p);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
};
function Icon({ children }: { children: string }) {
  return <span aria-hidden="true">{children}</span>;
}
function Header({ cartCount }: { cartCount: number }) {
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  return (
    <>
      <div className="topbar">
        مشاوره تخصصی رایگان برای انتخاب محصول{" "}
        <a href="tel:02100000000">تماس با کارشناس</a>
      </div>
      <header>
        <button className="brand" onClick={() => go("/")}>
          <span className="logo">ج</span>
          <span>
            جوانه سبز<small>همراه کشت پربار</small>
          </span>
        </button>
        <nav>
          {nav.map(([n, p]) => (
            <button key={p} onClick={() => go(p)}>
              {n}
            </button>
          ))}
        </nav>
        <div className="tools">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              go("/search?q=" + encodeURIComponent(q));
            }}
          >
            <input
              aria-label="جستجو"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جستجوی محصول..."
            />
            <button aria-label="جستجو">⌕</button>
          </form>
          <button onClick={() => go("/login")} aria-label="حساب">
            ♙
          </button>
          <button
            className="cartButton"
            onClick={() => go("/cart")}
            aria-label="سبد خرید"
          >
            ▣<b>{cartCount}</b>
          </button>
          <button
            className="hamb"
            onClick={() => setMenu(!menu)}
            aria-label="منو"
          >
            ☰
          </button>
        </div>
      </header>
      {menu && (
        <div className="mobileMenu">
          {nav.map(([n, p]) => (
            <button
              key={p}
              onClick={() => {
                go(p);
                setMenu(false);
              }}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
function MobileNav({ cartCount }: { cartCount: number }) {
  return (
    <nav className="bottomNav" aria-label="دسترسی سریع موبایل">
      {[
        ["⌂", "خانه", "/"],
        ["▦", "محصولات", "/shop"],
        ["⌕", "جستجو", "/search"],
        ["▣", `سبد ${cartCount ? `(${cartCount})` : ""}`, "/cart"],
        ["♙", "حساب", "/login"],
      ].map(([i, n, p]) => (
        <button key={p} onClick={() => go(p)}>
          <span>{i}</span>
          {n}
        </button>
      ))}
    </nav>
  );
}
function Footer() {
  return (
    <footer>
      <div className="footerGrid">
        <div>
          <div className="brand foot">
            <span className="logo">ج</span>
            <span>
              جوانه سبز<small>همراه کشت پربار</small>
            </span>
          </div>
          <p>راهکارهای مطمئن برای تغذیه گیاه، سلامت خاک و کشاورزی پایدار.</p>
        </div>
        <div>
          <h4>دسترسی سریع</h4>
          <button onClick={() => go("/shop")}>فروشگاه</button>
          <button onClick={() => go("/magazine")}>مجله کشاورزی</button>
          <button onClick={() => go("/representatives")}>نمایندگان</button>
        </div>
        <div>
          <h4>خدمات مشتریان</h4>
          <button onClick={() => go("/shipping")}>ارسال سفارش</button>
          <button onClick={() => go("/returns")}>شرایط بازگشت</button>
          <button onClick={() => go("/privacy")}>حریم خصوصی</button>
        </div>
        <div>
          <h4>همیشه کنار شما</h4>
          <p>شنبه تا پنج‌شنبه، ۸ تا ۱۷</p>
          <a href="tel:02100000000">۰۲۱-۰۰۰۰۰۰۰۰</a>
          <a href="mailto:info@example.test">info@example.test</a>
        </div>
      </div>
      <div className="copyright">
        © ۱۴۰۵ جوانه سبز — اطلاعات تماس فعلی نمونه و قابل ویرایش از تنظیمات
        است.
      </div>
    </footer>
  );
}
function ProductCard({
  p,
  onAdd,
}: {
  p: Product;
  onAdd: (p: Product) => void;
}) {
  const [fav, setFav] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  async function toggleFavorite() {
    if (favBusy) return;
    setFavBusy(true);
    const next = !fav;
    const response = await fetch("/api/wishlist", {
      method: next ? "POST" : "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId: p.id }),
    }).catch(() => null);
    setFavBusy(false);
    if (response?.status === 401) return go("/login?returnTo=/favorites");
    if (response?.ok) setFav(next);
  }
  return (
    <article className="productCard">
      <button
        className="favorite"
        aria-label={fav ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
        disabled={favBusy}
        onClick={toggleFavorite}
      >
        {fav ? "♥" : "♡"}
      </button>
      <button
        className="productImage"
        style={{ background: p.image.startsWith("#") ? p.image : undefined }}
        onClick={() => go("/product/" + p.slug)}
      >
        {p.image.startsWith("#") ? (
          <span>JS</span>
        ) : (
          <img src={p.image} alt={p.name} loading="lazy" />
        )}
        {p.featured && <b>پیشنهاد ویژه</b>}
      </button>
      <div>
        <small>{p.category}</small>
        <h3>
          <button onClick={() => go("/product/" + p.slug)}>{p.name}</button>
        </h3>
        <p>{p.description.slice(0, 66)}…</p>
        <div className="price">
          {p.oldPrice && <del>{money(p.oldPrice)}</del>}
          <strong>{money(p.price)}</strong>
        </div>
        <span className={p.stock ? "stockOk" : "stockNo"}>
          {p.stock ? "موجود و آماده ارسال" : "ناموجود"}
        </span>
        <button disabled={!p.stock} className="add" onClick={() => onAdd(p)}>
          {p.stock ? "افزودن به سبد" : "ناموجود"}
        </button>
      </div>
    </article>
  );
}
function Home({
  products,
  onAdd,
  homepage,
  articles,
}: {
  products: Product[];
  onAdd: (p: Product) => void;
  articles: Article[];
  homepage?: {
    heroTitle?: string;
    heroSubtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    heroMediaUrl?: string;
    heroMediaType?: string;
    featuredProductIds?: string[];
    showBenefits?: boolean;
    showFeaturedProducts?: boolean;
    sectionOrder?: string[];
    bannerMediaUrls?: string[];
    promotionTitle?: string;
    promotionText?: string;
    categoryHighlightIds?: string[];
    showCategoryHighlights?: boolean;
  };
}) {
  const sectionOrder = homepage?.sectionOrder || [
    "hero",
    "benefits",
    "featuredProducts",
    "categoryHighlights",
    "promotions",
    "articles",
    "cta",
  ];
  const sectionStyle = (key: string) => ({
    order: Math.max(0, sectionOrder.indexOf(key)),
  });
  return (
    <main className="cmsHome">
      <section className="hero" style={sectionStyle("hero")}>
        <div className="heroCopy">
          <span className="eyebrow">کشاورزی دقیق، انتخاب مطمئن</span>
          <h1>
            {homepage?.heroTitle || (
              <>
                هر جوانه،
                <br />
                <em>آغاز یک آینده سبز</em>
              </>
            )}
          </h1>
          <p>
            {homepage?.heroSubtitle ||
              "محصولات تخصصی و مشاوره علمی برای خاک سالم‌تر، گیاه قوی‌تر و برداشت پربارتر."}
          </p>
          <div>
            <button
              className="primary"
              onClick={() => go(homepage?.ctaLink || "/shop")}
            >
              {homepage?.ctaText || "مشاهده محصولات ←"}
            </button>
            <button className="secondary" onClick={() => go("/contact")}>
              درخواست مشاوره
            </button>
          </div>
          <aside>
            <b>+۱۵ سال</b>
            <span>تجربه تخصصی</span>
            <b>+۳۵</b>
            <span>نماینده فعال</span>
            <b>+۲۵۰۰</b>
            <span>کشاورز همراه</span>
          </aside>
        </div>
        <div className="heroVisual">
          {homepage?.heroMediaUrl &&
            (homepage.heroMediaType === "VIDEO" ? (
              <video
                className="cmsHeroMedia"
                src={homepage.heroMediaUrl}
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            ) : (
              <img
                className="cmsHeroMedia"
                src={homepage.heroMediaUrl}
                alt={homepage.heroTitle || "جوانه سبز"}
              />
            ))}
          <div className="sun"></div>
          <div className="field"></div>
          <div className="pack pack1">
            جوانه<small>NPK</small>
          </div>
          <div className="pack pack2">
            سبز<small>BIO</small>
          </div>
          <div className="leaf">⌁</div>
          <span className="quality">
            ✓<small>تضمین کیفیت</small>
          </span>
        </div>
      </section>
      {homepage?.showBenefits !== false && (
        <section className="benefits" style={sectionStyle("benefits")}>
          {[
            ["◇", "اصالت کالا", "تضمین کیفیت و سلامت"],
            ["♧", "مشاوره تخصصی", "همراهی کارشناس کشاورزی"],
            ["▱", "ارسال مطمئن", "به سراسر ایران"],
            ["◎", "پشتیبانی واقعی", "پیش و پس از خرید"],
          ].map((x) => (
            <div key={x[1]}>
              <Icon>{x[0]}</Icon>
              <p>
                <b>{x[1]}</b>
                <small>{x[2]}</small>
              </p>
            </div>
          ))}
        </section>
      )}
      {homepage?.showFeaturedProducts !== false && (
        <section className="section" style={sectionStyle("featuredProducts")}>
          <div className="sectionHead">
            <div>
              <span>انتخاب‌های حرفه‌ای</span>
              <h2>محصولات برگزیده</h2>
            </div>
            <button onClick={() => go("/shop")}>مشاهده همه ←</button>
          </div>
          <div className="grid products">
            {products
              .filter((p) =>
                homepage?.featuredProductIds?.length
                  ? homepage.featuredProductIds.includes(p.id)
                  : p.featured,
              )
              .map((p) => (
                <ProductCard key={p.id} p={p} onAdd={onAdd} />
              ))}
          </div>
        </section>
      )}
      {homepage?.showCategoryHighlights !== false &&
      homepage?.categoryHighlightIds?.length ? (
        <section className="section" style={sectionStyle("categoryHighlights")}>
          <div className="sectionHead">
            <div>
              <span>انتخاب سریع</span>
              <h2>دسته‌های منتخب</h2>
            </div>
          </div>
          <div className="chips">
            {homepage.categoryHighlightIds.map((id) => {
              const item = products.find(
                (product) => product.categoryId === id,
              );
              return item ? (
                <button key={id} onClick={() => go("/shop")}>
                  {item.category}
                </button>
              ) : null;
            })}
          </div>
        </section>
      ) : null}
      <section className="darkSection" style={sectionStyle("promotions")}>
        <div>
          <span>راهکار جامع جوانه سبز</span>
          <h2>
            {homepage?.promotionTitle || "فقط محصول نمی‌فروشیم؛"}
            <br />
            برای نتیجه بهتر همراهتان هستیم.
          </h2>
          <p>
            {homepage?.promotionText ||
              "از شناخت مسئله تا انتخاب محصول و پیگیری نتیجه، تیم فنی کنار شماست."}
          </p>
          <button className="lightBtn" onClick={() => go("/contact")}>
            شروع مشاوره
          </button>
        </div>
        <ol>
          <li>
            <b>۱</b>
            <span>
              شناخت مزرعه<small>بررسی شرایط آب، خاک و کشت</small>
            </span>
          </li>
          <li>
            <b>۲</b>
            <span>
              پیشنهاد تخصصی<small>انتخاب راهکار متناسب با نیاز</small>
            </span>
          </li>
          <li>
            <b>۳</b>
            <span>
              همراهی تا برداشت<small>پیگیری و پشتیبانی فنی</small>
            </span>
          </li>
        </ol>
        {homepage?.bannerMediaUrls?.length ? (
          <div className="promoMedia">
            {homepage.bannerMediaUrls.map((url) => (
              <img key={url} src={url} alt="بنر تبلیغاتی" />
            ))}
          </div>
        ) : null}
      </section>
      <section className="section" style={sectionStyle("articles")}>
        <div className="sectionHead">
          <div>
            <span>دانش کاربردی</span>
            <h2>تازه‌های مجله</h2>
          </div>
          <button onClick={() => go("/magazine")}>همه مطالب ←</button>
        </div>
        <div className="grid articles">
          {articles.slice(0, 3).map((a) => (
            <ArticleCard key={a.id} a={a} />
          ))}
        </div>
      </section>
      <section className="cta" style={sectionStyle("cta")}>
        <span>برای انتخاب بهتر تردید دارید؟</span>
        <h2>کارشناس جوانه سبز پاسخگوی شماست.</h2>
        <button onClick={() => go("/contact")}>دریافت مشاوره رایگان</button>
      </section>
    </main>
  );
}
function ArticleCard({ a }: { a: Article }) {
  return (
    <article className="article">
      <button
        style={{ background: a.image }}
        onClick={() => go("/magazine/" + a.slug)}
      >
        <span>دانش سبز</span>
      </button>
      <small>
        {a.category} · {a.date}
      </small>
      <h3 onClick={() => go("/magazine/" + a.slug)}>{a.title}</h3>
      <p>{a.excerpt}</p>
    </article>
  );
}
function Shop({
  products,
  onAdd,
  path,
}: {
  products: Product[];
  onAdd: (p: Product) => void;
  path: string;
}) {
  const [filter, setFilter] = useState("همه");
  const [sort, setSort] = useState("new");
  let list = products.filter((p) => filter === "همه" || p.category === filter);
  list = [...list].sort((a, b) =>
    sort === "low"
      ? a.price - b.price
      : sort === "high"
        ? b.price - a.price
        : b.id.localeCompare(a.id),
  );
  return (
    <main className="page">
      <div className="pageTitle">
        <span>فروشگاه جوانه سبز</span>
        <h1>محصولات تخصصی کشاورزی</h1>
        <p>انتخاب آگاهانه، همراه با اطلاعات شفاف و مشاوره کارشناس</p>
      </div>
      <div className="shopbar">
        <div className="chips">
          <button
            className={filter === "همه" ? "active" : ""}
            onClick={() => setFilter("همه")}
          >
            همه
          </button>
          {categories.map((c) => (
            <button
              className={filter === c ? "active" : ""}
              key={c}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          aria-label="مرتب‌سازی"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="new">جدیدترین</option>
          <option value="low">ارزان‌ترین</option>
          <option value="high">گران‌ترین</option>
        </select>
      </div>
      <div className="grid products">
        {list.map((p) => (
          <ProductCard key={p.id} p={p} onAdd={onAdd} />
        ))}
      </div>
      {!list.length && (
        <div className="empty">محصولی با این فیلتر پیدا نشد.</div>
      )}
    </main>
  );
}
function ProductPage({
  p,
  onAdd,
}: {
  p?: Product;
  onAdd: (p: Product) => void;
}) {
  const [activeMedia, setActiveMedia] = useState(0);
  if (!p) return <NotFound />;
  const gallery = [
    ...(p.images || []).map((item) => ({ ...item, kind: "image" as const })),
    ...(p.videos || []).map((item) => ({
      ...item,
      kind: "video" as const,
      alt: p.name,
    })),
  ];
  const active = gallery[activeMedia];
  return (
    <main className="page">
      <div className="crumb">خانه / فروشگاه / {p.category}</div>
      <section className="detail">
        <div className="productGallery">
          <div
            className="detailImage"
            style={{ background: active ? undefined : p.image }}
          >
            {active?.kind === "video" ? (
              <video src={active.url} controls preload="metadata" />
            ) : active ? (
              <img
                src={active.url}
                alt={active.alt || p.name}
                onError={(e) => {
                  e.currentTarget.hidden = true;
                }}
              />
            ) : (
              <>
                <span>JS</span>
                <small>تصویر محصول</small>
              </>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="galleryThumbs">
              {gallery.map((item, index) => (
                <button
                  type="button"
                  className={activeMedia === index ? "active" : ""}
                  key={`${item.id}-${index}`}
                  onClick={() => setActiveMedia(index)}
                >
                  {item.kind === "video" ? (
                    <span>▶ ویدیو</span>
                  ) : (
                    <img src={item.url} alt={item.alt || p.name} />
                  )}
                </button>
              ))}
            </div>
          )}
          {(p.videos || []).length > 0 && (
            <div className="productVideos">
              {p.videos!.map((video) => (
                <video
                  key={video.id}
                  src={video.url}
                  controls
                  preload="metadata"
                />
              ))}
            </div>
          )}
        </div>
        <div>
          <span className="eyebrow">{p.category}</span>
          <h1>{p.name}</h1>
          <p>{p.description}</p>
          <div className="sku">
            کد کالا: JS-{String(p.id).padStart(4, "0")}{" "}
            <span className={p.stock ? "ok" : "bad"}>
              {p.stock ? "موجود در انبار" : "ناموجود"}
            </span>
          </div>
          <div className="detailPrice">
            {p.oldPrice && <del>{money(p.oldPrice)}</del>}
            <strong>{money(p.price)}</strong>
          </div>
          <button
            className="primary wide"
            disabled={!p.stock}
            onClick={() => onAdd(p)}
          >
            افزودن به سبد خرید
          </button>
          <button className="secondary wide" onClick={() => go("/contact")}>
            مشاوره قبل از خرید
          </button>
        </div>
      </section>
      <section className="tabs">
        <h2>معرفی محصول</h2>
        <p>{p.description}</p>
        <div className="infoGrid">
          {[
            "مزایا",
            "کاربردها",
            "ترکیبات",
            "مشخصات فنی",
            "روش مصرف",
            "توصیه فنی",
            "هشدارها",
            "سوالات متداول",
          ].map((x) => (
            <div key={x}>
              <h3>{x}</h3>
              <p>
                اطلاعات این بخش توسط مدیر محتوا تکمیل می‌شود. برای توصیه مصرف،
                آزمون خاک و نظر کارشناس ضروری است.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
function Cart({
  cart,
  setCart,
  products,
}: {
  cart: Record<string, number>;
  setCart: (c: Record<string, number>) => void;
  products: Product[];
}) {
  const lines = products.filter((p) => cart[p.id]);
  const total = lines.reduce((s, p) => s + p.price * cart[p.id], 0);
  return (
    <main className="page narrow">
      <div className="pageTitle">
        <h1>سبد خرید</h1>
      </div>
      {!lines.length ? (
        <div className="empty">
          <h2>سبد خرید شما خالی است</h2>
          <button className="primary" onClick={() => go("/shop")}>
            رفتن به فروشگاه
          </button>
        </div>
      ) : (
        <div className="cartLayout">
          <div>
            {lines.map((p) => (
              <div className="cartLine" key={p.id}>
                <div style={{ background: p.image }}></div>
                <span>
                  <b>{p.name}</b>
                  <small>{money(p.price)}</small>
                </span>
                <input
                  type="number"
                  min="1"
                  value={cart[p.id]}
                  onChange={(e) =>
                    setCart({ ...cart, [p.id]: Math.max(1, +e.target.value) })
                  }
                />
                <button
                  onClick={() => {
                    const c = { ...cart };
                    delete c[p.id];
                    setCart(c);
                  }}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
          <aside className="summary">
            <h3>خلاصه سفارش</h3>
            <p>
              <span>جمع کالاها</span>
              <b>{money(total)}</b>
            </p>
            <p>
              <span>هزینه ارسال</span>
              <b>محاسبه در مرحله بعد</b>
            </p>
            <hr />
            <p>
              <span>مبلغ قابل پرداخت</span>
              <strong>{money(total)}</strong>
            </p>
            <button className="primary wide" onClick={() => go("/checkout")}>
              ادامه و ثبت سفارش
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
function Checkout({
  cart,
  products,
  onDone,
}: {
  cart: Record<string, number>;
  products: Product[];
  onDone: () => void;
}) {
  const total = products.reduce((s, p) => s + (cart[p.id] || 0) * p.price, 0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        firstName: form.get("name"),
        lastName: form.get("last"),
        mobile: form.get("mobile"),
        email: form.get("email") || null,
        province: form.get("province"),
        city: form.get("city"),
        postalCode: form.get("postal"),
        address: form.get("address"),
        notes: form.get("notes") || null,
        items: Object.entries(cart).map(([productId, quantity]) => ({
          productId,
          quantity,
        })),
      }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error || "ثبت سفارش ناموفق بود");
      return;
    }
    setDone(true);
    onDone();
  }
  if (done)
    return (
      <main className="page narrow">
        <div className="success">
          <b>✓</b>
          <h1>سفارش شما ثبت شد</h1>
          <p>کارشناس فروش برای هماهنگی ارسال با شما تماس می‌گیرد.</p>
          <button className="primary" onClick={() => go("/account/orders")}>
            پیگیری سفارش
          </button>
        </div>
      </main>
    );
  return (
    <main className="page narrow">
      <div className="pageTitle">
        <h1>تکمیل سفارش</h1>
      </div>
      <form className="checkout" onSubmit={submit}>
        {error && <div className="error">{error}</div>}
        <h2>اطلاعات تحویل‌گیرنده</h2>
        <div className="formGrid">
          {[
            ["نام", "name"],
            ["نام خانوادگی", "last"],
            ["موبایل", "mobile"],
            ["ایمیل", "email"],
            ["استان", "province"],
            ["شهر", "city"],
            ["کد پستی", "postal"],
          ].map(([l, n]) => (
            <label key={n}>
              {l}
              <input
                name={n}
                required={n !== "email"}
                type={n === "email" ? "email" : "text"}
              />
            </label>
          ))}
          <label className="full">
            نشانی کامل
            <textarea required name="address" />
          </label>
          <label className="full">
            توضیحات
            <textarea name="notes" />
          </label>
        </div>
        <aside className="summary">
          <p>
            <span>مبلغ سفارش</span>
            <strong>{money(total)}</strong>
          </p>
          <label>
            <input type="radio" defaultChecked name="pay" /> پرداخت هنگام تحویل
          </label>
          <button className="primary wide">ثبت نهایی سفارش</button>
        </aside>
      </form>
    </main>
  );
}
function Login({ onLogin }: { onLogin: (r: string) => void }) {
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("admin@javanehsabz.local");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    const response = await fetch(
      registering ? "/api/auth/register" : "/api/auth/login",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password: pass, name, mobile }),
      },
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok)
      return setErr(body.error || "ایمیل یا رمز عبور نادرست است.");
    const role = body.user.role as string;
    onLogin(role);
    go(role === "CUSTOMER" ? "/account" : "/admin");
  }
  return (
    <main className="loginPage">
      <form onSubmit={submit}>
        <div className="brand">
          <span className="logo">ج</span>
          <span>
            جوانه سبز<small>ورود به حساب کاربری</small>
          </span>
        </div>
        <h1>{registering ? "ساخت حساب مشتری" : "خوش آمدید"}</h1>
        <p>
          {registering
            ? "برای پیگیری سفارش و ذخیره علاقه‌مندی‌ها ثبت‌نام کنید."
            : "برای ادامه اطلاعات حساب خود را وارد کنید."}
        </p>
        {err && <div className="error">{err}</div>}
        {registering && (
          <>
            <label>
              نام و نام خانوادگی
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label>
              شماره همراه
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </label>
          </>
        )}
        <label>
          ایمیل
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          رمز عبور
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
          />
        </label>
        <button className="primary wide">
          {registering ? "ثبت‌نام" : "ورود"}
        </button>
        <button
          className="secondary wide"
          type="button"
          onClick={() => {
            setRegistering(!registering);
            setErr("");
            setEmail("");
          }}
        >
          {registering
            ? "حساب دارید؟ وارد شوید"
            : "مشتری جدید هستید؟ ثبت‌نام کنید"}
        </button>
        {!registering && (
          <small>اطلاعات ورود مدیر از متغیرهای محیطی seed ساخته می‌شود.</small>
        )}
      </form>
    </main>
  );
}
function Admin({
  products,
  setProducts,
  role,
  path,
  theme,
  onTheme,
}: {
  products: Product[];
  setProducts: (p: Product[]) => void;
  role: string;
  path: string;
  theme: ThemeId;
  onTheme: (t: ThemeId) => void;
}) {
  const section = path.split("/")[2] || "";
  if (!role || role === "CUSTOMER") return <Forbidden />;
  const menu = [
    ["", "داشبورد"],
    ["products", "محصولات"],
    ["categories", "دسته‌بندی‌ها"],
    ["orders", "سفارش‌ها"],
    ["articles", "مقالات"],
    ["media", "رسانه"],
    ["representatives", "نمایندگان"],
    ["events", "رویدادها"],
    ["settings", "ظاهر و تنظیمات"],
    ["users", "کاربران"],
  ].filter(([section]) => role === "ADMIN" || section !== "users");
  return (
    <div className="admin">
      <aside>
        <div className="brand">
          <span className="logo">ج</span>
          <span>
            مدیریت جوانه سبز
            <small>{role === "ADMIN" ? "مدیر کل" : "ویرایشگر"}</small>
          </span>
        </div>
        {menu.map(([s, n]) => (
          <button
            className={section === s ? "active" : ""}
            key={s}
            onClick={() => go("/admin/" + s)}
          >
            <span>□</span>
            {n}
          </button>
        ))}
        <button onClick={() => go("/")}>
          <span>↗</span>مشاهده سایت
        </button>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            go("/login");
          }}
        >
          <span>⇥</span>خروج از حساب
        </button>
      </aside>
      <main>
        <div className="adminTop">
          <div>
            <small>پنل مدیریت</small>
            <h1>{menu.find((x) => x[0] === section)?.[1] || "داشبورد"}</h1>
          </div>
          <button>اعلان‌ها</button>
        </div>
        {section === "products" ? (
          <AdminProducts products={products} setProducts={setProducts} />
        ) : section === "categories" ? (
          <AdminCategories />
        ) : section === "orders" ? (
          <AdminOrders />
        ) : section === "articles" ? (
          <AdminContent type="articles" />
        ) : section === "events" ? (
          <AdminContent type="events" />
        ) : section === "representatives" ? (
          <AdminContent type="representatives" />
        ) : section === "media" ? (
          <AdminMedia />
        ) : section === "users" ? (
          <AdminUsers />
        ) : section === "settings" ? (
          <>
            <ThemeSettings active={theme} onApply={onTheme} />
            <HomepageSettings />
            <SiteSeoSettings />
          </>
        ) : section === "" ? (
          <Dashboard products={products} />
        ) : (
          <AdminGeneric title={menu.find((x) => x[0] === section)?.[1] || ""} />
        )}
      </main>
    </div>
  );
}
function Dashboard({ products }: { products: Product[] }) {
  const [summary, setSummary] = useState({
    customers: 0,
    orders: 0,
    pending: 0,
    revenue: 0,
    lowInventory: 0,
    recentArticles: 0,
    recentEvents: 0,
  });
  useEffect(() => {
    fetch("/api/admin/summary", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setSummary(data))
      .catch(() => {});
  }, []);
  return (
    <>
      <div className="stats">
        {[
          ["محصولات", products.length],
          ["مشتریان", summary.customers],
          ["سفارش‌ها", summary.orders],
          ["سفارش معلق", summary.pending],
          ["فروش", money(summary.revenue)],
          ["کمبود موجودی", summary.lowInventory],
        ].map((x) => (
          <div key={x[0]}>
            <small>{x[0]}</small>
            <b>{x[1]}</b>
          </div>
        ))}
      </div>
      <div className="dashGrid">
        <div className="chart">
          <h3>محتوای جاری</h3>
          <p>
            مقالات ایجادشده در ۳۰ روز اخیر: <b>{summary.recentArticles}</b>
          </p>
          <p>
            رویدادهای آینده: <b>{summary.recentEvents}</b>
          </p>
          <p>
            محصولات با موجودی ۵ یا کمتر: <b>{summary.lowInventory}</b>
          </p>
        </div>
        <div className="quick">
          <h3>دسترسی سریع</h3>
          <button onClick={() => go("/admin/products")}>+ افزودن محصول</button>
          <button onClick={() => go("/admin/articles")}>+ نوشتن مقاله</button>
          <button onClick={() => go("/admin/media")}>↑ بارگذاری رسانه</button>
        </div>
      </div>
      <AdminOrders />
    </>
  );
}
function AdminProducts({
  products,
  setProducts,
}: {
  products: Product[];
  setProducts: (p: Product[]) => void;
}) {
  const [edit, setEdit] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [media, setMedia] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  useEffect(() => {
    Promise.all([
      fetch("/api/media", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : { media: [] },
      ),
      fetch("/api/categories", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([mediaData, categoryData]) => {
        setMedia(mediaData.media || []);
        setDbCategories(categoryData.categories || []);
      })
      .catch(() => {});
  }, []);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!edit) return;
    setError("");
    const response = await fetch(`/api/products/${edit.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: edit.name,
        description: edit.description,
        price: edit.price,
        stock: edit.stock,
        slug: edit.slug,
        sku: edit.sku,
        categoryId: edit.categoryId,
        status: edit.status,
        seoTitle: edit.seoTitle,
        metaDescription: edit.metaDescription,
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return setError(body.error || "ذخیره محصول ناموفق بود");
    const selectedImages = (edit.images || []).filter((item) => item.mediaId);
    const selectedVideos = edit.videos || [];
    const mediaResponse = await fetch(`/api/products/${edit.id}/media`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        images: selectedImages.map((item, order) => ({
          mediaId: item.mediaId,
          alt: item.alt,
          order,
          isPrimary: order === 0,
        })),
        videos: selectedVideos.map((item, order) => ({
          mediaId: item.mediaId,
          order,
        })),
      }),
    });
    const mediaBody = await mediaResponse.json().catch(() => ({}));
    if (!mediaResponse.ok)
      return setError(mediaBody.error || "ذخیره رسانه محصول ناموفق بود");
    setProducts(
      products.map((p) => (p.id === edit.id ? mediaBody.product : p)),
    );
    setEdit(null);
  }
  async function uploadForProduct(files: FileList | null) {
    if (!edit || !files?.length) return;
    const form = new FormData();
    Array.from(files).forEach((file) => form.append("files", file));
    const response = await fetch("/api/media", { method: "POST", body: form });
    const body = await response.json().catch(() => ({}));
    if (!response.ok)
      return setError(body.error || "بارگذاری رسانه ناموفق بود");
    setMedia([...body.media, ...media]);
    const images = body.media
      .filter((item: any) => item.fileType === "IMAGE")
      .map((item: any, index: number) => ({
        id: item.id,
        mediaId: item.id,
        url: item.url,
        alt: item.alt,
        order: (edit.images?.length || 0) + index,
        isPrimary: !edit.images?.length && index === 0,
      }));
    const videos = body.media
      .filter((item: any) => item.fileType === "VIDEO")
      .map((item: any, index: number) => ({
        id: item.id,
        mediaId: item.id,
        url: item.url,
        mimeType: item.mimeType,
        order: (edit.videos?.length || 0) + index,
      }));
    setEdit({
      ...edit,
      images: [...(edit.images || []), ...images],
      videos: [...(edit.videos || []), ...videos],
      image: images[0]?.url || edit.image,
    });
  }
  async function createProduct() {
    const template = products[0];
    if (!template?.categoryId)
      return setError("ابتدا یک دسته‌بندی معتبر ایجاد کنید");
    const stamp = Date.now();
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "محصول جدید",
        slug: `product-${stamp}`,
        sku: `JS-${stamp}`,
        description: "توضیحات محصول جدید را از پنل مدیریت تکمیل کنید.",
        price: 0,
        stock: 0,
        categoryId: template.categoryId,
        status: "DRAFT",
        image: "#dce4d6",
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return setError(body.error || "ایجاد محصول ناموفق بود");
    setProducts([...products, body.product]);
    setEdit(body.product);
  }
  async function archiveProduct(id: string) {
    if (!confirm("این محصول بایگانی شود؟")) return;
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (response.ok)
      setProducts(products.filter((product) => product.id !== id));
    else
      setError(
        (await response.json().catch(() => ({}))).error ||
          "بایگانی محصول ناموفق بود",
      );
  }
  if (edit)
    return (
      <form className="editor" onSubmit={save}>
        {error && <div className="error">{error}</div>}
        <div className="editorHead">
          <button type="button" onClick={() => setEdit(null)}>
            → بازگشت
          </button>
          <div>
            <h2>ویرایش {edit.name}</h2>
            <small>تغییرات پس از ذخیره در سایت نمایش داده می‌شود.</small>
          </div>
          <button className="primary">ذخیره تغییرات</button>
        </div>
        <div className="tabsRow">
          عمومی　 رسانه　 توضیحات　 اطلاعات فنی　 قیمت‌گذاری　 سئو　 انتشار
        </div>
        <div className="editorGrid">
          <section>
            <label>
              نام محصول
              <input
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
            </label>
            <label>
              نامک انگلیسی
              <input
                value={edit.slug}
                onChange={(e) => setEdit({ ...edit, slug: e.target.value })}
              />
            </label>
            <label>
              کد کالا
              <input
                value={edit.sku || ""}
                onChange={(e) => setEdit({ ...edit, sku: e.target.value })}
              />
            </label>
            <label>
              توضیحات
              <textarea
                rows={7}
                value={edit.description}
                onChange={(e) =>
                  setEdit({ ...edit, description: e.target.value })
                }
              />
            </label>
            <label>
              دسته‌بندی
              <select
                value={edit.categoryId}
                onChange={(e) => {
                  const selected = dbCategories.find(
                    (item) => item.id === e.target.value,
                  );
                  setEdit({
                    ...edit,
                    categoryId: e.target.value,
                    category: selected?.name || edit.category,
                  });
                }}
              >
                {dbCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              عنوان سئو
              <input
                value={edit.seoTitle || ""}
                onChange={(e) => setEdit({ ...edit, seoTitle: e.target.value })}
              />
            </label>
            <label>
              توضیحات سئو
              <textarea
                value={edit.metaDescription || ""}
                onChange={(e) =>
                  setEdit({ ...edit, metaDescription: e.target.value })
                }
              />
            </label>
          </section>
          <aside>
            <div className="upload">
              <b>تصاویر و ویدیوی محصول</b>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                onChange={(e) => uploadForProduct(e.target.files)}
              />
              <div className="mediaPreviews">
                {(edit.images || []).map((item, index) => (
                  <div key={`${item.id}-${index}`}>
                    <img src={item.url} alt={item.alt || ""} />
                    <small>
                      {index === 0 ? "تصویر اصلی" : `تصویر ${index + 1}`}
                    </small>
                    <span>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => {
                          const next = [...(edit.images || [])];
                          [next[index - 1], next[index]] = [
                            next[index],
                            next[index - 1],
                          ];
                          setEdit({
                            ...edit,
                            images: next,
                            image: next[0]?.url || edit.image,
                          });
                        }}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = (edit.images || []).filter(
                            (_, i) => i !== index,
                          );
                          setEdit({
                            ...edit,
                            images: next,
                            image: next[0]?.url || "#dce4d6",
                          });
                        }}
                      >
                        حذف
                      </button>
                    </span>
                  </div>
                ))}
                {(edit.videos || []).map((item, index) => (
                  <div key={item.id}>
                    <video src={item.url} controls />
                    <button
                      type="button"
                      onClick={() =>
                        setEdit({
                          ...edit,
                          videos: (edit.videos || []).filter(
                            (_, i) => i !== index,
                          ),
                        })
                      }
                    >
                      حذف ویدیو
                    </button>
                  </div>
                ))}
              </div>
              <details>
                <summary>انتخاب از کتابخانه رسانه</summary>
                <div className="mediaPreviews">
                  {media.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() =>
                        item.fileType === "IMAGE"
                          ? setEdit({
                              ...edit,
                              images: [
                                ...(edit.images || []),
                                {
                                  id: item.id,
                                  mediaId: item.id,
                                  url: item.url,
                                  alt: item.alt,
                                  order: edit.images?.length || 0,
                                  isPrimary: !edit.images?.length,
                                },
                              ],
                              image: edit.images?.length
                                ? edit.image
                                : item.url,
                            })
                          : setEdit({
                              ...edit,
                              videos: [
                                ...(edit.videos || []),
                                {
                                  id: item.id,
                                  mediaId: item.id,
                                  url: item.url,
                                  mimeType: item.mimeType,
                                  order: edit.videos?.length || 0,
                                },
                              ],
                            })
                      }
                    >
                      {item.fileType === "VIDEO" ? (
                        <video src={item.url} />
                      ) : (
                        <img src={item.url} alt={item.alt || ""} />
                      )}
                    </button>
                  ))}
                </div>
              </details>
            </div>
            <label>
              قیمت (تومان)
              <input
                type="number"
                value={edit.price}
                onChange={(e) => setEdit({ ...edit, price: +e.target.value })}
              />
            </label>
            <label>
              موجودی
              <input
                type="number"
                value={edit.stock}
                onChange={(e) => setEdit({ ...edit, stock: +e.target.value })}
              />
            </label>
            <label>
              وضعیت
              <select
                value={edit.status || "DRAFT"}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    status: e.target.value as Product["status"],
                  })
                }
              >
                <option value="DRAFT">پیش‌نویس</option>
                <option value="PUBLISHED">منتشر شده</option>
                <option value="ARCHIVED">بایگانی</option>
              </select>
            </label>
          </aside>
        </div>
      </form>
    );
  return (
    <div className="adminTable">
      <div className="tableTools">
        <input placeholder="جستجو در محصولات..." />
        <button className="primary" onClick={createProduct}>
          + محصول جدید
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>تصویر</th>
            <th>محصول</th>
            <th>دسته</th>
            <th>قیمت</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                <i style={{ background: p.image }} />
              </td>
              <td>
                <b>{p.name}</b>
                <small>JS-{p.id}</small>
              </td>
              <td>{p.category}</td>
              <td>{money(p.price)}</td>
              <td>
                <span className={p.stock ? "published" : "draft"}>
                  {p.stock ? "منتشر شده" : "ناموجود"}
                </span>
              </td>
              <td>
                <button onClick={() => setEdit(p)}>ویرایش</button>{" "}
                <button onClick={() => go("/product/" + p.slug)}>نمایش</button>{" "}
                <button onClick={() => archiveProduct(p.id)}>بایگانی</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function AdminOrders() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/orders", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((data) => setRows(data.orders || []))
      .catch(() => setRows([]));
  }, []);
  async function changeStatus(id: string, status: string) {
    const response = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok)
      setRows(rows.map((row) => (row.id === id ? { ...row, status } : row)));
    else alert((await response.json()).error);
  }
  return (
    <div className="adminTable">
      <h3>سفارش‌های اخیر</h3>
      <table>
        <thead>
          <tr>
            <th>شماره</th>
            <th>تاریخ</th>
            <th>مبلغ</th>
            <th>وضعیت</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o: any) => (
            <tr key={o.id}>
              <td>
                <b>{o.number || o.id}</b>
              </td>
              <td>
                {o.createdAt
                  ? new Date(o.createdAt).toLocaleDateString("fa-IR")
                  : o.date}
              </td>
              <td>{money(o.total)}</td>
              <td>
                <select
                  value={o.status}
                  onChange={(e) => changeStatus(o.id, e.target.value)}
                >
                  <option value="PENDING">در انتظار</option>
                  <option value="CONFIRMED">تأیید شده</option>
                  <option value="PROCESSING">در حال پردازش</option>
                  <option value="SHIPPED">ارسال شده</option>
                  <option value="DELIVERED">تحویل شده</option>
                  <option value="CANCELLED">لغو شده</option>
                  <option value="REFUNDED">بازپرداخت</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function AdminCategories() {
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const load = () =>
    fetch("/api/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setRows(data.categories || []));
  useEffect(() => {
    load().catch(() => setRows([]));
  }, []);
  async function create(e: FormEvent) {
    e.preventDefault();
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });
    if (response.ok) {
      setName("");
      setSlug("");
      await load();
    }
  }
  async function remove(id: string) {
    const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (response.ok) await load();
    else alert((await response.json()).error);
  }
  async function editCategory(row: any) {
    const name = prompt("نام دسته‌بندی", row.name);
    if (!name) return;
    const order = Number(prompt("ترتیب نمایش", String(row.order)) ?? row.order);
    const response = await fetch(`/api/categories/${row.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, order }),
    });
    if (response.ok) await load();
    else alert((await response.json()).error);
  }
  return (
    <div className="adminTable">
      <form className="tableTools" onSubmit={create}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام دسته‌بندی"
          required
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="english-slug"
          required
        />
        <button className="primary">+ دسته‌بندی جدید</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>نام</th>
            <th>شناسه</th>
            <th>ترتیب</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.slug}</td>
              <td>{row.order}</td>
              <td>
                <button onClick={() => editCategory(row)}>ویرایش</button>{" "}
                <button onClick={() => remove(row.id)}>حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function AdminMedia() {
  const [rows, setRows] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const load = () =>
    fetch(
      `/api/media?search=${encodeURIComponent(search)}&type=${typeFilter}&sort=${sort}`,
      { cache: "no-store" },
    )
      .then((r) => r.json())
      .then((data) => setRows(data.media || []));
  useEffect(() => {
    load().catch(() => setRows([]));
  }, [search, typeFilter, sort]);
  function send(method: string, url: string, data: FormData) {
    return new Promise<any>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open(method, url);
      request.upload.onprogress = (event) =>
        event.lengthComputable &&
        setProgress(Math.round((event.loaded / event.total) * 100));
      request.onload = () => {
        const body = JSON.parse(request.responseText || "{}");
        if (request.status >= 200 && request.status < 300) resolve(body);
        else reject(new Error(body.error || "بارگذاری ناموفق بود"));
      };
      request.onerror = () => reject(new Error("ارتباط با سرور برقرار نشد"));
      request.send(data);
    });
  }
  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!files.length) return setStatus("حداقل یک فایل انتخاب کنید.");
    const form = new FormData(e.currentTarget);
    form.delete("files");
    files.forEach((file) => form.append("files", file));
    setProgress(0);
    setStatus("در حال بارگذاری…");
    try {
      await send("POST", "/api/media", form);
      e.currentTarget.reset();
      setFiles([]);
      setProgress(100);
      setStatus("بارگذاری با موفقیت انجام شد.");
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "بارگذاری ناموفق بود");
    }
  }
  async function replace(row: any, file?: File) {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      await send("PUT", `/api/media/${row.id}`, form);
      setStatus("رسانه با موفقیت جایگزین شد.");
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "جایگزینی ناموفق بود");
    }
  }
  async function remove(id: string) {
    const response = await fetch(`/api/media/${id}`, { method: "DELETE" });
    if (response.ok) await load();
    else alert((await response.json()).error);
  }
  return (
    <div className="adminTable mediaLibrary">
      <form
        className="mediaUpload"
        onSubmit={upload}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setFiles(Array.from(e.dataTransfer.files));
        }}
      >
        <strong>فایل‌ها را اینجا رها کنید یا از رایانه انتخاب کنید</strong>
        <input
          type="file"
          name="files"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
        <input name="alt" placeholder="متن جایگزین تصویر" />
        <input name="caption" placeholder="توضیح یا زیرنویس" />
        {files.length > 0 && (
          <div className="mediaPreviews">
            {files.map((file) => (
              <div key={`${file.name}-${file.size}`}>
                {file.type.startsWith("video/") ? (
                  <video src={URL.createObjectURL(file)} controls />
                ) : (
                  <img src={URL.createObjectURL(file)} alt="پیش‌نمایش" />
                )}
                <small>{file.name}</small>
              </div>
            ))}
          </div>
        )}
        {progress > 0 && (
          <progress value={progress} max="100">
            {progress}%
          </progress>
        )}
        {status && <p role="status">{status}</p>}
        <button className="primary">بارگذاری {files.length || ""} فایل</button>
      </form>
      <div className="tableTools">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجوی رسانه…"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">همه فایل‌ها</option>
          <option value="IMAGE">تصاویر</option>
          <option value="VIDEO">ویدیوها</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">جدیدترین</option>
          <option value="oldest">قدیمی‌ترین</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>پیش‌نمایش</th>
            <th>نام</th>
            <th>مشخصات</th>
            <th>تاریخ</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                {row.fileType === "VIDEO" ? (
                  <video src={row.url} controls width="120" />
                ) : (
                  <img
                    src={row.url}
                    alt={row.alt || ""}
                    width="96"
                    height="72"
                  />
                )}
              </td>
              <td>
                <b>{row.originalFilename || row.name}</b>
                <small>{row.alt}</small>
              </td>
              <td>
                <small>
                  {row.mimeType}
                  <br />
                  {(row.size / 1024 / 1024).toFixed(2)} MB
                  {row.width ? ` · ${row.width}×${row.height}` : ""}
                </small>
              </td>
              <td>{new Date(row.createdAt).toLocaleDateString("fa-IR")}</td>
              <td>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      new URL(row.url, location.origin).href,
                    )
                  }
                >
                  کپی نشانی
                </button>{" "}
                <label className="buttonLike">
                  جایگزینی
                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                    onChange={(e) => replace(row, e.target.files?.[0])}
                  />
                </label>{" "}
                <button onClick={() => remove(row.id)}>حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function AdminContent({
  type,
}: {
  type: "articles" | "events" | "representatives";
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [editContent, setEditContent] = useState<any | null>(null);
  const [contentMedia, setContentMedia] = useState<any[]>([]);
  const load = () =>
    fetch(`/api/admin/content?type=${type}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setRows(data.records || []));
  useEffect(() => {
    load().catch(() => setRows([]));
    fetch("/api/media", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { media: [] }))
      .then((data) => setContentMedia(data.media || []))
      .catch(() => {});
  }, [type]);
  async function saveContent(e: FormEvent) {
    e.preventDefault();
    if (!editContent) return;
    const response = await fetch(`/api/admin/content/${editContent.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...editContent,
        type,
        mediaIds:
          editContent.mediaIds ||
          editContent.media?.map((item: any) => item.mediaId) ||
          [],
      }),
    });
    if (response.ok) {
      setEditContent(null);
      await load();
    } else alert((await response.json()).error);
  }
  async function create(e: FormEvent) {
    e.preventDefault();
    const stamp = Date.now();
    const body =
      type === "articles"
        ? {
            type,
            title,
            slug: `article-${stamp}`,
            excerpt: "خلاصه مطلب را ویرایش کنید",
            content: "متن کامل مطلب را ویرایش کنید",
            status: "DRAFT",
          }
        : type === "events"
          ? {
              type,
              title,
              description: "توضیحات رویداد را ویرایش کنید",
              startsAt: new Date(Date.now() + 86400000).toISOString(),
              location: "کرمان",
              status: "DRAFT",
            }
          : {
              type,
              name: title,
              province: "کرمان",
              city: "کرمان",
              address: "نشانی نمایندگی را ویرایش کنید",
              status: "DRAFT",
            };
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      setTitle("");
      await load();
    } else alert((await response.json()).error);
  }
  async function archive(id: string) {
    const response = await fetch(`/api/admin/content/${id}?type=${type}`, {
      method: "DELETE",
    });
    if (response.ok) await load();
  }
  if (editContent)
    return (
      <form className="editor" onSubmit={saveContent}>
        <div className="editorHead">
          <button type="button" onClick={() => setEditContent(null)}>
            → بازگشت
          </button>
          <h2>ویرایش {editContent.title || editContent.name}</h2>
          <button className="primary">ذخیره محتوا</button>
        </div>
        <div className="editorGrid">
          <section>
            <label>
              {type === "representatives" ? "نام" : "عنوان"}
              <input
                value={editContent.title || editContent.name || ""}
                onChange={(e) =>
                  setEditContent({
                    ...editContent,
                    [type === "representatives" ? "name" : "title"]:
                      e.target.value,
                  })
                }
              />
            </label>
            {type === "articles" && (
              <>
                <label>
                  نامک
                  <input
                    value={editContent.slug || ""}
                    onChange={(e) =>
                      setEditContent({ ...editContent, slug: e.target.value })
                    }
                  />
                </label>
                <label>
                  خلاصه
                  <textarea
                    value={editContent.excerpt || ""}
                    onChange={(e) =>
                      setEditContent({
                        ...editContent,
                        excerpt: e.target.value,
                      })
                    }
                  />
                </label>
                <div className="tabsRow">
                  <button
                    type="button"
                    onClick={() =>
                      setEditContent({
                        ...editContent,
                        content: `${editContent.content || ""}<h2>عنوان</h2>`,
                      })
                    }
                  >
                    عنوان
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditContent({
                        ...editContent,
                        content: `${editContent.content || ""}<strong>متن برجسته</strong>`,
                      })
                    }
                  >
                    پررنگ
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditContent({
                        ...editContent,
                        content: `${editContent.content || ""}<ul><li>مورد</li></ul>`,
                      })
                    }
                  >
                    فهرست
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditContent({
                        ...editContent,
                        content: `${editContent.content || ""}<a href='https://'>پیوند</a>`,
                      })
                    }
                  >
                    پیوند
                  </button>
                </div>
                <label>
                  متن غنی RTL
                  <textarea
                    dir="rtl"
                    rows={14}
                    value={editContent.content || ""}
                    onChange={(e) =>
                      setEditContent({
                        ...editContent,
                        content: e.target.value,
                      })
                    }
                  />
                </label>
                <details>
                  <summary>پیش‌نمایش متن</summary>
                  <pre dir="rtl" className="contentPreview">
                    {editContent.content}
                  </pre>
                </details>
                <label>
                  عنوان سئو
                  <input
                    value={editContent.seoTitle || ""}
                    onChange={(e) =>
                      setEditContent({
                        ...editContent,
                        seoTitle: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  توضیحات سئو
                  <textarea
                    value={editContent.metaDescription || ""}
                    onChange={(e) =>
                      setEditContent({
                        ...editContent,
                        metaDescription: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  زمان انتشار
                  <input
                    type="datetime-local"
                    value={
                      editContent.publishedAt
                        ? String(editContent.publishedAt).slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setEditContent({
                        ...editContent,
                        publishedAt: e.target.value || null,
                      })
                    }
                  />
                </label>
              </>
            )}
            {type === "events" && (
              <>
                <label>
                  توضیحات
                  <textarea
                    rows={8}
                    value={editContent.description || ""}
                    onChange={(e) =>
                      setEditContent({
                        ...editContent,
                        description: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  محل
                  <input
                    value={editContent.location || ""}
                    onChange={(e) =>
                      setEditContent({
                        ...editContent,
                        location: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  زمان
                  <input
                    type="datetime-local"
                    value={
                      editContent.startsAt
                        ? String(editContent.startsAt).slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setEditContent({
                        ...editContent,
                        startsAt: e.target.value,
                      })
                    }
                  />
                </label>
              </>
            )}
            {type === "representatives" && (
              <>
                <label>
                  استان
                  <input
                    value={editContent.province || ""}
                    onChange={(e) =>
                      setEditContent({
                        ...editContent,
                        province: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  شهر
                  <input
                    value={editContent.city || ""}
                    onChange={(e) =>
                      setEditContent({ ...editContent, city: e.target.value })
                    }
                  />
                </label>
                <label>
                  نشانی
                  <textarea
                    value={editContent.address || ""}
                    onChange={(e) =>
                      setEditContent({
                        ...editContent,
                        address: e.target.value,
                      })
                    }
                  />
                </label>
              </>
            )}
          </section>
          <aside>
            {type !== "representatives" && (
              <>
                <label>
                  تصویر شاخص
                  <select
                    value={editContent.coverMediaId || ""}
                    onChange={(e) =>
                      setEditContent({
                        ...editContent,
                        coverMediaId: e.target.value || null,
                      })
                    }
                  >
                    <option value="">بدون تصویر</option>
                    {contentMedia
                      .filter((item) => item.fileType === "IMAGE")
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.originalFilename || item.name}
                        </option>
                      ))}
                  </select>
                </label>
                {editContent.coverMediaId && (
                  <img
                    src={
                      contentMedia.find(
                        (item) => item.id === editContent.coverMediaId,
                      )?.url
                    }
                    alt="تصویر شاخص"
                    width="280"
                  />
                )}
              </>
            )}
            {type === "articles" && (
              <fieldset>
                <legend>تصاویر و ویدیوهای داخل مقاله</legend>
                {contentMedia.map((item) => {
                  const selected = (
                    editContent.mediaIds ||
                    editContent.media?.map(
                      (relation: any) => relation.mediaId,
                    ) ||
                    []
                  ).includes(item.id);
                  return (
                    <label key={item.id}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => {
                          const ids =
                            editContent.mediaIds ||
                            editContent.media?.map(
                              (relation: any) => relation.mediaId,
                            ) ||
                            [];
                          setEditContent({
                            ...editContent,
                            mediaIds: e.target.checked
                              ? [...ids, item.id]
                              : ids.filter((id: string) => id !== item.id),
                          });
                        }}
                      />{" "}
                      {item.fileType === "VIDEO" ? "ویدیو" : "تصویر"} —{" "}
                      {item.originalFilename || item.name}
                    </label>
                  );
                })}
              </fieldset>
            )}
            <label>
              وضعیت
              <select
                value={editContent.status || "DRAFT"}
                onChange={(e) =>
                  setEditContent({ ...editContent, status: e.target.value })
                }
              >
                <option value="DRAFT">پیش‌نویس</option>
                <option value="PUBLISHED">منتشر شده</option>
                <option value="ARCHIVED">بایگانی</option>
              </select>
            </label>
          </aside>
        </div>
      </form>
    );
  return (
    <div className="adminTable">
      <form className="tableTools" onSubmit={create}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={type === "representatives" ? "نام نمایندگی" : "عنوان"}
          required
        />
        <button className="primary">+ مورد جدید</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>عنوان</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.title || row.name}</td>
              <td>{row.status}</td>
              <td>
                <button onClick={() => setEditContent(row)}>ویرایش</button>{" "}
                <button onClick={() => archive(row.id)}>بایگانی</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function AdminUsers() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/users", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setRows(data.users || []))
      .catch(() => setRows([]));
  }, []);
  async function changeRole(id: string, role: string) {
    const response = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (response.ok)
      setRows(rows.map((row) => (row.id === id ? { ...row, role } : row)));
    else alert((await response.json()).error);
  }
  return (
    <div className="adminTable">
      <table>
        <thead>
          <tr>
            <th>نام</th>
            <th>ایمیل</th>
            <th>نقش</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>
                <select
                  value={row.role}
                  onChange={(e) => changeRole(row.id, e.target.value)}
                >
                  <option value="ADMIN">مدیر</option>
                  <option value="EDITOR">ویرایشگر</option>
                  <option value="CUSTOMER">مشتری</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function HomepageSettings() {
  const [value, setValue] = useState({
    heroTitle: "",
    heroSubtitle: "",
    ctaText: "",
    ctaLink: "/shop",
    heroMediaId: "",
    heroMediaUrl: "",
    heroMediaType: "",
    bannerMediaIds: [] as string[],
    bannerMediaUrls: [] as string[],
    promotionTitle: "",
    promotionText: "",
    categoryHighlightIds: [] as string[],
    featuredProductIds: [] as string[],
    showBenefits: true,
    showFeaturedProducts: true,
    showCategoryHighlights: true,
    sectionOrder: [
      "hero",
      "benefits",
      "featuredProducts",
      "categoryHighlights",
      "promotions",
      "articles",
      "cta",
    ],
  });
  const [media, setMedia] = useState<any[]>([]);
  const [settingsProducts, setSettingsProducts] = useState<Product[]>([]);
  useEffect(() => {
    Promise.all([
      fetch("/api/settings", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/media", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : { media: [] },
      ),
      fetch("/api/products?admin=1", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : { products: [] },
      ),
    ])
      .then(([settings, mediaData, productData]) => {
        if (settings.settings?.homepage)
          setValue((current) => ({
            ...current,
            ...settings.settings.homepage,
          }));
        setMedia(mediaData.media || []);
        setSettingsProducts(productData.products || []);
      })
      .catch(() => {});
  }, []);
  async function save(e: FormEvent) {
    e.preventDefault();
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key: "homepage", value }),
    });
    if (response.ok) alert("محتوای صفحه اصلی ذخیره شد");
  }
  return (
    <form className="editor" onSubmit={save}>
      <div className="editorHead">
        <div>
          <h2>محتوای صفحه اصلی</h2>
          <small>متن‌های اصلی بدون ویرایش کد ذخیره می‌شوند.</small>
        </div>
        <button className="primary">ذخیره</button>
      </div>
      <div className="editorGrid">
        <section>
          <label>
            عنوان اصلی
            <input
              value={value.heroTitle}
              onChange={(e) =>
                setValue({ ...value, heroTitle: e.target.value })
              }
            />
          </label>
          <label>
            زیرعنوان
            <textarea
              value={value.heroSubtitle}
              onChange={(e) =>
                setValue({ ...value, heroSubtitle: e.target.value })
              }
            />
          </label>
          <label>
            تصویر یا ویدیوی بخش قهرمان
            <select
              value={value.heroMediaId}
              onChange={(e) => {
                const selected = media.find(
                  (item) => item.id === e.target.value,
                );
                setValue({
                  ...value,
                  heroMediaId: selected?.id || "",
                  heroMediaUrl: selected?.url || "",
                  heroMediaType: selected?.fileType || "",
                });
              }}
            >
              <option value="">بدون رسانه</option>
              {media.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.fileType === "VIDEO" ? "ویدیو" : "تصویر"} —{" "}
                  {item.originalFilename || item.name}
                </option>
              ))}
            </select>
          </label>
          {value.heroMediaUrl &&
            (value.heroMediaType === "VIDEO" ? (
              <video src={value.heroMediaUrl} controls width="320" />
            ) : (
              <img src={value.heroMediaUrl} alt="پیش‌نمایش" width="320" />
            ))}
          <fieldset>
            <legend>محصولات ویژه</legend>
            {settingsProducts.map((product) => (
              <label key={product.id}>
                <input
                  type="checkbox"
                  checked={value.featuredProductIds.includes(product.id)}
                  onChange={(e) =>
                    setValue({
                      ...value,
                      featuredProductIds: e.target.checked
                        ? [...value.featuredProductIds, product.id]
                        : value.featuredProductIds.filter(
                            (id) => id !== product.id,
                          ),
                    })
                  }
                />{" "}
                {product.name}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>دسته‌های منتخب</legend>
            {Array.from(
              new Map(
                settingsProducts
                  .filter((product) => product.categoryId)
                  .map((product) => [
                    product.categoryId!,
                    { id: product.categoryId!, name: product.category },
                  ]),
              ).values(),
            ).map((category) => (
              <label key={category.id}>
                <input
                  type="checkbox"
                  checked={value.categoryHighlightIds.includes(category.id)}
                  onChange={(e) =>
                    setValue({
                      ...value,
                      categoryHighlightIds: e.target.checked
                        ? [...value.categoryHighlightIds, category.id]
                        : value.categoryHighlightIds.filter(
                            (id) => id !== category.id,
                          ),
                    })
                  }
                />{" "}
                {category.name}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>بنرهای تبلیغاتی</legend>
            {media
              .filter((item) => item.fileType === "IMAGE")
              .map((item) => (
                <label key={item.id}>
                  <input
                    type="checkbox"
                    checked={value.bannerMediaIds.includes(item.id)}
                    onChange={(e) => {
                      const ids = e.target.checked
                        ? [...value.bannerMediaIds, item.id]
                        : value.bannerMediaIds.filter((id) => id !== item.id);
                      setValue({
                        ...value,
                        bannerMediaIds: ids,
                        bannerMediaUrls: ids
                          .map(
                            (id) => media.find((entry) => entry.id === id)?.url,
                          )
                          .filter(Boolean),
                      });
                    }}
                  />{" "}
                  {item.originalFilename || item.name}
                </label>
              ))}
          </fieldset>
        </section>
        <aside>
          <label>
            متن دکمه
            <input
              value={value.ctaText}
              onChange={(e) => setValue({ ...value, ctaText: e.target.value })}
            />
          </label>
          <label>
            پیوند دکمه
            <input
              value={value.ctaLink}
              onChange={(e) => setValue({ ...value, ctaLink: e.target.value })}
            />
          </label>
          <label>
            عنوان بخش تبلیغاتی
            <input
              value={value.promotionTitle}
              onChange={(e) =>
                setValue({ ...value, promotionTitle: e.target.value })
              }
            />
          </label>
          <label>
            متن بخش تبلیغاتی
            <textarea
              value={value.promotionText}
              onChange={(e) =>
                setValue({ ...value, promotionText: e.target.value })
              }
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={value.showBenefits}
              onChange={(e) =>
                setValue({ ...value, showBenefits: e.target.checked })
              }
            />{" "}
            نمایش مزایا
          </label>
          <label>
            <input
              type="checkbox"
              checked={value.showFeaturedProducts}
              onChange={(e) =>
                setValue({ ...value, showFeaturedProducts: e.target.checked })
              }
            />{" "}
            نمایش محصولات ویژه
          </label>
          <label>
            <input
              type="checkbox"
              checked={value.showCategoryHighlights}
              onChange={(e) =>
                setValue({ ...value, showCategoryHighlights: e.target.checked })
              }
            />{" "}
            نمایش دسته‌های منتخب
          </label>
          <label>
            ترتیب بخش‌ها
            <input
              value={value.sectionOrder.join(",")}
              onChange={(e) =>
                setValue({
                  ...value,
                  sectionOrder: e.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
        </aside>
      </div>
    </form>
  );
}
function SiteSeoSettings() {
  const [value, setValue] = useState({
    title: "",
    description: "",
    ogImageUrl: "",
  });
  const [media, setMedia] = useState<any[]>([]);
  useEffect(() => {
    Promise.all([
      fetch("/api/settings", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/media", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : { media: [] },
      ),
    ])
      .then(([settings, mediaData]) => {
        if (settings.settings?.seo)
          setValue((current) => ({ ...current, ...settings.settings.seo }));
        setMedia(mediaData.media || []);
      })
      .catch(() => {});
  }, []);
  async function save(e: FormEvent) {
    e.preventDefault();
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key: "seo", value }),
    });
    if (response.ok) alert("تنظیمات سئو ذخیره شد");
  }
  return (
    <form className="editor" onSubmit={save}>
      <div className="editorHead">
        <div>
          <h2>سئوی عمومی سایت</h2>
          <small>عنوان، توضیح و تصویر اشتراک‌گذاری</small>
        </div>
        <button className="primary">ذخیره سئو</button>
      </div>
      <div className="editorGrid">
        <section>
          <label>
            عنوان سایت
            <input
              value={value.title}
              maxLength={160}
              onChange={(e) => setValue({ ...value, title: e.target.value })}
            />
          </label>
          <label>
            توضیحات متا
            <textarea
              value={value.description}
              maxLength={320}
              onChange={(e) =>
                setValue({ ...value, description: e.target.value })
              }
            />
          </label>
        </section>
        <aside>
          <label>
            تصویر شبکه‌های اجتماعی
            <select
              value={value.ogImageUrl}
              onChange={(e) =>
                setValue({ ...value, ogImageUrl: e.target.value })
              }
            >
              <option value="">بدون تصویر</option>
              {media
                .filter((item) => item.fileType === "IMAGE")
                .map((item) => (
                  <option key={item.id} value={item.url}>
                    {item.originalFilename || item.name}
                  </option>
                ))}
            </select>
          </label>
        </aside>
      </div>
    </form>
  );
}
function AdminArticles() {
  const [articles, setArticles] = useState(initialArticles);
  return (
    <div className="adminTable">
      <div className="tableTools">
        <input placeholder="جستجوی مقاله..." />
        <button
          className="primary"
          onClick={() =>
            setArticles([
              {
                id: Date.now(),
                slug: "new-article",
                title: "مقاله جدید",
                excerpt: "پیش‌نویس مقاله جدید",
                category: "آموزش",
                image: "#dce4d6",
                date: "امروز",
              },
              ...articles,
            ])
          }
        >
          + مقاله جدید
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>عنوان</th>
            <th>دسته</th>
            <th>تاریخ</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.id}>
              <td>
                <b>{a.title}</b>
              </td>
              <td>{a.category}</td>
              <td>{a.date}</td>
              <td>
                <span className="published">منتشر شده</span>
              </td>
              <td>
                <button>ویرایش</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function ThemeSettings({
  active,
  onApply,
}: {
  active: ThemeId;
  onApply: (t: ThemeId) => void;
}) {
  const [preview, setPreview] = useState<ThemeId>(active);
  const [selected, setSelected] = useState<ThemeId>(active);
  useEffect(() => {
    document.documentElement.dataset.theme = preview;
    return () => {
      document.documentElement.dataset.theme = active;
    };
  }, [preview, active]);
  const current = themes.find((t) => t.id === preview)!;
  return (
    <section className="themeSettings">
      <div className="settingsIntro">
        <span>ظاهر ← پوسته‌ها</span>
        <h2>انتخاب ظاهر برند</h2>
        <p>
          پیش از اعمال، هر پوسته را روی اجزای اصلی بررسی کنید. فقط دکمه «اعمال
          پوسته» انتخاب را برای سایت فعال می‌کند.
        </p>
      </div>
      <div className="themeLayout">
        <div className="themeCards">
          {themes.map((t) => (
            <article
              key={t.id}
              className={`themeChoice ${selected === t.id ? "selected" : ""} ${active === t.id ? "activeTheme" : ""}`}
              onClick={() => setSelected(t.id)}
            >
              <div className="swatches">
                {[
                  t.colors.primary,
                  t.colors.accent,
                  t.colors.background,
                  t.colors.text,
                ].map((c) => (
                  <i key={c} style={{ background: c }} />
                ))}
              </div>
              <div>
                <h3>{t.name}</h3>
                <p>{t.description}</p>
                {active === t.id && <b>پوسته فعال</b>}
              </div>
              <div className="themeActions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(t.id);
                    setPreview(t.id);
                  }}
                >
                  پیش‌نمایش
                </button>
                <button
                  className="primary"
                  disabled={active === t.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(t.id);
                    onApply(t.id);
                  }}
                >
                  اعمال
                </button>
              </div>
            </article>
          ))}
        </div>
        <div className="themePreview">
          <div className="previewHeader">
            <span className="logo">ج</span>
            <b>جوانه سبز</b>
            <small>{current.name}</small>
          </div>
          <div className="previewHero">
            <span>کشاورزی حرفه‌ای</span>
            <h3>رشد بهتر از یک انتخاب درست آغاز می‌شود</h3>
            <p>نمونه نمایش رنگ، تایپوگرافی و سلسله‌مراتب پوسته.</p>
            <button className="primary">مشاهده محصولات</button>
          </div>
          <div className="previewProduct">
            <i></i>
            <div>
              <small>کودهای تخصصی</small>
              <b>محصول نمونه جوانه سبز</b>
              <p>توضیح کوتاه و خوانا برای معرفی محصول</p>
              <strong>۴۸۰٬۰۰۰ تومان</strong>
            </div>
          </div>
          <div className="previewFooter">
            مشاوره تخصصی · ارسال مطمئن · تضمین کیفیت
          </div>
        </div>
      </div>
    </section>
  );
}
function AdminGeneric({ title }: { title: string }) {
  return (
    <div className="genericAdmin">
      <div className="emptyIcon">▦</div>
      <h2>مدیریت {title}</h2>
      <p>
        این بخش برای مدیریت محتوای {title} آماده است و داده‌ها از اینجا قابل
        تغییر خواهند بود.
      </p>
      <button className="primary">افزودن مورد جدید</button>
    </div>
  );
}
function Magazine({ path, articles }: { path: string; articles: Article[] }) {
  const slug = path.split("/")[2];
  const a = articles.find((x) => x.slug === slug);
  if (slug && a)
    return (
      <main className="page articlePage">
        <span>
          {a.category} · {a.date}
        </span>
        <h1>{a.title}</h1>
        <p className="lead">{a.excerpt}</p>
        <div
          className="articleCover"
          style={a.image.startsWith("#") ? { background: a.image } : undefined}
        >
          {!a.image.startsWith("#") && <img src={a.image} alt={a.title} />}{" "}
        </div>
        <article
          className="richContent"
          dangerouslySetInnerHTML={{
            __html: a.content || `<p>${a.excerpt}</p>`,
          }}
        />
        {a.media?.length ? (
          <div className="articleMedia">
            {a.media.map((item) => (
              <figure key={item.id}>
                {item.fileType === "VIDEO" ? (
                  <video src={item.url} controls />
                ) : (
                  <img src={item.url} alt={item.alt || a.title} />
                )}{" "}
                {item.caption && <figcaption>{item.caption}</figcaption>}
              </figure>
            ))}
          </div>
        ) : null}
      </main>
    );
  return (
    <main className="page">
      <div className="pageTitle">
        <span>مجله جوانه سبز</span>
        <h1>دانش کاربردی برای کشاورزی بهتر</h1>
      </div>
      <div className="grid articles">
        {articles.map((a) => (
          <ArticleCard key={a.id} a={a} />
        ))}
      </div>
    </main>
  );
}
function AccountPage({
  path,
  onAdd,
}: {
  path: string;
  onAdd: (p: Product) => void;
}) {
  const [account, setAccount] = useState<any>(null);
  const [error, setError] = useState("");
  const section =
    path === "/favorites" ? "favorites" : path.split("/")[2] || "overview";
  const load = () =>
    fetch("/api/account", { cache: "no-store" })
      .then((r) => {
        if (r.status === 401) {
          go("/login?returnTo=" + encodeURIComponent(path));
          return null;
        }
        if (!r.ok) throw new Error("ACCOUNT_LOAD_FAILED");
        return r.json();
      })
      .then((data) => data && setAccount(data))
      .catch(() => setError("دریافت اطلاعات حساب ممکن نشد."));
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function addAddress(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const response = await fetch("/api/addresses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    if (!response.ok)
      return setError("نشانی ذخیره نشد. اطلاعات را بررسی کنید.");
    e.currentTarget.reset();
    setError("");
    load();
  }
  if (!account && !error)
    return (
      <main className="page">
        <div className="empty">در حال دریافت حساب…</div>
      </main>
    );
  return (
    <main className="page accountPage">
      <div className="pageTitle">
        <span>باشگاه مشتریان</span>
        <h1>حساب کاربری من</h1>
        <p>{account?.user?.name}</p>
      </div>
      <div className="accountLayout">
        <aside className="accountNav">
          {[
            ["overview", "نمای کلی"],
            ["orders", "سفارش‌ها"],
            ["addresses", "نشانی‌ها"],
            ["favorites", "علاقه‌مندی‌ها"],
          ].map(([key, label]) => (
            <button
              className={section === key ? "active" : ""}
              key={key}
              onClick={() =>
                go(
                  key === "favorites"
                    ? "/favorites"
                    : `/account/${key === "overview" ? "" : key}`,
                )
              }
            >
              {label}
            </button>
          ))}
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              go("/login");
            }}
          >
            خروج از حساب
          </button>
        </aside>
        <section className="accountContent">
          {error && <div className="error">{error}</div>}
          {section === "overview" && account && (
            <div className="accountSummary">
              <div>
                <b>{account.orders.length}</b>
                <span>سفارش</span>
              </div>
              <div>
                <b>{account.addresses.length}</b>
                <span>نشانی</span>
              </div>
              <div>
                <b>{account.wishlist.length}</b>
                <span>علاقه‌مندی</span>
              </div>
            </div>
          )}
          {section === "orders" && (
            <div className="adminTable">
              <h3>سفارش‌های من</h3>
              {account?.orders?.length ? (
                account.orders.map((order: any) => (
                  <p key={order.id}>
                    {order.number} — {money(order.total)} — {order.status}
                  </p>
                ))
              ) : (
                <div className="empty">هنوز سفارشی ثبت نکرده‌اید.</div>
              )}
            </div>
          )}
          {section === "addresses" && (
            <>
              <form className="contactForm" onSubmit={addAddress}>
                <label>
                  استان
                  <input name="province" required />
                </label>
                <label>
                  شهر
                  <input name="city" required />
                </label>
                <label className="full">
                  نشانی
                  <textarea name="address" required />
                </label>
                <label>
                  کد پستی
                  <input name="postalCode" required />
                </label>
                <button className="primary">ذخیره نشانی</button>
              </form>
              <div className="addressList">
                {account?.addresses?.map((address: any) => (
                  <article key={address.id}>
                    <b>
                      {address.province}، {address.city}
                    </b>
                    <p>{address.address}</p>
                    <small>{address.postalCode}</small>
                    <button
                      onClick={async () => {
                        await fetch(`/api/addresses?id=${address.id}`, {
                          method: "DELETE",
                        });
                        load();
                      }}
                    >
                      حذف
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
          {section === "favorites" && (
            <div className="grid products">
              {account?.wishlist?.length ? (
                account.wishlist.map((product: Product) => (
                  <ProductCard key={product.id} p={product} onAdd={onAdd} />
                ))
              ) : (
                <div className="empty">هنوز محصولی ذخیره نکرده‌اید.</div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
function SimplePage({ path }: { path: string }) {
  const pages: Record<string, [string, string]> = {
    about: [
      "درباره جوانه سبز",
      "ما برای پیوند دانش روز با تجربه ارزشمند کشاورزان کار می‌کنیم؛ با تمرکز بر کیفیت، صداقت و همراهی واقعی.",
    ],
    contact: [
      "با ما در ارتباط باشید",
      "برای مشاوره محصول، پیگیری سفارش یا همکاری با شبکه نمایندگان پیام بفرستید.",
    ],
    representatives: [
      "نمایندگان جوانه سبز",
      "شبکه نمایندگان استانی برای دسترسی سریع‌تر و پشتیبانی نزدیک‌تر.",
    ],
    training: [
      "آموزش و راهکارها",
      "محتوای ساده و کاربردی برای تصمیم‌های دقیق‌تر در مزرعه و باغ.",
    ],
    events: ["رویدادها", "کارگاه‌ها، روز مزرعه و برنامه‌های آموزشی پیش رو."],
    account: [
      "حساب کاربری من",
      "سفارش‌ها، نشانی‌ها و علاقه‌مندی‌های خود را مدیریت کنید.",
    ],
    terms: ["قوانین و شرایط", "شرایط استفاده از خدمات جوانه سبز."],
    privacy: [
      "حریم خصوصی",
      "اطلاعات شما فقط برای ارائه خدمات و پیگیری سفارش استفاده می‌شود.",
    ],
    shipping: [
      "ارسال سفارش",
      "شیوه و هزینه ارسال پس از بررسی مقصد و نوع کالا اعلام می‌شود.",
    ],
    returns: [
      "شرایط بازگشت",
      "درخواست بازگشت بر اساس سلامت بسته‌بندی و قوانین کالا بررسی می‌شود.",
    ],
  };
  const key = path.split("/")[1] || "about";
  const item = pages[key] || ["صفحه مورد نظر", "این بخش در حال تکمیل است."];
  return (
    <main className="page narrow">
      <div className="pageTitle">
        <h1>{item[0]}</h1>
        <p>{item[1]}</p>
      </div>
      {key === "contact" && (
        <form
          className="contactForm"
          onSubmit={(e) => {
            e.preventDefault();
            alert("پیام شما ثبت شد.");
          }}
        >
          <label>
            نام و نام خانوادگی
            <input required />
          </label>
          <label>
            شماره همراه
            <input required />
          </label>
          <label className="full">
            موضوع
            <input required />
          </label>
          <label className="full">
            پیام
            <textarea required rows={5} />
          </label>
          <button className="primary">ارسال پیام</button>
        </form>
      )}
    </main>
  );
}
function NotFound() {
  return (
    <main className="page">
      <div className="empty">
        <h1>۴۰۴</h1>
        <h2>این صفحه پیدا نشد</h2>
        <button className="primary" onClick={() => go("/")}>
          بازگشت به خانه
        </button>
      </div>
    </main>
  );
}
function Forbidden() {
  return (
    <main className="page">
      <div className="empty">
        <h1>دسترسی محدود</h1>
        <p>برای مشاهده این بخش باید با حساب مدیر وارد شوید.</p>
        <button className="primary" onClick={() => go("/login")}>
          ورود به حساب
        </button>
      </div>
    </main>
  );
}
export function JavanehApp() {
  const [path, setPath] = useState("/");
  const [products, setProductsState] = useState(initialProducts);
  const [cart, setCartState] = useState<Record<string, number>>({});
  const [role, setRoleState] = useState("");
  const [theme, setTheme] = useState<ThemeId>("natural");
  const [homepage, setHomepage] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  useEffect(() => {
    const sync = () => setPath(location.pathname);
    sync();
    addEventListener("popstate", sync);
    setCartState(JSON.parse(localStorage.getItem("js-cart") || "{}"));
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((session) => {
        const nextRole = session.user?.role || "";
        setRoleState(nextRole);
        return fetch(
          nextRole === "ADMIN" || nextRole === "EDITOR"
            ? "/api/products?admin=1"
            : "/api/products",
          { cache: "no-store" },
        );
      })
      .then((r) => r.json())
      .then((data) => data.products && setProductsState(data.products))
      .catch(() => setProductsState(initialProducts));
    fetch("/api/theme", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setTheme(d.theme);
        document.documentElement.dataset.theme = d.theme;
      })
      .catch(() => {});
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setHomepage(data.settings?.homepage || null);
        if (data.settings?.seo?.title) document.title = data.settings.seo.title;
        const description = document.querySelector('meta[name="description"]');
        if (description && data.settings?.seo?.description)
          description.setAttribute("content", data.settings.seo.description);
      })
      .catch(() => {});
    fetch("/api/articles", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => data.articles?.length && setArticles(data.articles))
      .catch(() => {});
    return () => removeEventListener("popstate", sync);
  }, []);
  const setProducts = (p: Product[]) => {
    setProductsState(p);
  };
  const setCart = (c: Record<string, number>) => {
    setCartState(c);
    localStorage.setItem("js-cart", JSON.stringify(c));
  };
  const add = (p: Product) => {
    setCart({ ...cart, [p.id]: (cart[p.id] || 0) + 1 });
  };
  const login = (r: string) => {
    setRoleState(r);
  };
  const applyTheme = async (t: ThemeId) => {
    const response = await fetch("/api/theme", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ theme: t }),
    });
    if (response.ok) {
      setTheme(t);
      document.documentElement.dataset.theme = t;
    }
  };
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  if (path === "/login") return <Login onLogin={login} />;
  if (path.startsWith("/admin"))
    return (
      <Admin
        products={products}
        setProducts={setProducts}
        role={role}
        path={path}
        theme={theme}
        onTheme={applyTheme}
      />
    );
  let content;
  if (path === "/")
    content = (
      <Home
        products={products}
        onAdd={add}
        homepage={homepage}
        articles={articles}
      />
    );
  else if (path === "/shop" || path.startsWith("/shop/"))
    content = <Shop products={products} onAdd={add} path={path} />;
  else if (path.startsWith("/product/"))
    content = (
      <ProductPage
        p={products.find((p) => p.slug === path.split("/")[2])}
        onAdd={add}
      />
    );
  else if (path === "/cart")
    content = <Cart cart={cart} setCart={setCart} products={products} />;
  else if (path === "/checkout")
    content = (
      <Checkout cart={cart} products={products} onDone={() => setCart({})} />
    );
  else if (
    path === "/account" ||
    path.startsWith("/account/") ||
    path === "/favorites"
  )
    content = <AccountPage path={path} onAdd={add} />;
  else if (path.startsWith("/magazine"))
    content = <Magazine path={path} articles={articles} />;
  else if (path === "/search") {
    const q = new URLSearchParams(location.search).get("q") || "";
    content = (
      <main className="page">
        <div className="pageTitle">
          <h1>نتایج جستجو برای «{q}»</h1>
        </div>
        <div className="grid products">
          {products
            .filter((p) => (p.name + p.category).includes(q))
            .map((p) => (
              <ProductCard key={p.id} p={p} onAdd={add} />
            ))}
        </div>
      </main>
    );
  } else if (
    [
      "/about",
      "/contact",
      "/representatives",
      "/training",
      "/events",
      "/terms",
      "/privacy",
      "/shipping",
      "/returns",
    ].includes(path)
  )
    content = <SimplePage path={path} />;
  else content = <NotFound />;
  return (
    <>
      <Header cartCount={count} />
      {content}
      <MobileNav cartCount={count} />
      <Footer />
    </>
  );
}
