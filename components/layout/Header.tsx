"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, Search, Scale } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SearchModal } from "./SearchModal";
import { useCompareStore, MAX_COMPARE_COUNT } from "@/store/useCompareStore";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const compareCount = useCompareStore((s) => s.items.length);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="text-xl font-bold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            퍼모위키
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
              aria-label="검색 (⌘K)"
            >
              <Search className="size-5" />
            </button>

            {compareCount >= 2 ? (
              <Link
                href="/compare"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
                aria-label="모델 비교"
              >
                <Scale className="size-5" />
                <span className="hidden sm:inline">
                  모델 비교 ({compareCount}/{MAX_COMPARE_COUNT})
                </span>
                <span className="sm:hidden">비교 ({compareCount})</span>
              </Link>
            ) : (
              <span
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground"
                title="2개 이상 담으면 비교하기가 활성화됩니다"
              >
                <Scale className="size-5" />
                <span className="hidden sm:inline">
                  모델 비교 ({compareCount}/{MAX_COMPARE_COUNT})
                </span>
                <span className="sm:hidden">비교 ({compareCount})</span>
              </span>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800 md:hidden"
                  aria-label="메뉴 열기"
                >
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="text-left">메뉴</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1">
                  <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    홈
                  </Link>
                  <Link
                    href="/?category=kickboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    전동킥보드
                  </Link>
                  <Link
                    href="/?category=ebike"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    전기자전거
                  </Link>
                  <Link
                    href="/?category=unicycle"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    전동 외발휠
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
