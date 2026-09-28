/** Coupang Partners (KO locale only). Public affiliate URLs + required disclosure. */

export const COUPANG_DISCLOSURE =
  "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

const DEFAULT_TRACKING_CODE = "AF0520396";

/** 1차 승인·노출용: 충전기/소모품 위주 2~3개 (순환). */
export type CoupangOffer = {
  textHref: string;
  bannerHref: string;
  bannerSrc: string;
  bannerAlt: string;
  textLabel: string;
};

export const COUPANG_OFFERS: CoupangOffer[] = [
  {
    textHref: "https://link.coupang.com/a/hpxf2XvAHY",
    bannerHref: "https://link.coupang.com/a/hpxgtxeVIz",
    bannerSrc:
      "https://image3.coupangcdn.com/image/affiliate/banner/d8db1ecba903922cf6872b9f816ae774@2x.jpg",
    bannerAlt: "전동킥보드·전기자전거 배터리 충전기 (48V용)",
    textLabel: "쿠팡에서 배터리 충전기 보기",
  },
  {
    textHref: "https://link.coupang.com/a/hpxhNWAC1Q",
    bannerHref: "https://link.coupang.com/a/hpxh99Ql8S",
    bannerSrc:
      "https://img1c.coupangcdn.com/image/affiliate/banner/f0566bd26410bf202f721b7c586ff0b3@2x.jpg",
    bannerAlt: "전동킥보드·전기자전거 멀티 전압 충전기",
    textLabel: "쿠팡에서 멀티 충전기 보기",
  },
  {
    textHref: "https://link.coupang.com/a/hpxiNstbKC",
    bannerHref: "https://link.coupang.com/a/hpxiYzPhQW",
    bannerSrc:
      "https://image7.coupangcdn.com/image/affiliate/banner/2a670e40718663d33230b6f92f0a06a3@2x.jpg",
    bannerAlt: "나인봇·세그웨이용 배터리 충전기",
    textLabel: "쿠팡에서 나인봇 충전기 보기",
  },
];

export function getCoupangTrackingCode(): string {
  return process.env.NEXT_PUBLIC_COUPANG_TRACKING_CODE?.trim() || DEFAULT_TRACKING_CODE;
}

/** Stable pick for SSR (no hydration flicker). Optional seed = slug / guide id. */
export function pickCoupangOffer(seed?: string): CoupangOffer {
  const list = COUPANG_OFFERS;
  if (list.length === 0) {
    throw new Error("COUPANG_OFFERS is empty");
  }
  if (seed && seed.length > 0) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return list[h % list.length]!;
  }
  const day = Math.floor(Date.now() / 86_400_000);
  return list[day % list.length]!;
}

export function isCoupangPartnersEnabled(): boolean {
  return Boolean(getCoupangTrackingCode() && COUPANG_OFFERS.length > 0);
}
