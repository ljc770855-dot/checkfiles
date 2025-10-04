import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "天眼查 - 委托查询平台",
  description: "权威、高效的商业及个人信息查询服务",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
