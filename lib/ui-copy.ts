/**
 * UI chrome strings (labels/headings). Content copy lives in DB *_en fields.
 */
import type { LocaleCode } from "@/lib/locale";

export type UiCopy = {
  home: string;
  discontinued: string;
  expertComment: string;
  priceAnalysis: string;
  keySpecs: string;
  deviceTips: string;
  appSupported: string;
  appUnsupported: string;
  chargerSpec: string;
  batteryCheck: string;
  prosCons: string;
  pros: string;
  cons: string;
  knownIssues: string;
  caution: string;
  checklist: string;
  faq: string;
  findListings: string;
  findListingsHint: (modelName: string) => string;
  checklistItem: (n: number) => string;
  checklistFallback: string;
  loadMore: (remaining: number) => string;
  showing: (visible: number, total: number) => string;
  emptyCategory: string;
  yearSuffix: (y: string | number) => string;
  hoursApprox: (h: string | number) => string;
  specs: {
    releaseYear: string;
    maxSpeed: string;
    rangeOfficial: string;
    motorRated: string;
    motorPeak: string;
    batteryWh: string;
    batteryDetail: string;
    chargeTime: string;
    maxLoad: string;
    weight: string;
    tireSize: string;
    brake: string;
    suspension: string;
    dimensions: string;
  };
};

const ko: UiCopy = {
  home: "홈",
  discontinued: "단종",
  expertComment: "전문가 코멘트",
  priceAnalysis: "시세 분석",
  keySpecs: "핵심 스펙",
  deviceTips: "기기 사용 및 관리 팁",
  appSupported: "정품 스마트폰 앱 연동 지원",
  appUnsupported: "전용 앱 미지원",
  chargerSpec: "권장 충전기 스펙",
  batteryCheck: "배터리 상태 확인 방법",
  prosCons: "장점 · 단점",
  pros: "장점",
  cons: "단점",
  knownIssues: "고질병 · 주의사항",
  caution: "주의",
  checklist: "현장 직거래 체크리스트",
  faq: "자주 묻는 질문",
  findListings: "🔍 실시간 중고 매물 찾아보기",
  findListingsHint: (modelName) =>
    `클릭 시 해당 플랫폼에서 "${modelName}" 검색 결과로 이동합니다.`,
  checklistItem: (n) => `체크리스트 항목 ${n}`,
  checklistFallback: "상세 내용을 확인해주세요.",
  loadMore: (remaining) => `더 보기 (${remaining}개 남음)`,
  showing: (visible, total) => `${total}개 중 ${visible}개 표시 중`,
  emptyCategory: "선택한 카테고리에 해당하는 기기가 없습니다.",
  yearSuffix: (y) => `${y}년`,
  hoursApprox: (h) => `약 ${h}시간`,
  specs: {
    releaseYear: "출시 연도",
    maxSpeed: "최고 속도",
    rangeOfficial: "공식 주행거리",
    motorRated: "정격 출력",
    motorPeak: "최대 출력",
    batteryWh: "배터리 전력량",
    batteryDetail: "배터리 상세",
    chargeTime: "충전 소요시간",
    maxLoad: "최대 하중",
    weight: "기체 무게",
    tireSize: "타이어 크기",
    brake: "브레이크",
    suspension: "서스펜션",
    dimensions: "기체 크기",
  },
};

const en: UiCopy = {
  home: "Home",
  discontinued: "Discontinued",
  expertComment: "Expert note",
  priceAnalysis: "Price analysis",
  keySpecs: "Key specs",
  deviceTips: "Care & usage tips",
  appSupported: "Official app supported",
  appUnsupported: "No dedicated app",
  chargerSpec: "Recommended charger",
  batteryCheck: "How to check battery health",
  prosCons: "Pros · Cons",
  pros: "Pros",
  cons: "Cons",
  knownIssues: "Known issues",
  caution: "Caution",
  checklist: "In-person checklist",
  faq: "FAQ",
  findListings: "🔍 Find used listings",
  findListingsHint: (modelName) =>
    `Opens search results for "${modelName}" on each Korean marketplace.`,
  checklistItem: (n) => `Checklist item ${n}`,
  checklistFallback: "See details.",
  loadMore: (remaining) => `Load more (${remaining} left)`,
  showing: (visible, total) => `Showing ${visible} of ${total}`,
  emptyCategory: "No models in this category yet.",
  yearSuffix: (y) => `${y}`,
  hoursApprox: (h) => `~${h} hrs`,
  specs: {
    releaseYear: "Release year",
    maxSpeed: "Top speed",
    rangeOfficial: "Official range",
    motorRated: "Rated power",
    motorPeak: "Peak power",
    batteryWh: "Battery capacity",
    batteryDetail: "Battery detail",
    chargeTime: "Charge time",
    maxLoad: "Max load",
    weight: "Weight",
    tireSize: "Tire size",
    brake: "Brakes",
    suspension: "Suspension",
    dimensions: "Dimensions",
  },
};

const BY_LOCALE: Record<"ko" | "en", UiCopy> = { ko, en };

export function uiCopy(locale: LocaleCode = "ko"): UiCopy {
  if (locale === "en") return en;
  return ko;
}
