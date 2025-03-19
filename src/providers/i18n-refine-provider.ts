import { I18nProvider } from "@refinedev/core";
import esCommon from "../i18n/es/common.json";

export const i18nProvider: I18nProvider = {
  translate: (key: string, params?: object) => {
    const keys = key.split(".");
    let value: any = esCommon;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        return key;
      }
    }

    if (typeof value === "string" && params) {
      return Object.entries(params).reduce(
        (acc, [key, value]) => acc.replace(`{{${key}}}`, String(value)),
        value
      );
    }

    return value;
  },
  changeLocale: () => Promise.resolve(),
  getLocale: () => "es",
}; 