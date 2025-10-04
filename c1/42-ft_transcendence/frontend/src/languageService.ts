export type Language = 'en' | 'de' | 'fr';

const supportedLanguages: Language[] = ['en', 'de', 'fr'];
const defaultLanguage: Language = 'en';

/**
 * Loads the language from localStorage if it exists and is supported.
 * @returns {Language | null} The saved language or null.
 */
function loadSavedLanguage(): Language | null {
    const lang = localStorage.getItem('language');
    if (lang && supportedLanguages.includes(lang as Language)) {
        return lang as Language;
    }
    return null;
}

/**
 * Detects the browser's preferred language if supported, otherwise defaults.
 * @returns {Language} The browser's language or the default language.
 */
function detectBrowserLanguage(): Language {
    const lang = navigator.language.split('-')[0];
    if (supportedLanguages.includes(lang as Language)) {
        return lang as Language;
    }
    return defaultLanguage;
}

// Determine the initial language.
let currentLanguage: Language = loadSavedLanguage() || detectBrowserLanguage();

/**
 * Returns the currently active language.
 * @returns {Language} The current language code.
 */
export function getCurrentLanguage(): Language {
    return currentLanguage;
}

/**
 * Updates the active language and persists it to localStorage.
 * @param {Language} lang The language to set.
 */
export function updateLanguage(lang: Language): void {
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
export function translate(en: string, de: string, fr: string): string {
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
