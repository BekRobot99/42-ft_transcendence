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
export class ConnectForm {
    constructor(app) {
        this.app = app;
        this.formContainer = document.createElement('div');
        this.formContainer.className = 'bg-white rounded-lg p-8 border-2 border-black shadow-[8px_8px_0px_#000000] w-full space-y-4';
        this.buildForm();
    }
    buildForm() {
        const langSelectorContainer = createLanguageDropdown(this.app);
        // Username input
        const usernameGroup = document.createElement('div');
        usernameGroup.className = 'space-y-2';
        const usernameLabel = document.createElement('label');
        usernameLabel.className = 'block text-sm font-medium text-gray-700';
        usernameLabel.htmlFor = 'username-signin';
        usernameLabel.textContent = translate('Username', 'Benutzername', 'Nom d\'utilisateur');
        this.usernameField = document.createElement('input');
        this.usernameField.type = 'text';
        this.usernameField.id = 'username-signin';
        this.usernameField.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
        this.usernameField.maxLength = 16;
        this.usernameField.autocomplete = 'username';
        this.clientErrorMessage = document.createElement('p');
        this.clientErrorMessage.className = 'text-red-600 text-sm hidden';
        usernameGroup.appendChild(usernameLabel);
        usernameGroup.appendChild(this.usernameField);
        usernameGroup.appendChild(this.clientErrorMessage);
        // Password input
        const passwordGroup = document.createElement('div');
        passwordGroup.className = 'space-y-2';
        const passwordLabel = document.createElement('label');
        passwordLabel.className = 'block text-sm font-medium text-gray-700';
        passwordLabel.htmlFor = 'password-signin';
        passwordLabel.textContent = translate('Password', 'Passwort', 'Mot de passe');
        this.passwordField = document.createElement('input');
        this.passwordField.type = 'password';
        this.passwordField.id = 'password-signin';
        this.passwordField.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
        this.passwordField.autocomplete = 'current-password';
        passwordGroup.appendChild(passwordLabel);
        passwordGroup.appendChild(this.passwordField);
        // 2FA input (hidden by default)
        this.mfaInputWrapper = document.createElement('div');
        this.mfaInputWrapper.className = 'space-y-2 hidden';
        const twofaLabel = document.createElement('label');
        twofaLabel.className = 'block text-sm font-medium text-gray-700';
        twofaLabel.htmlFor = 'twofa-signin';
        twofaLabel.textContent = translate('2FA Code', '2FA-Code', 'Code 2FA');
        this.mfaInput = document.createElement('input');
        this.mfaInput.type = 'text';
        this.mfaInput.id = 'twofa-signin';
        this.mfaInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
        this.mfaInput.autocomplete = 'one-time-code';
        this.mfaInput.maxLength = 6;
        this.mfaInputWrapper.appendChild(twofaLabel);
        this.mfaInputWrapper.appendChild(this.mfaInput);
        // Sign In button
        this.submitButton = document.createElement('button');
        this.submitButton.className = 'w-full relative inline-block px-4 py-3 font-medium group';
        this.submitButton.innerHTML = `
            <span class="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
            <span class="absolute inset-0 w-full h-full bg-white border-2 border-black group-hover:bg-black"></span>
            <span class="relative text-black group-hover:text-white">${translate('Sign In', 'Anmelden', 'Se connecter')}</span>
        `;
        this.submitButton.type = 'submit';
        // Server error and success message containers
        this.serverErrorMessage = document.createElement('p');
        this.serverErrorMessage.className = 'text-red-600 text-sm hidden mt-2 text-center';
        this.successMessage = document.createElement('p');
        this.successMessage.className = 'text-green-600 text-sm hidden mt-2 text-center';
        const form = document.createElement('form');
        form.className = 'space-y-4';
        form.addEventListener('submit', this.onSubmit.bind(this));
        form.appendChild(usernameGroup);
        form.appendChild(passwordGroup);
        form.appendChild(this.mfaInputWrapper);
        form.appendChild(this.submitButton);
        form.appendChild(this.serverErrorMessage);
        form.appendChild(this.successMessage);
        this.formContainer.appendChild(langSelectorContainer);
        this.formContainer.appendChild(form);
        this.addFieldListeners();
    }
    addFieldListeners() {
        // Username validation
        this.usernameField.addEventListener('input', () => {
            const username = this.usernameField.value;
            const lowercasedUsername = username.toLowerCase();
            if (username !== lowercasedUsername) {
                this.usernameField.value = lowercasedUsername;
            }
            const isValid = /^[a-z0-9._-]*$/.test(this.usernameField.value);
            if (!isValid && this.usernameField.value.length > 0) {
                this.clientErrorMessage.textContent = translate('Username can only contain lowercase letters (a-z), numbers (0-9), underscores (_), hyphens (-), and periods (.)', 'Der Benutzername darf nur Kleinbuchstaben (a-z), Zahlen (0-9), Unterstriche (_), Bindestriche (-) und Punkte (.) enthalten.', 'Le nom d\'utilisateur ne peut contenir que des lettres minuscules (a-z), des chiffres (0-9), des traits de soulignement (_), des traits d\'union (-) et des points (.).');
                this.clientErrorMessage.classList.remove('hidden');
            }
            else {
                this.clientErrorMessage.classList.add('hidden');
            }
            this.resetServerMessages();
        });
        this.passwordField.addEventListener('input', () => {
            this.resetServerMessages();
        });
        this.mfaInput.addEventListener('input', () => {
            this.resetServerMessages();
        });
    }
    resetServerMessages() {
        this.serverErrorMessage.classList.add('hidden');
        this.serverErrorMessage.textContent = '';
        this.successMessage.classList.add('hidden');
        this.successMessage.textContent = '';
    }
    onSubmit(event) {
        return __awaiter(this, void 0, void 0, function* () {
            event.preventDefault();
            this.resetServerMessages();
            this.submitButton.disabled = true;
            this.submitButton.querySelector('span.relative').textContent = translate('Signing In...', 'Anmeldung...', 'Connexion...');
            const username = this.usernameField.value;
            const password = this.passwordField.value;
            const twofaCode = this.mfaInput.value;
            if (!username || !password) {
                this.serverErrorMessage.textContent = translate('Username and password are required.', 'Benutzername und Passwort sind erforderlich.', 'Le nom d\'utilisateur et le mot de passe sont requis.');
                this.serverErrorMessage.classList.remove('hidden');
                this.submitButton.disabled = false;
                this.submitButton.querySelector('span.relative').textContent = translate('Sign In', 'Anmelden', 'Se connecter');
                return;
            }
            try {
                const response = yield fetch('/api/signin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password, twofaCode: twofaCode || undefined }),
                });
                const data = yield response.json();
                if (response.ok) {
                    // The first step of 2FA (password correct) will return 200 OK with twofaRequired: true
                    if (data.twofaRequired) {
                        this.mfaInputWrapper.classList.remove('hidden');
                        this.serverErrorMessage.textContent = data.message; // "2FA code required."
                        this.serverErrorMessage.classList.remove('hidden');
                        this.mfaInput.focus();
                    }
                    else {
                        // This is a successful sign-in (either 2FA was off, or the code was correct)
                        this.successMessage.textContent = data.message || translate('Sign-in successful!', 'Anmeldung erfolgreich!', 'Connexion réussie !');
                        this.successMessage.classList.remove('hidden');
                        // Redirect to /game after successful sign-in
                        window.location.href = '/game';
                    }
                    return;
                }
                else {
                    // Handle non-OK responses (e.g., 401 for bad password or bad 2FA code)
                    if (data.twofaRequired) {
                        // This case handles an invalid 2FA code attempt
                        this.mfaInputWrapper.classList.remove('hidden');
                        this.serverErrorMessage.textContent = data.message;
                        this.serverErrorMessage.classList.remove('hidden');
                        this.mfaInput.focus();
                    }
                    else {
                        this.serverErrorMessage.textContent = data.message || translate('Sign-in failed.', 'Anmeldung fehlgeschlagen.', 'La connexion a échoué.');
                        this.serverErrorMessage.classList.remove('hidden');
                        // Hide 2FA input if it was visible from a previous attempt
                        this.mfaInputWrapper.classList.add('hidden');
                        this.mfaInput.value = '';
                    }
                }
            }
            catch (error) {
                console.error('Sign-in error:', error);
                this.serverErrorMessage.textContent = translate('An unexpected error occurred. Please try again.', 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'Une erreur inattendue s\'est produite. Veuillez réessayer.');
                this.serverErrorMessage.classList.remove('hidden');
            }
            finally {
                this.submitButton.disabled = false;
                if (!this.successMessage.classList.contains('hidden')) {
                    // If successful, keep the "signing in" message until redirect
                }
                else {
                    this.submitButton.querySelector('span.relative').textContent = translate('Sign In', 'Anmelden', 'Se connecter');
                }
            }
        });
    }
    render() {
        return this.formContainer;
    }
}
//# sourceMappingURL=ConnectForm.js.map