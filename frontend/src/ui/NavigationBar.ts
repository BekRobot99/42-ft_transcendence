import { translate } from "../languageService.js";
import { createLanguageDropdown } from "./LanguageDropdown.js";


export function renderNavigationBar(app: any): void {
    // Remove existing nav bar if present
    if (app.navBarElement && app.navBarElement.parentNode) {
        app.navBarElement.parentNode.removeChild(app.navBarElement);
    }

    const createNavButton = (text: string) => {
        const button = document.createElement('button');
        button.className = 'autumn-button-nav';
        button.textContent = text;
        return button;
    };

    // Create single top nav bar
    const nav = document.createElement('nav');
    nav.className = 'top-nav-bar';

    // Left side links container
    const leftLinks = document.createElement('div');
    leftLinks.className = 'top-nav-links';

    // Create and add buttons to left side
    const navLinks = [
        {
            text: translate('Chat', 'Chat', 'Chat'),
            onClick: (e: Event) => app.navigateTo('/chat', e)
        },
        {
            text: translate('Friends', 'Freunde', 'Amis'),
            onClick: (e: Event) => app.navigateTo('/friends', e)
        },
        {
            text: translate('Settings', 'Einstellungen', 'Paramètres'),
            onClick: (e: Event) => app.navigateTo('/settings', e)
        },
        {
            text: translate('Log Out', 'Abmelden', 'Se déconnecter'),
            onClick: async () => {
                if (app.disconnectWebSocket) {
                    app.disconnectWebSocket();
                }
                await fetch('/api/signout', { method: 'POST', credentials: 'include' });
                history.replaceState({ path: '/' }, '', '/');
                app.renderView('/');
            }
        }
    ];

    navLinks.forEach(({ text, onClick }) => {
        const button = createNavButton(text);
        button.addEventListener('click', onClick);
        leftLinks.appendChild(button);
    });

    // Right side container
    const rightSection = document.createElement('div');
    rightSection.className = 'top-nav-right';

    // Create language dropdown
    const langSelectorContainer = createLanguageDropdown(app, {
        className: 'autumn-language-dropdown',
        containerClassName: 'flex items-center'
    });
    rightSection.appendChild(langSelectorContainer);

    // Add both sections to nav bar
    nav.appendChild(leftLinks);
    nav.appendChild(rightSection);

    // Insert nav bar at the very top of the body
    document.body.insertBefore(nav, document.body.firstChild);
    app.navBarElement = nav;

    if (app.pageContentElement) {
        app.pageContentElement.style.paddingTop = '50px';
    }
}

export function removeNavigationBar(app: any): void {
    if (app.navBarElement && app.navBarElement.parentNode) {
        app.navBarElement.parentNode.removeChild(app.navBarElement);
        app.navBarElement = null;
    }
    if (app.pageContentElement) {
        app.pageContentElement.style.paddingTop = '';
    }
}