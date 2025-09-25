import { translate } from '../languageService.js';
import CONFIG from '../config.js';
import { createLanguageDropdown } from "./LanguageDropdown.js";

export class SignUpForm {
    private formContainer: HTMLElement;
    private usernameField!: HTMLInputElement;
    private passwordField!: HTMLInputElement;
    private confirmPasswordField!: HTMLInputElement;
    private validationInfo!: HTMLElement;
    private clientErrorMessage!: HTMLElement;    // For client-side validation errors
    private serverErrorMessage!: HTMLElement;    // For backend error responses
    private successMessage!: HTMLElement;        // For backend success responses
    private submitButton!: HTMLButtonElement;
    private app: any;

    // SVG paths for validation icons
    private readonly checkIconPath = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
    private readonly crossIconPath = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`;

   constructor(app: any) {
        this.app = app;
        this.formContainer = document.createElement('div');
        this.formContainer.className = 'bg-white rounded-lg p-8 border-2 border-black shadow-[8px_8px_0px_#000000] w-full space-y-4';
        this.buildForm();
    }

    /** Build all form elements */
    private buildForm(): void {
         const langSelectorContainer = createLanguageDropdown(this.app);
        // Username field
        const usernameGroup = document.createElement('div');
        usernameGroup.className = 'space-y-2';

        const usernameLabel = document.createElement('label');
        usernameLabel.className = 'block text-sm font-medium text-gray-700';
        usernameLabel.htmlFor = 'signup-username';
        usernameLabel.textContent = translate('Username', 'Benutzername', 'Nom d\'utilisateur');

        this.usernameField = document.createElement('input');
        this.usernameField.type = 'text';
        this.usernameField.id = 'signup-username';
        this.usernameField.className =
            'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
        this.usernameField.maxLength = 16;
        this.usernameField.autocomplete = 'username';

        this.clientErrorMessage = document.createElement('p');
        this.clientErrorMessage.className = 'text-red-600 text-sm hidden';

        usernameGroup.appendChild(usernameLabel);
        usernameGroup.appendChild(this.usernameField);
        usernameGroup.appendChild(this.clientErrorMessage);

        // Password field
        const passwordGroup = document.createElement('div');
        passwordGroup.className = 'space-y-2';

        const passwordLabel = document.createElement('label');
        passwordLabel.className = 'block text-sm font-medium text-gray-700';
        passwordLabel.htmlFor = 'signup-password';
        passwordLabel.textContent = translate('Password', 'Passwort', 'Mot de passe');

        this.passwordField = document.createElement('input');
        this.passwordField.type = 'password';
        this.passwordField.id = 'signup-password';
        this.passwordField.className =
            'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
        this.passwordField.autocomplete = 'new-password';

        this.validationInfo = document.createElement('div');
        this.validationInfo.className = 'space-y-1 mt-2';

        const validations = [
            { id: 'length', text: translate('At least 10 characters', 'Mindestens 10 Zeichen', 'Au moins 10 caractères') },
            { id: 'uppercase', text: translate('Contains uppercase letter', 'Enthält Großbuchstaben', 'Contient une lettre majuscule') },
            { id: 'lowercase', text: translate('Contains lowercase letter', 'Enthält Kleinbuchstaben', 'Contient une lettre minuscule') },
            { id: 'number', text: translate('Contains number', 'Enthält eine Zahl', 'Contient un chiffre') },
            { id: 'match', text: translate('Passwords match', 'Passwörter stimmen überein', 'Les mots de passe correspondent') }
        ];

        validations.forEach(rule => {
            const validationItem = document.createElement('div');
            validationItem.className = 'flex items-center space-x-2';
            validationItem.innerHTML = `
                <svg class="w-4 h-4 text-gray-400" id="${rule.id}-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${this.crossIconPath}
                </svg>
                <span class="text-sm text-gray-600">${rule.text}</span>
            `;
            this.validationInfo.appendChild(validationItem);
        });

        passwordGroup.appendChild(passwordLabel);
        passwordGroup.appendChild(this.passwordField);

        // Confirm Password field
        const confirmPasswordGroup = document.createElement('div');
        confirmPasswordGroup.className = 'space-y-2';

        const confirmPasswordLabel = document.createElement('label');
        confirmPasswordLabel.className = 'block text-sm font-medium text-gray-700';
        confirmPasswordLabel.htmlFor = 'signup-confirm-password';
        confirmPasswordLabel.textContent = translate('Confirm Password', 'Passwort bestätigen', 'Confirmer le mot de passe');

        this.confirmPasswordField = document.createElement('input');
        this.confirmPasswordField.type = 'password';
        this.confirmPasswordField.id = 'signup-confirm-password';
        this.confirmPasswordField.className =
            'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
        this.confirmPasswordField.autocomplete = 'new-password';

        confirmPasswordGroup.appendChild(confirmPasswordLabel);
        confirmPasswordGroup.appendChild(this.confirmPasswordField);

        // Submit button
        this.submitButton = document.createElement('button');
        this.submitButton.className = 'w-full relative inline-block px-4 py-3 font-medium group';
        this.submitButton.innerHTML = `
            <span class="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
            <span class="absolute inset-0 w-full h-full bg-white border-2 border-black group-hover:bg-black"></span>
            <span class="relative text-black group-hover:text-white">${translate('Register', 'Registrieren', 'S\'inscrire')}</span>
        `;
        this.submitButton.type = 'submit';

        // Server messages
        this.serverErrorMessage = document.createElement('p');
        this.serverErrorMessage.className = 'text-red-600 text-sm hidden mt-2 text-center';

        this.successMessage = document.createElement('p');
        this.successMessage.className = 'text-green-600 text-sm hidden mt-2 text-center';

        // Wrap everything in a form
        const form = document.createElement('form');
        form.className = 'space-y-4';
        form.addEventListener('submit', this.onRegister.bind(this));

        form.appendChild(usernameGroup);
        form.appendChild(passwordGroup);
        form.appendChild(confirmPasswordGroup);
        form.appendChild(this.validationInfo);
        form.appendChild(this.submitButton);
        form.appendChild(this.serverErrorMessage);
        form.appendChild(this.successMessage);

        this.formContainer.appendChild(langSelectorContainer);
        this.formContainer.appendChild(form);
        this.addFieldListeners();
    }

    /** Add event listeners */
    private addFieldListeners(): void {
        this.usernameField.addEventListener('input', () => {
            const normalized = this.usernameField.value.toLowerCase();
            if (this.usernameField.value !== normalized) {
                this.usernameField.value = normalized;
            }

            const isValid = /^[a-z0-9._-]*$/.test(this.usernameField.value);

            if (!isValid && this.usernameField.value.length > 0) {
               this.clientErrorMessage.textContent = translate(
                    'Username can only contain lowercase letters (a-z), numbers (0-9), underscores (_), hyphens (-), and periods (.)',
                    'Der Benutzername darf nur Kleinbuchstaben (a-z), Zahlen (0-9), Unterstriche (_), Bindestriche (-) und Punkte (.) enthalten.',
                    'Le nom d\'utilisateur ne peut contenir que des lettres minuscules (a-z), des chiffres (0-9), des traits de soulignement (_), des traits d\'union (-) et des points (.).'
                );
                this.clientErrorMessage.classList.remove('hidden');
            } else {
                this.clientErrorMessage.classList.add('hidden');
            }
            this.resetServerMessages();
        });

        this.passwordField.addEventListener('input', () => {
            const password = this.passwordField.value;

            this.updateValidation('length', password.length >= 10);
            this.updateValidation('uppercase', /[A-Z]/.test(password));
            this.updateValidation('lowercase', /[a-z]/.test(password));
            this.updateValidation('number', /[0-9]/.test(password));
            this.updateValidation('match', password === this.confirmPasswordField.value && password.length > 0);

            this.resetServerMessages();
        });

        this.confirmPasswordField.addEventListener('paste', e => e.preventDefault());

        this.confirmPasswordField.addEventListener('input', () => {
            const password = this.passwordField.value;
            const confirm = this.confirmPasswordField.value;
            this.updateValidation('match', password === confirm && password.length > 0);
            this.resetServerMessages();
        });
    }

    /** Clear backend messages */
    private resetServerMessages(): void {
        this.serverErrorMessage.classList.add('hidden');
        this.serverErrorMessage.textContent = '';
        this.successMessage.classList.add('hidden');
        this.successMessage.textContent = '';
    }

    /** Handle register submit */
    private async onRegister(event: Event): Promise<void> {
        event.preventDefault();
        this.resetServerMessages();
        this.submitButton.disabled = true;
        this.submitButton.querySelector('span.relative')!.textContent = translate('Registering...', 'Registrierung...', 'Inscription...');

        const username = this.usernameField.value;
        const password = this.passwordField.value;
        const confirmPassword = this.confirmPasswordField.value;

        if (password !== confirmPassword) {
              this.serverErrorMessage.textContent = translate('Passwords do not match.', 'Die Passwörter stimmen nicht überein.', 'Les mots de passe ne correspondent pas.');
            this.serverErrorMessage.classList.remove('hidden');
            this.submitButton.disabled = false;
            this.submitButton.querySelector('span.relative')!.textContent = translate('Register', 'Registrieren', 'S\'inscrire');
            return;
        }

        try {
            console.log('Attempting registration with backend URL:', CONFIG.BACKEND_URL);
            const url = `${CONFIG.BACKEND_URL}/api/register`;
            console.log('Registration URL:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include',
                mode: 'cors'
            });

            console.log('Registration response status:', response.status);
            const data = await response.json();
            console.log('Registration response data:', data);

            if (response.ok) {
                this.successMessage.textContent = data.message || translate('Registration successful!', 'Registrierung erfolgreich!', 'Inscription réussie !');
                this.successMessage.classList.remove('hidden');
                this.usernameField.value = '';
                this.passwordField.value = '';
                this.confirmPasswordField.value = '';
                // has to be checked after
                setTimeout(() => {
                    window.location.href = '/game';
                }, 1000);
            } else {
                this.serverErrorMessage.textContent = data.message || translate('Registration failed.', 'Registrierung fehlgeschlagen.', 'L\'inscription a échoué.');
                this.serverErrorMessage.classList.remove('hidden');
            }
        } catch (err) {
            console.error('Registration error:', err);
            this.serverErrorMessage.textContent = translate('An unexpected error occurred. Please try again.', 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 'Une erreur inattendue s\'est produite. Veuillez réessayer.');
            this.serverErrorMessage.classList.remove('hidden');
        } finally {
            this.submitButton.disabled = false;
                 if (!this.successMessage.classList.contains('hidden')) {
                // Keep "Registering..." text on success until redirect
            } else {
                this.submitButton.querySelector('span.relative')!.textContent = translate('Register', 'Registrieren', 'S\'inscrire');
            }
        }
    }

    /** Update validation icons */
    private updateValidation(id: string, isValid: boolean): void {
        const iconSvgElement = document.getElementById(`${id}-check`) as SVGSVGElement | null;
        if (iconSvgElement) {
            if (isValid) {
                iconSvgElement.innerHTML = this.checkIconPath;
                iconSvgElement.classList.remove('text-gray-400', 'text-red-500');
                iconSvgElement.classList.add('text-green-500');
            } else {
                iconSvgElement.innerHTML = this.crossIconPath;
                iconSvgElement.classList.remove('text-green-500');
                iconSvgElement.classList.add('text-gray-400');
            }
        }
    }

    public render(): HTMLElement {
        return this.formContainer;
    }
}
