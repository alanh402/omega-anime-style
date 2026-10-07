"use client";

import { useEffect } from "react";
import { WifiOff } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button, ButtonLink } from "@/components/ui/Button";

/** Falha de carregamento (rede/banco): oferece tentar de novo sem perder o pedido */
export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <EmptyState
        icon={<WifiOff className="h-7 w-7" />}
        title="Não foi possível carregar"
        description="Pode ser a conexão. Seu pedido continua salvo neste aparelho — tente novamente em instantes."
        action={
          <>
            <Button onClick={reset}>Tentar novamente</Button>
            <ButtonLink href="/pedido" variant="outline">
              Ver meu pedido
            </ButtonLink>
          </>
        }
      />
    </div>
  );
}
