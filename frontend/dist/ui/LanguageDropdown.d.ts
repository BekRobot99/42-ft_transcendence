import type { Language } from "../languageService.js";
export interface LanguageDropdownOptions {
    className?: string;
    position?: 'right' | 'left' | 'center';
    containerClassName?: string;
    onLanguageChange?: (newLanguage: Language) => void;
}
export declare function createLanguageDropdown(app: any, options?: LanguageDropdownOptions): HTMLElement;
//# sourceMappingURL=LanguageDropdown.d.ts.map