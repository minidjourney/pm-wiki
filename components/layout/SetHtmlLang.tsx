"use client";

import { useEffect } from "react";

/** Sets <html lang> for nested locale layouts (root layout stays ko). */
export function SetHtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    const prev = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = prev || "ko";
    };
  }, [lang]);

  return null;
}
