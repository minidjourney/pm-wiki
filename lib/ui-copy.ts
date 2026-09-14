/**
 * UI chrome strings (labels/headings). Content copy lives in DB locale fields (*_en / *_ja).
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
  searchTitle: string;
  searchDescription: string;
  searchPlaceholder: string;
  searchLoading: string;
  searchEmpty: string;
  searchEmptyHint: string;
  searchGroupModels: string;
  searchAria: string;
  scoreSuffix: (n: string | number) => string;
  valueScoreLabel: (n: string | number) => string;
  compareAdd: string;
  compareRemove: string;
  compareAdded: string;
  compareShort: string;
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
  searchTitle: "기기 검색",
  searchDescription: "모델명, 제조사, 고질병 키워드로 검색하세요.",
  searchPlaceholder: "모델명, 제조사, 고질병 검색...",
  searchLoading: "목록 불러오는 중...",
  searchEmpty: "검색 결과가 없습니다",
  searchEmptyHint: "다른 키워드로 시도해 보세요.",
  searchGroupModels: "모델",
  searchAria: "검색",
  scoreSuffix: (n) => `${n}점`,
  valueScoreLabel: (n) => `가성비 ${n}`,
  compareAdd: "VS 비교함 담기",
  compareRemove: "비교함에서 제거",
  compareAdded: "담김",
  compareShort: "VS",
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
    `Opens eBay and Facebook Marketplace search results for "${modelName}".`,
  checklistItem: (n) => `Checklist item ${n}`,
  checklistFallback: "See details.",
  loadMore: (remaining) => `Load more (${remaining} left)`,
  showing: (visible, total) => `Showing ${visible} of ${total}`,
  emptyCategory: "No models in this category yet.",
  searchTitle: "Search models",
  searchDescription: "Search by model, brand, or known-issue keywords.",
  searchPlaceholder: "Model, brand, or known issues...",
  searchLoading: "Loading models...",
  searchEmpty: "No results",
  searchEmptyHint: "Try a different keyword.",
  searchGroupModels: "Models",
  searchAria: "Search",
  scoreSuffix: (n) => `${n}`,
  valueScoreLabel: (n) => `Value ${n}`,
  compareAdd: "Add to compare",
  compareRemove: "Remove from compare",
  compareAdded: "Added",
  compareShort: "VS",
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


const ja: UiCopy = {
  home: "ホーム",
  discontinued: "販売終了",
  expertComment: "専門家コメント",
  priceAnalysis: "相場分析",
  keySpecs: "主要スペック",
  deviceTips: "使い方・メンテナンス",
  appSupported: "純正アプリ対応",
  appUnsupported: "専用アプリ非対応",
  chargerSpec: "推奨充電器",
  batteryCheck: "バッテリー状態の確認方法",
  prosCons: "メリット · デメリット",
  pros: "メリット",
  cons: "デメリット",
  knownIssues: "注意点・既知の不具合",
  caution: "注意",
  checklist: "対面取引チェックリスト",
  faq: "よくある質問",
  findListings: "🔍 中古出品を探す",
  findListingsHint: (modelName) =>
    `各韓国マーケットで「${modelName}」の検索結果を開きます。`,
  checklistItem: (n) => `チェック項目 ${n}`,
  checklistFallback: "詳細を確認してください。",
  loadMore: (remaining) => `もっと見る（残り ${remaining}）`,
  showing: (visible, total) => `${total}件中 ${visible}件表示`,
  emptyCategory: "このカテゴリのモデルはまだありません。",
  searchTitle: "モデル検索",
  searchDescription: "モデル名・メーカー・注意点キーワードで検索できます。",
  searchPlaceholder: "モデル、メーカー、注意点…",
  searchLoading: "読み込み中…",
  searchEmpty: "結果がありません",
  searchEmptyHint: "別のキーワードで試してください。",
  searchGroupModels: "モデル",
  searchAria: "検索",
  scoreSuffix: (n) => `${n}`,
  valueScoreLabel: (n) => `コスパ ${n}`,
  compareAdd: "比較に追加",
  compareRemove: "比較から削除",
  compareAdded: "追加済み",
  compareShort: "VS",
  yearSuffix: (y) => `${y}年`,
  hoursApprox: (h) => `約${h}時間`,
  specs: {
    releaseYear: "発売年",
    maxSpeed: "最高速度",
    rangeOfficial: "公称走行距離",
    motorRated: "定格出力",
    motorPeak: "最大出力",
    batteryWh: "バッテリー容量",
    batteryDetail: "バッテリー詳細",
    chargeTime: "充電時間",
    maxLoad: "最大積載",
    weight: "車両重量",
    tireSize: "タイヤサイズ",
    brake: "ブレーキ",
    suspension: "サスペンション",
    dimensions: "サイズ",
  },
};


const BY_LOCALE: Record<LocaleCode, UiCopy> = { ko, en, ja };

export function uiCopy(locale: LocaleCode = "ko"): UiCopy {
  return BY_LOCALE[locale] ?? ko;
}

/** Soft-localize Korean duration fragments in free-text fields (e.g. charger_spec). */
export function localizeKoDuration(
  text: string | null | undefined,
  locale: LocaleCode = "ko"
): string | null {
  if (text == null) return null;
  const value = text.trim();
  if (!value) return null;
  if (locale === "en") {
    return value
      .replace(/약\s*(\d+(?:\.\d+)?)\s*시간/g, "~$1 hrs")
      .replace(/(\d+(?:\.\d+)?)\s*시간/g, "$1 hrs");
  }
  if (locale === "ja") {
    return value
      .replace(/약\s*(\d+(?:\.\d+)?)\s*시간/g, "約$1時間")
      .replace(/(\d+(?:\.\d+)?)\s*시간/g, "$1時間")
      .replace(/~\s*(\d+(?:\.\d+)?)\s*hrs?/gi, "約$1時間")
      .replace(/(\d+(?:\.\d+)?)\s*hrs?/gi, "$1時間");
  }
  return value;
}
