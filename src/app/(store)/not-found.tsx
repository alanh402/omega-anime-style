import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <EmptyState
        icon={<SearchX className="h-7 w-7" />}
        title="Não encontramos esta página"
        description="O produto pode ter sido removido ou o link mudou. Procure no catálogo ou fale com a gente."
        action={
          <>
            <ButtonLink href="/catalogo">Ver catálogo</ButtonLink>
            <ButtonLink href="/" variant="outline">
              Página inicial
            </ButtonLink>
          </>
        }
      />
    </div>
  );
}
