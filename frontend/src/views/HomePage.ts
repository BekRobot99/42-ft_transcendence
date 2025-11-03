import { translate } from "../languageService.js";
import { createLanguageDropdown } from "../ui/LanguageDropdown.js";

export function renderHomePage(container: HTMLElement, app: any): void {
    const homeWrapper = document.createElement('div');
    homeWrapper.className = "autumn-container fade-in";

   const langSelectorContainer = createLanguageDropdown(app, {
    containerClassName: 'language-dropdown'
  });

  homeWrapper.appendChild(langSelectorContainer);

    const headerSection = document.createElement('div');
    headerSection.className = 'text-center mb-8';

    const mainTitle = document.createElement('h1');
    mainTitle.className = 'autumn-title';
    mainTitle.textContent = 'Mila Soklovacki';

    const subtitle = document.createElement('p');
    subtitle.className = 'autumn-subtitle';
    subtitle.textContent = 'Мајстор фронтенда'; // "Frontend Master" in Serbian Cyrillic

    headerSection.appendChild(mainTitle);
    headerSection.appendChild(subtitle);

    const actionButtons = document.createElement('div');
    actionButtons.className = "space-y-4 mb-4";

    const signInBtn = document.createElement('button');
    signInBtn.id = 'signInBtn';
    signInBtn.className = "autumn-button autumn-button-secondary";
    signInBtn.textContent = translate("Sign In", "Anmelden", "Se connecter");

    const registerBtn = document.createElement('button');
    registerBtn.id = 'registerBtn';
    registerBtn.className = "autumn-button";
    registerBtn.textContent = translate("Register", "Registrieren", "S'inscrire");

    actionButtons.appendChild(signInBtn);
    actionButtons.appendChild(registerBtn);

    const separator = document.createElement('div');
    separator.className = 'autumn-separator';
    const orText = document.createElement('span');
    orText.textContent = translate("or", "oder", "ou");
    separator.appendChild(orText);

    const googleBtn = document.createElement('button');
    googleBtn.id = 'googleBtn';
    googleBtn.className = "autumn-button autumn-button-google";
  
    const googleIcon = document.createElement('img');
    googleIcon.src = 'https://www.google.com/favicon.ico';
    googleIcon.alt = 'Google logo';
    
    const googleText = document.createElement('span');
    googleText.textContent = translate("Continue with Google", "Mit Google fortfahren", "Continuer avec Google");
    
    googleBtn.appendChild(googleIcon);
    googleBtn.appendChild(googleText);

    homeWrapper.appendChild(headerSection);
    homeWrapper.appendChild(actionButtons);
    homeWrapper.appendChild(separator);
    homeWrapper.appendChild(googleBtn);

    container.appendChild(homeWrapper);
}

export function attachHomePageListeners(app: any): void {
    app.googleBtn = document.getElementById('googleBtn');
    app.signInBtn = document.getElementById('signInBtn');
    app.registerBtn = document.getElementById('registerBtn');

    if (app.googleBtn) {
        app.googleBtn.addEventListener('click', async (event: Event) => {
            event.preventDefault();
             try {
        const res = await fetch('/api/auth/google/url');
        if (!res.ok) throw new Error('Failed to get Google auth URL');
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } catch (error) {
        console.error("Google Sign In failed:", error);
      }
        });
    }
    if (app.signInBtn) {
        app.signInBtn.addEventListener('click', (e: Event) => app.navigateTo('/signin', e));
    }
    if (app.registerBtn) {
        app.registerBtn.addEventListener('click', (e: Event) => app.navigateTo('/register', e));
    }
}
