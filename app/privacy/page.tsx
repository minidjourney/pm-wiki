import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "퍼모위키 개인정보처리방침. 서비스 이용·광고·분석 관련 개인정보 처리 안내.",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">개인정보처리방침</h1>
      <p className="mb-8 text-sm text-muted-foreground">최종 업데이트: 2026-09-12</p>

      <div className="space-y-6 text-sm leading-relaxed text-foreground">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1. 수집하는 정보</h2>
          <p>
            퍼모위키(이하 "서비스")는 회원가입 없이 이용할 수 있습니다. 다만 서비스
            제공·개선·광고 표시를 위해 아래 정보가 자동으로 수집될 수 있습니다.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>접속 로그, 기기·브라우저 정보, IP(대략적 위치 수준)</li>
            <li>쿠키 및 유사 기술(선호 설정, 분석, 광고)</li>
            <li>서비스 내 이용 기록(조회 페이지, 클릭 등)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2. 이용 목적</h2>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>사이트 운영, 보안, 오류 분석</li>
            <li>방문 통계 및 콘텐츠 개선 (Google Analytics 등)</li>
            <li>맞춤·일반 광고 표시 (Google AdSense 등 광고 네트워크)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3. 광고 및 제3자</h2>
          <p>
            서비스는 Google AdSense 등 제3자 광고를 게재할 수 있습니다. 광고
            사업자는 쿠키·기기를 이용해 관심사 기반 광고를 제공할 수 있으며,
            Google의 정책은{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              className="text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google 광고 정책
            </a>
            을 따릅니다. 사용자는 브라우저 설정 또는{" "}
            <a
              href="https://adssettings.google.com/"
              className="text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google 광고 설정
            </a>
            에서 맞춤 광고를 제한할 수 있습니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4. 보관 및 파기</h2>
          <p>
            로그성 정보는 보안·통계 목적에 필요한 기간만 보관 후 파기하거나
            익명화합니다. 법령에 따라 보관이 필요한 경우 해당 기간을 따릅니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">5. 이용자 권리</h2>
          <p>
            쿠키 거부, 맞춤 광고 옵트아웃, 문의 요청이 가능합니다. 문의는 사이트
            운영 채널을 통해 접수합니다.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">6. 정책 변경</h2>
          <p>
            본 방침은 필요 시 개정될 수 있으며, 중요한 변경은 사이트에 고지합니다.
          </p>
        </section>

        <p className="pt-4">
          <Link href="/terms" className="text-blue-600 underline">
            이용약관 보기
          </Link>
        </p>
      </div>
    </main>
  );
}
