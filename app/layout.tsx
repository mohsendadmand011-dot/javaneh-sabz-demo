import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "جوانه سبز | نهاده و راهکار کشاورزی",
    template: "%s | جوانه سبز",
  },
  description: "فروش تخصصی نهاده‌های کشاورزی، آموزش و مشاوره برای کشت پربارتر",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "جوانه سبز",
    description: "همراه مطمئن کشاورزان حرفه‌ای",
    locale: "fa_IR",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
