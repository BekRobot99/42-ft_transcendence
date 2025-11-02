import { getCurrentLanguage, translate, updateLanguage } from "../languageService.js";
import type { Language } from "../languageService.js";

export interface LanguageDropdownOptions {
    className?: string;
    position?: 'right' | 'left' | 'center';
    containerClassName?: string;
    onLanguageChange?: (newLanguage: Language) => void;
}

export function createLanguageDropdown(app: any, options: LanguageDropdownOptions = {}): HTMLElement {
    const {
        className = 'autumn-language-dropdown',
        position = 'right',
        containerClassName,
        onLanguageChange
    } = options;

    // Create container
    const container = document.createElement('div');
    const defaultContainerClass = position === 'right' ? 'flex justify-end' : 
                                 position === 'left' ? 'flex justify-start' : 
                                 'flex justify-center';
    container.className = containerClassName || defaultContainerClass;
    container.style.marginBottom = '1.5rem';

    // Create dropdown
    const langDropdown = document.createElement('select');
    langDropdown.className = className;

    const languages: { [key in Language]: string } = {
        en: 'English',
        de: 'Deutsch',
        fr: 'Français'
    };

    // Populate options
    for (const [code, name] of Object.entries(languages)) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = name;
        if (getCurrentLanguage() === code) {
            option.selected = true;
        }
        langDropdown.appendChild(option);
    }

    // Add event listener
    langDropdown.addEventListener('change', (e) => {
        const newLang = (e.target as HTMLSelectElement).value as Language;
        updateLanguage(newLang);
        
        // Call custom callback if provided
        if (onLanguageChange) {
            onLanguageChange(newLang);
        } else {
            // Default behavior: re-render current view
            app.renderView(window.location.pathname);
        }
    });

    container.appendChild(langDropdown);
    return container;
}
