import { isSupabaseEnabled } from "@/config/site";
import { defaultSettings } from "@/config/default-settings";
import { getAdminSession } from "@/data/supabase/server-client";
import { loadAdminSettings } from "@/data/admin";
import { AdminTitle } from "@/components/admin/AdminShell";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Configurações" };

export default async function AdminSettingsPage() {
  if (!isSupabaseEnabled) return null;
  const { supabase } = await getAdminSession();
  const remote = await loadAdminSettings(supabase);
  const settings = {
    ...defaultSettings,
    ...remote,
    hero: { ...defaultSettings.hero, ...remote.hero },
    orderMessage: { ...defaultSettings.orderMessage, ...remote.orderMessage },
    collections: remote.collections ?? defaultSettings.collections,
  };
  return (
    <div className="max-w-4xl">
      <AdminTitle title="Configurações" description="Dados da loja, textos e mensagens. As mudanças aparecem no site imediatamente." />
      <SettingsForm initial={settings} />
    </div>
  );
}
