export type Language = 'en' | 'de' | 'fr';
/**
 * Returns the currently active language.
 * @returns {Language} The current language code.
 */
export declare function getCurrentLanguage(): Language;
/**
 * Updates the active language and persists it to localStorage.
 * @param {Language} lang The language to set.
 */
export declare function updateLanguage(lang: Language): void;
/**
 * Translates a string based on the current language.
 * @param {string} en The English translation.
 * @param {string} de The German translation.
 * @param {string} fr The French translation.
 * @returns {string} The translated string for the current language.
 */
export declare function translate(en: string, de: string, fr: string): string;
//# sourceMappingURL=languageService.d.ts.map