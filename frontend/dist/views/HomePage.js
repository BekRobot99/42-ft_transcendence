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
import { createLanguageDropdown } from "../ui/LanguageDropdown.js";
export function renderHomePage(container, app) {
    const homeWrapper = document.createElement('div');
    homeWrapper.className = "bg-white rounded-lg p-8 border-2 border-black shadow-[8px_8px_0px_#000000]";
    const langSelectorContainer = createLanguageDropdown(app, {
        containerClassName: 'flex justify-end mb-4'
    });
    homeWrapper.appendChild(langSelectorContainer);
    const headerSection = document.createElement('div');
    headerSection.className = 'text-center mb-8';
    const mainTitle = document.createElement('h1');
    mainTitle.className = 'text-3xl font-bold text-gray-800 mb-2';
    mainTitle.textContent = 'ft_transcendence';
    const subtitle = document.createElement('p');
    subtitle.className = 'text-gray-600';
    subtitle.textContent = translate("Sign in to start playing Pong!", "Melde dich an, um Pong zu spielen!", "Connectez-vous pour commencer à jouer au Pong !");
    headerSection.appendChild(mainTitle);
    headerSection.appendChild(subtitle);
    const actionButtons = document.createElement('div');
    actionButtons.className = "flex flex-col sm:flex-row gap-4 mb-4";
    const signInBtn = document.createElement('button');
    signInBtn.id = 'signInBtn';
    signInBtn.className = "w-full relative inline-block px-4 py-2 font-medium group";
    signInBtn.innerHTML = `
    <span class="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
    <span class="absolute inset-0 w-full h-full bg-white border-2 border-black group-hover:bg-black"></span>
    <span class="relative text-black group-hover:text-white">${translate("Sign In", "Anmelden", "Se connecter")}</span>
  `;
    const registerBtn = document.createElement('button');
    registerBtn.id = 'registerBtn';
    registerBtn.className = "w-full relative inline-block px-4 py-2 font-medium group";
    registerBtn.innerHTML = `
    <span class="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
    <span class="absolute inset-0 w-full h-full bg-white border-2 border-black group-hover:bg-black"></span>
    <span class="relative text-black group-hover:text-white">${translate("Register", "Registrieren", "S'inscrire")}</span>
  `;
    actionButtons.appendChild(signInBtn);
    actionButtons.appendChild(registerBtn);
    const separator = document.createElement('div');
    separator.className = 'relative mb-4';
    const hr = document.createElement('hr');
    hr.className = 'border-t border-gray-300';
    const orText = document.createElement('span');
    orText.className = 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-500';
    orText.textContent = translate("or", "oder", "ou");
    separator.appendChild(hr);
    separator.appendChild(orText);
    const googleBtn = document.createElement('button');
    googleBtn.id = 'googleBtn';
    googleBtn.className = "w-full relative inline-block px-4 py-2 font-medium group";
    const googleIcon = `<img src="https://www.google.com/favicon.ico" alt="Google logo" class="w-5 h-5 inline-block mr-2">`;
    googleBtn.innerHTML = `
    <span class="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-blue-800 group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
    <span class="absolute inset-0 w-full h-full bg-blue-500 border-2 border-blue-800 group-hover:bg-blue-800"></span>
    <span class="relative text-white flex items-center justify-center">
        ${googleIcon}
        ${translate("Continue with Google", "Mit Google fortfahren", "Continuer avec Google")}
    </span>
  `;
    homeWrapper.appendChild(headerSection);
    homeWrapper.appendChild(actionButtons);
    homeWrapper.appendChild(separator);
    homeWrapper.appendChild(googleBtn);
    container.appendChild(homeWrapper);
}
export function attachHomePageListeners(app) {
    app.googleBtn = document.getElementById('googleBtn');
    app.signInBtn = document.getElementById('signInBtn');
    app.registerBtn = document.getElementById('registerBtn');
    if (app.googleBtn) {
        app.googleBtn.addEventListener('click', (event) => __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            try {
                const res = yield fetch('/api/auth/google/url');
                if (!res.ok)
                    throw new Error('Failed to get Google auth URL');
                const data = yield res.json();
                if (data.url) {
                    window.location.href = data.url;
                }
            }
            catch (error) {
                console.error("Google Sign In failed:", error);
            }
        }));
    }
    if (app.signInBtn) {
        app.signInBtn.addEventListener('click', (e) => app.navigateTo('/signin', e));
    }
    if (app.registerBtn) {
        app.registerBtn.addEventListener('click', (e) => app.navigateTo('/register', e));
    }
}
//# sourceMappingURL=HomePage.js.map