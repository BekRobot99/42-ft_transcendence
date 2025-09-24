var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { translate } from "../languageService.js";
import { createLanguageDropdown } from "./LanguageDropdown.js";
export function renderNavigationBar(app) {
    // Remove existing nav bar if present
    if (app.navBarElement && app.navBarElement.parentNode) {
        app.navBarElement.parentNode.removeChild(app.navBarElement);
    }
    // Create nav bar
    const nav = document.createElement('nav');
    nav.className = 'w-full bg-white text-black shadow-md fixed top-0 left-0 z-50 border-b-4 border-black h-16 flex items-center justify-between px-8';
    // Logo/title
    const logo = document.createElement('div');
    logo.className = 'font-bold text-xl tracking-tight cursor-pointer hover:text-gray-600 transition duration-150 ease-in-out';
    logo.textContent = 'ft_transcendence';
    logo.addEventListener('click', (e) => app.navigateTo('/game', e));
    // Right side buttons
    const right = document.createElement('div');
    right.className = 'flex items-center gap-4';
    const langSelectorContainer = createLanguageDropdown(app, {
        className: 'bg-gray-200 text-black py-2 px-2 rounded-lg text-sm focus:outline-none cursor-pointer border-2 border-black',
        containerClassName: 'flex items-center'
    });
    right.appendChild(langSelectorContainer);
    const createNavButton = (text) => {
        const button = document.createElement('button');
        button.className = 'relative inline-block px-3 py-1 font-medium group';
        button.innerHTML = `
            <span class="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-0.5 translate-y-0.5 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
            <span class="absolute inset-0 w-full h-full bg-white border-2 border-black group-hover:bg-black"></span>
            <span class="relative text-black group-hover:text-white">${text}</span>
        `;
        return button;
    };
    // My Profile button
    const profileButton = createNavButton(translate('My Profile', 'Mein Profil', 'Mon profil'));
    profileButton.addEventListener('click', (e) => {
        if (app.currentUser) {
            app.navigateTo(`/profile/${app.currentUser.username}`, e);
        }
    });
    // Friends button
    const friendsButton = createNavButton(translate('Friends', 'Freunde', 'Amis'));
    friendsButton.addEventListener('click', (e) => app.navigateTo('/friends', e));
    // Settings button
    const settingsButton = createNavButton(translate('Settings', 'Einstellungen', 'Paramètres'));
    settingsButton.addEventListener('click', (e) => app.navigateTo('/settings', e));
    // Log out button
    const logoutButton = createNavButton(translate('Log Out', 'Abmelden', 'Se déconnecter'));
    logoutButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
        // Close WebSocket connection before logging out
        if (app.disconnectWebSocket) {
            app.disconnectWebSocket();
        }
        yield fetch('/api/signout', { method: 'POST', credentials: 'include' });
        history.replaceState({ path: '/' }, '', '/');
        app.renderView('/');
    }));
    right.appendChild(friendsButton);
    right.appendChild(settingsButton);
    right.appendChild(logoutButton);
    nav.appendChild(logo);
    nav.appendChild(right);
    // Insert nav bar at the very top of the body
    document.body.insertBefore(nav, document.body.firstChild);
    app.navBarElement = nav;
    if (app.pageContentElement) {
        app.pageContentElement.style.paddingTop = '80px';
    }
}
export function removeNavigationBar(app) {
    if (app.navBarElement && app.navBarElement.parentNode) {
        app.navBarElement.parentNode.removeChild(app.navBarElement);
        app.navBarElement = null;
    }
    if (app.pageContentElement) {
        app.pageContentElement.style.paddingTop = '';
    }
}
//# sourceMappingURL=NavigationBar.js.map