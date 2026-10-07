import Image from "next/image";
import Link from "next/link";

/** 404 para endereços fora do catálogo (ex.: link digitado errado) */
export default function RootNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <Image src="/brand/logo-full.webp" alt="Omega Anime Style" width={811} height={408} className="mx-auto h-auto w-48" />
        <h1 className="mt-8 font-display text-2xl font-bold">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted">O link pode estar incompleto. Que tal ver o catálogo?</p>
        <Link href="/catalogo" className="mt-6 inline-flex h-12 items-center rounded-[var(--radius-control)] bg-gold-metal px-6 font-semibold text-gold-ink">
          Ver catálogo
        </Link>
      </div>
    </main>
  );
}
