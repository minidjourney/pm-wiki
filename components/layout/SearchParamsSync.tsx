"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/** 관찰자만 작은 Suspense 경계에 두고, 실제 화면은 정적 HTML에도 남긴다. */
export function SearchParamsSync({ onChange }: { onChange: (query: string) => void }) {
  const query = useSearchParams().toString();
  useEffect(() => {
    onChange(query);
  }, [query, onChange]);
  return null;
}
