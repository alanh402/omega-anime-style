import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s | Painel Omega" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
