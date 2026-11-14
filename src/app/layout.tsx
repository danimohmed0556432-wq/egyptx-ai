import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Amiri, Aref_Ruqaa, Cairo } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

const arefRuqaa = Aref_Ruqaa({
  variable: "--font-ruqaa",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#0A1628",
};

export const metadata: Metadata = {
  title: "EgyptX AI — The National Smart Tourism Ecosystem",
  description:
    "Discover Egypt. Experience History. Shape the Future. EgyptX AI is Egypt's National Smart Tourism Ecosystem powered by Artificial Intelligence.",
  manifest: "/manifest.json",
  keywords: [
    "Egypt",
    "Tourism",
    "AI",
    "Smart Tourism",
    "EgyptX",
    "Travel",
    "Heritage",
  ],
};

import Providers from "@/components/Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} ${arefRuqaa.variable} ${cairo.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('egyptx-theme');
                if (saved === 'light') {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                } else if (saved === 'maspero') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                  document.documentElement.setAttribute('data-theme', 'maspero');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.colorScheme = 'dark';
                }
                var savedLoc = localStorage.getItem('egyptx-locale');
                if (savedLoc === 'ar') {
                  document.documentElement.dir = 'rtl';
                  document.documentElement.lang = 'ar';
                } else if (savedLoc) {
                  document.documentElement.dir = 'ltr';
                  document.documentElement.lang = savedLoc;
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F7F3EB] text-[#1A1510] dark:bg-[#080705] dark:text-[#F5EFE6] transition-colors duration-200">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
