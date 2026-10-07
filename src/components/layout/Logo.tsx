import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

/** Monograma ΩAS da marca. O nome completo fica no texto alternativo e no SEO. */
export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)} aria-label="Omega Anime Style — início">
      <Image
        src="/brand/logo-mark-sm.webp"
        alt="Omega Anime Style"
        width={480}
        height={207}
        priority={priority}
        className="h-8 w-auto sm:h-9"
      />
    </Link>
  );
}
