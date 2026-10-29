import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "이용약관",
  description: "퍼모위키 서비스 이용약관.",
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">이용약관</h1>
      <p className="mb-8 text-sm text-muted-foreground">최종 업데이트: 2026-09-12</p>

      <div className="space-y-6 text-sm leading-relaxed text-foreground">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1. 서비스 개요</h2>
          <p>
            퍼모위키는 퍼스널 모빌리티(전동킥보드·전기자전거·외발휠 등)의 스펙,
            중고 시세, 고질병·직거래 체크리스트 등 정보를 제공하는 웹
            서비스입니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2. 정보의 성격</h2>
          <p>
            게시된 시세·스펙·수리비 등은 참고용이며, 실제 거래가·제품 상태와
            다를 수 있습니다. 거래·구매 결정은 이용자 본인의 판단과 책임으로
            이루어져야 합니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3. 지식재산권</h2>
          <p>
            서비스의 콘텐츠·상표·디자인에 대한 권리는 퍼모위키 또는 정당한
            권리자에게 있습니다. 무단 복제·배포를 금합니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4. 광고</h2>
          <p>
            서비스에는 제3자 광고(Google AdSense 등)가 게재될 수 있습니다. 광고
            내용에 대한 책임은 해당 광고주에게 있습니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">5. 면책</h2>
          <p>
            천재지변, 통신 장애, 제3자 서비스 장애 등 합리적으로 통제하기 어려운
            사유로 인한 손해에 대해 법령이 허용하는 범위 내에서 책임을 제한할 수
            있습니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">6. 준거법</h2>
          <p>본 약관은 대한민국 법령을 준거법으로 합니다.</p>
        </section>

        <p className="pt-4">
          <Link href="/privacy" className="text-blue-600 underline">
            개인정보처리방침 보기
          </Link>
        </p>
      </div>
    </main>
  );
}
