const supportedLanguages = ['en', 'de', 'fr'];
const defaultLanguage = 'en';
/**
 * Loads the language from localStorage if it exists and is supported.
 * @returns {Language | null} The saved language or null.
 */
function loadSavedLanguage() {
    const lang = localStorage.getItem('language');
    if (lang && supportedLanguages.includes(lang)) {
        return lang;
    }
    return null;
}
/**
 * Detects the browser's preferred language if supported, otherwise defaults.
 * @returns {Language} The browser's language or the default language.
 */
function detectBrowserLanguage() {
    const lang = navigator.language.split('-')[0];
    if (supportedLanguages.includes(lang)) {
        return lang;
    }
    return defaultLanguage;
}
// Determine the initial language.
let currentLanguage = loadSavedLanguage() || detectBrowserLanguage();
/**
 * Returns the currently active language.
 * @returns {Language} The current language code.
 */
export function getCurrentLanguage() {
    return currentLanguage;
}
/**
 * Updates the active language and persists it to localStorage.
 * @param {Language} lang The language to set.
 */
export function updateLanguage(lang) {
    if (supportedLanguages.includes(lang)) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
    }
}
/**
 * Translates a string based on the current language.
 * @param {string} en The English translation.
 * @param {string} de The German translation.
 * @param {string} fr The French translation.
 * @returns {string} The translated string for the current language.
 */
export function translate(en, de, fr) {
    switch (currentLanguage) {
        case 'en':
            return en;
        case 'de':
            return de;
        case 'fr':
            return fr;
        default:
            return en;
    }
}
//# sourceMappingURL=languageService.js.map