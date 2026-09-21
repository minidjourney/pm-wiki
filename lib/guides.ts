import type { LocaleCode } from "@/lib/locale";

export type GuideSection = {
  id: string;
  title: { ko: string; en: string };
  paragraphs: { ko: string[]; en: string[] };
  checklist?: { ko: string[]; en: string[] };
};

export type Guide = {
  slug: string;
  title: { ko: string; en: string };
  description: { ko: string; en: string };
  publishedAt: string;
  /** Model slugs to surface in the related rail (optional). */
  relatedModelSlugs: string[];
  sections: GuideSection[];
};

export const GUIDES: Guide[] = [
  {
    slug: "used-electric-kickboard-checklist",
    title: {
      ko: "중고 전동킥보드 살 때 체크리스트",
      en: "Used Electric Kickboard Buying Checklist",
    },
    description: {
      ko: "배터리·모터·브레이크·프레임까지, 중고 킥보드 직거래 전에 꼭 확인할 항목을 정리했습니다.",
      en: "Battery, motor, brakes, and frame — what to check before buying a used e-kickboard.",
    },
    publishedAt: "2026-09-21",
    relatedModelSlugs: [],
    sections: [
      {
        id: "before-meet",
        title: {
          ko: "만나기 전에",
          en: "Before you meet",
        },
        paragraphs: {
          ko: [
            "시세·단종 여부·정품 배터리 여부를 먼저 확인하세요. 퍼모위키 모델 페이지의 중고가 밴드와 고질병 메모를 같이 보면 협상 기준이 생깁니다.",
          ],
          en: [
            "Check market price bands, whether the model is discontinued, and if the battery is OEM. Pair this with the used-price band and known issues on each Pumo Wiki model page.",
          ],
        },
        checklist: {
          ko: [
            "판매자 실명·거래 이력 확인",
            "구매 시기·주행거리·충전기 포함 여부 질문",
            "시세 대비 너무 싼 매물 원인 확인",
          ],
          en: [
            "Verify seller identity / history",
            "Ask for purchase date, mileage, and charger inclusion",
            "Ask why a listing is far below market",
          ],
        },
      },
      {
        id: "battery",
        title: { ko: "배터리", en: "Battery" },
        paragraphs: {
          ko: [
            "배터리가 중고 킥보드 가치의 대부분입니다. 팽창·이상 발열·급격한 전압 드롭이 있으면 패스하세요.",
          ],
          en: [
            "The battery is most of a used kickboard's value. Skip units with swelling, abnormal heat, or sharp voltage drop under load.",
          ],
        },
        checklist: {
          ko: [
            "외관 팽창·누액 흔적 없는지",
            "완충 후 실제 주행 체감 거리",
            "정품 충전기로 충전되는지",
          ],
          en: [
            "No swelling or leak marks",
            "Real-world range after a full charge",
            "Charges with the OEM charger",
          ],
        },
      },
      {
        id: "ride-test",
        title: { ko: "시승 체크", en: "Ride test" },
        paragraphs: {
          ko: [
            "가속·제동·조향 유격·이상 소음을 짧은 구간이라도 직접 확인하세요.",
          ],
          en: [
            "Test acceleration, braking, steering play, and unusual noise — even on a short loop.",
          ],
        },
        checklist: {
          ko: [
            "브레이크 잡힘·밀림",
            "스로틀 지연·끊김",
            "접지부·스템 유격",
          ],
          en: [
            "Brake bite and fade",
            "Throttle lag or cutouts",
            "Stem / folding latch play",
          ],
        },
      },
      {
        id: "deal",
        title: { ko: "거래 마무리", en: "Closing the deal" },
        paragraphs: {
          ko: [
            "계좌이체 전 시리얼·구성품 사진을 남기고, 가능하면 공공장소에서 거래하세요.",
          ],
          en: [
            "Photo the serial and included parts before paying. Prefer a public meetup.",
          ],
        },
        checklist: {
          ko: [
            "시리얼·구성품 사진 보관",
            "입금 전 최종 시승",
            "간이 영수증/거래 메모",
          ],
          en: [
            "Keep serial + accessory photos",
            "Final ride check before payment",
            "Simple receipt / trade note",
          ],
        },
      },
    ],
  },
];

export function listGuides(): Guide[] {
  return GUIDES;
}

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function guidePath(slug: string, locale: LocaleCode = "ko"): string {
  const base = `/guides/${slug}`;
  return locale === "en" ? `/en${base}` : base;
}

export function guidesIndexPath(locale: LocaleCode = "ko"): string {
  return locale === "en" ? "/en/guides" : "/guides";
}
