"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getBrowserSupabase } from "@/data/supabase/browser-client";
import { Button } from "@/components/ui/Button";
import { Field, FormError, TextInput } from "./fields";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error } = await getBrowserSupabase().auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) {
          setError(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
          return;
        }
        router.replace("/admin");
        router.refresh();
      }}
    >
      <Field label="E-mail">
        <TextInput type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Senha">
        <TextInput type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <FormError message={error} />
      <Button type="submit" block size="lg" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />} Entrar
      </Button>
    </form>
  );
}
