/** Coupang Partners (KO locale only). Public affiliate URLs + required disclosure. */

export const COUPANG_DISCLOSURE =
  "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

const DEFAULT_TRACKING_CODE = "AF0520396";
const DEFAULT_TEXT_LINK = "https://link.coupang.com/a/hpxc4dabOC";
const DEFAULT_BANNER_LINK = "https://link.coupang.com/a/hpxeaSiCRM";
const DEFAULT_BANNER_IMAGE =
  "https://image13.coupangcdn.com/image/affiliate/banner/322a26551388a3aa5a2ce5bd915722bb@2x.jpg";

export function getCoupangTrackingCode(): string {
  return process.env.NEXT_PUBLIC_COUPANG_TRACKING_CODE?.trim() || DEFAULT_TRACKING_CODE;
}

export function getCoupangTextLink(): string {
  return process.env.NEXT_PUBLIC_COUPANG_TEXT_LINK?.trim() || DEFAULT_TEXT_LINK;
}

export function getCoupangBannerLink(): string {
  return process.env.NEXT_PUBLIC_COUPANG_BANNER_LINK?.trim() || DEFAULT_BANNER_LINK;
}

export function getCoupangBannerImage(): string {
  return process.env.NEXT_PUBLIC_COUPANG_BANNER_IMAGE?.trim() || DEFAULT_BANNER_IMAGE;
}

/** Enabled when tracking + text link resolve (defaults ship for pmwiki KO). */
export function isCoupangPartnersEnabled(): boolean {
  return Boolean(getCoupangTrackingCode() && getCoupangTextLink());
}
