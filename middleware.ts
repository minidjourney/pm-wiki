import { NextResponse, type NextRequest } from "next/server";
import {
  LOCALE_COOKIE_NAME,
  detectPreferredAutoLocale,
  type AutoLocaleCode,
} from "@/lib/locale";

function shouldSkip(pathname: string): boolean {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname === "/ads.txt" || pathname.startsWith("/ads.txt/")) return true;
  if (pathname === "/sitemap.xml" || pathname.startsWith("/sitemap")) return true;
  if (pathname === "/robots.txt") return true;
  if (pathname === "/favicon.ico") return true;
  // Do not touch /ja routes
  if (pathname === "/ja" || pathname.startsWith("/ja/")) return true;
  // Static assets (images, fonts, etc.)
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;
  return false;
}

function resolvePreferredLocale(request: NextRequest): AutoLocaleCode | "skip" {
  const raw = request.cookies.get(LOCALE_COOKIE_NAME)?.value?.trim().toLowerCase();
  // Manual LanguageSwitcher preference ALWAYS wins — never override with Accept-Language/geo.
  if (raw === "ko" || raw === "en") return raw;
  if (raw === "ja") return "skip";

  return detectPreferredAutoLocale({
    acceptLanguage: request.headers.get("accept-language"),
    country:
      request.headers.get("x-vercel-ip-country") ??
      request.headers.get("cf-ipcountry"),
  });
}

/**
 * Map KO ↔ EN for home + model detail only (no loops).
 * Returns null when already on the correct locale path.
 */
function redirectPath(
  preferred: AutoLocaleCode,
  pathname: string
): string | null {
  const isEn = pathname === "/en" || pathname.startsWith("/en/");

  if (preferred === "en") {
    if (isEn) return null;
    if (pathname === "/" || pathname === "") return "/en";
    if (pathname.startsWith("/models/")) return `/en${pathname}`;
    return null;
  }

  // preferred === "ko"
  if (!isEn) return null;
  if (pathname === "/en" || pathname === "/en/") return "/";
  if (pathname.startsWith("/en/models/")) return pathname.slice(3) || "/";
  return null;
}

function withPathname(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (shouldSkip(pathname)) return withPathname(request);

  const preferred = resolvePreferredLocale(request);
  if (preferred === "skip") return withPathname(request);

  const target = redirectPath(preferred, pathname);
  if (!target) return withPathname(request);

  const url = request.nextUrl.clone();
  url.pathname = target;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image).*)",
  ],
};
