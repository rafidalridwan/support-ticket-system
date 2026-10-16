/** ASCII → Bengali numerals (matches backend `LocaleDigits::asciiToBengali`). */
const ASCII_TO_BENGALI = {
    0: "০",
    1: "১",
    2: "২",
    3: "৩",
    4: "৪",
    5: "৫",
    6: "৬",
    7: "৭",
    8: "৮",
    9: "৯",
};

const BENGALI_TO_ASCII = Object.fromEntries(
    Object.entries(ASCII_TO_BENGALI).map(([a, b]) => [b, a]),
);

export function asciiDigitsToBengali(value) {
    return String(value).replace(/[0-9]/g, (d) => ASCII_TO_BENGALI[d] ?? d);
}

export function bengaliDigitsToAscii(value) {
    return String(value).replace(/[০-৯]/g, (d) => BENGALI_TO_ASCII[d] ?? d);
}

/** Display stored code: Bengali digits when admin UI is `bn`, otherwise as stored. */
export function formatCodeForUiLocale(code, adminLocale) {
    const raw = String(code ?? "").trim();
    if (!raw) return "";
    return adminLocale === "bn" ? asciiDigitsToBengali(raw) : raw;
}

/** Normalize for search/compare (ASCII digits, lowercased). */
export function normalizeCodeForSearch(value) {
    return bengaliDigitsToAscii(String(value ?? "")).toLowerCase();
}
