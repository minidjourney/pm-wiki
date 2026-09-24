/**
 * EN brand/title helpers: Hangul guards, manufacturer aliases, slug Latinization.
 * Used by locale.ts so EN routes never ship Hangul-only branded titles.
 */

type LocaleCode = "ko" | "en" | "ja";

/** Hangul syllables (가–힣). */
const HANGUL_SYLLABLE_RE = /[\uAC00-\uD7A3]/g;
const LATIN_LETTER_RE = /[A-Za-z]/g;

/** True when the string contains at least one Latin letter. */
export function hasLatin(value: string): boolean {
  LATIN_LETTER_RE.lastIndex = 0;
  return LATIN_LETTER_RE.test(value);
}

/**
 * True when Hangul dominates letter content (Hangul-only, or Hangul ≥ Latin).
 * Used to reject pasted KO strings in model_name_en for EN titles.
 */
export function isHangulHeavy(value: string): boolean {
  const cleaned = value.replace(/\s+/g, "");
  if (!cleaned) return false;
  HANGUL_SYLLABLE_RE.lastIndex = 0;
  LATIN_LETTER_RE.lastIndex = 0;
  const hangul = (cleaned.match(HANGUL_SYLLABLE_RE) ?? []).length;
  if (hangul === 0) return false;
  const latin = (cleaned.match(LATIN_LETTER_RE) ?? []).length;
  if (latin === 0) return true;
  return hangul >= latin;
}

/** Title-case slug tokens: `ninebot-max-g2` → `Ninebot Max G2`. */
export function displayNameFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((token) => {
      const unit = token.match(/^(\d+(?:\.\d+)?)(v|ah|wh|km|w)$/i);
      if (unit) return unit[1] + unit[2].toUpperCase();
      if (/^[a-z]\d+[a-z0-9]*$/i.test(token) && token.length <= 5) {
        return token.toUpperCase();
      }
      if (/^[a-z]+\d+[a-z0-9]*$/i.test(token) && token.length <= 8) {
        const m = token.match(/^([a-z]+)(\d.*)$/i);
        if (m) {
          return (
            m[1].charAt(0).toUpperCase() +
            m[1].slice(1).toLowerCase() +
            m[2].toUpperCase()
          );
        }
      }
      return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
    })
    .join(" ");
}

function stripHangulParenthetical(value: string): string {
  return value
    .replace(/\s*[（(][^）)]*[\uAC00-\uD7A3][^）)]*[）)]\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function brandTokens(value: string): string[] {
  return value
    .trim()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** KO manufacturer → Latin EN display name. */
export const MANUFACTURER_EN_ALIASES: Record<string, string> = {
  "세그웨이 나인봇": "Segway Ninebot",
  "세그웨이": "Segway",
  "나인봇": "Ninebot",
  "샤오미": "Xiaomi",
  "미니모터스": "Minimotors",
  "인모션": "Inmotion",
  "킹송": "KingSong",
  "비고드": "Begode",
  "니우": "NIU",
  "모토벨로": "Motovelo",
  "삼천리자전거": "Samchully",
  "삼천리": "Samchully",
  "카보": "Kaabo",
  "퀄리스포츠": "Qualisports",
  "아폴로": "Apollo",
  "나미": "Nami",
  "베테랑": "Veteran",
  "위페드": "WePed",
  "테버런": "Teverun",
  "야디": "Yadea",
  "이노킴": "Inokim",
  "제로": "Zero",
  "피도": "Fiido",
  "AU테크": "AU Tech",
  "익스트림불": "Extremebull",
  "에코아이": "Eco-i",
  "에코드라이브": "EcoDrive",
  "가젤": "Gazelle",
  "고사이클": "Gocycle",
  "나비": "NAVEE",
  "로드러너": "RoadRunner",
  "리즈앤뮐러": "Riese & Muller",
  "머케인": "Mercane",
  "볼트몬스터": "Volt Monster",
  "브롬톤": "Brompton",
  "슈퍼소코": "Super Soco",
  "스페셜라이즈드": "Specialized",
  "아이마": "AIMA",
  "우양혼다": "Wooyang Honda",
  "이디뚜뚜": "Eddy Tutu",
  "이티와우": "E-TWOW",
  "자이언트": "Giant",
  "지포스": "GForce",
  "카우보이": "Cowboy",
  "캐논데일": "Cannondale",
  "턴": "Tern",
  "트렉": "Trek",
  "호윈": "Horwin",
  "듀얼트론": "Dualtron",
};

const MANUFACTURER_TOKEN_EN: Record<string, string> = {
  "세그웨이": "Segway",
  "나인봇": "Ninebot",
  "샤오미": "Xiaomi",
  "미니모터스": "Minimotors",
  "인모션": "Inmotion",
  "킹송": "KingSong",
  "비고드": "Begode",
  "니우": "NIU",
  "모토벨로": "Motovelo",
  "삼천리자전거": "Samchully",
  "삼천리": "Samchully",
  "카보": "Kaabo",
  "퀄리스포츠": "Qualisports",
  "아폴로": "Apollo",
  "나미": "Nami",
  "베테랑": "Veteran",
  "위페드": "WePed",
  "테버런": "Teverun",
  "야디": "Yadea",
  "이노킴": "Inokim",
  "제로": "Zero",
  "피도": "Fiido",
  "익스트림불": "Extremebull",
  "에코아이": "Eco-i",
  "에코드라이브": "EcoDrive",
  "듀얼트론": "Dualtron",
  "가젤": "Gazelle",
  "고사이클": "Gocycle",
  "나비": "NAVEE",
  "로드러너": "RoadRunner",
  "브롬톤": "Brompton",
  "슈퍼소코": "Super Soco",
  "스페셜라이즈드": "Specialized",
  "자이언트": "Giant",
  "캐논데일": "Cannondale",
  "턴": "Tern",
  "트렉": "Trek",
  "호윈": "Horwin",
};

function latinizeManufacturerTokens(mfr: string): string {
  return brandTokens(mfr)
    .map((tok) => MANUFACTURER_TOKEN_EN[tok] ?? tok)
    .join(" ");
}

/** Prefer Latin manufacturer for EN chrome; KO unchanged. */
export function displayManufacturer(
  manufacturer: string | null | undefined,
  locale: LocaleCode = "ko"
): string {
  const raw = manufacturer?.trim() ?? "";
  if (!raw) return "";
  if (locale !== "en") return raw;

  const exact = MANUFACTURER_EN_ALIASES[raw];
  if (exact) return exact;

  const stripped = stripHangulParenthetical(raw);
  if (stripped && !isHangulHeavy(stripped) && hasLatin(stripped)) {
    return stripped;
  }

  const tokenized = latinizeManufacturerTokens(stripped || raw);
  if (tokenized && !isHangulHeavy(tokenized)) {
    return tokenized;
  }

  if (stripped && hasLatin(stripped)) return stripped;
  return raw;
}

export function isUsableEnDisplayName(
  value: string | null | undefined
): value is string {
  const t = value?.trim();
  if (!t) return false;
  if (isHangulHeavy(t)) return false;
  return true;
}

/** Keep Latin/digit tokens when a KO string is mixed (e.g. "니우 KQi Air"). */
export function latinTokensFromMixed(value: string): string | null {
  const parts = value
    .split(/\s+/)
    .map((p) => p.trim())
    .filter((p) => p && !isHangulHeavy(p) && /[A-Za-z0-9]/.test(p));
  if (!parts.length) return null;
  return parts.join(" ");
}
