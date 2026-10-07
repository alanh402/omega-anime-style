"use client";

import { useEffect } from "react";
import type { AnalyticsEvent } from "@/lib/types";
import { track } from "@/lib/analytics";

/** Registra uma visualização (produto/categoria) uma vez por montagem */
export function TrackView({ event }: { event: AnalyticsEvent }) {
  const key = JSON.stringify(event);
  useEffect(() => {
    track(JSON.parse(key) as AnalyticsEvent);
  }, [key]);
  return null;
}
