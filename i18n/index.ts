import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./ar.json";
import en from "./en.json";
import ku from "./ku.json";

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    ku: { translation: ku },
    en: { translation: en },
  },
  lng: "ar", // Arabic-first
  fallbackLng: "ar",
  interpolation: { escapeValue: false },
  compatibilityJSON: "v4",
});

export default i18n;

/** Helpers for RTL — Arabic and Kurdish are both RTL */
export const isRTL = () => ["ar", "ku"].includes(i18n.language);
export const getDirection = () => (isRTL() ? "rtl" : "ltr");
