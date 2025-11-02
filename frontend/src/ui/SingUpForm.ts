import { translate } from "../languageService.js";
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
        this.formContainer.className = 'autumn-container fade-in';
        this.buildForm();
    }

    /** Build all form elements */
    private buildForm(): void {
        // Back button
        const backButton = document.createElement('button');
        backButton.className = 'autumn-back-button';
        backButton.type = 'button';
        backButton.innerHTML = `
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            ${translate('Back', 'Zurück', 'Retour')}
        `;
        backButton.addEventListener('click', () => {
            this.app.renderView('/');
        });

        const langSelectorContainer = createLanguageDropdown(this.app);
        // Username field
        const usernameGroup = document.createElement('div');
        usernameGroup.className = 'autumn-form-group';

        const usernameLabel = document.createElement('label');
        usernameLabel.className = 'autumn-label';
        usernameLabel.htmlFor = 'signup-username';
        usernameLabel.textContent = translate('Username', 'Benutzername', 'Nom d\'utilisateur');

        this.usernameField = document.createElement('input');
        this.usernameField.type = 'text';
        this.usernameField.id = 'signup-username';
        this.usernameField.className = 'autumn-input';
        this.usernameField.maxLength = 16;
        this.usernameField.autocomplete = 'username';

        this.clientErrorMessage = document.createElement('p');
        this.clientErrorMessage.className = 'autumn-error hidden';

        usernameGroup.appendChild(usernameLabel);
        usernameGroup.appendChild(this.usernameField);
        usernameGroup.appendChild(this.clientErrorMessage);

        // Password field
        const passwordGroup = document.createElement('div');
        passwordGroup.className = 'autumn-form-group';

        const passwordLabel = document.createElement('label');
        passwordLabel.className = 'autumn-label';
        passwordLabel.htmlFor = 'signup-password';
        passwordLabel.textContent = translate('Password', 'Passwort', 'Mot de passe');

        this.passwordField = document.createElement('input');
        this.passwordField.type = 'password';
        this.passwordField.id = 'signup-password';
        this.passwordField.className = 'autumn-input';
        this.passwordField.autocomplete = 'new-password';

        this.validationInfo = document.createElement('div');
        this.validationInfo.className = 'validation-checklist';

        const validations = [
            { id: 'length', text: translate('At least 10 characters', 'Mindestens 10 Zeichen', 'Au moins 10 caractères') },
            { id: 'uppercase', text: translate('Contains uppercase letter', 'Enthält Großbuchstaben', 'Contient une lettre majuscule') },
            { id: 'lowercase', text: translate('Contains lowercase letter', 'Enthält Kleinbuchstaben', 'Contient une lettre minuscule') },
            { id: 'number', text: translate('Contains number', 'Enthält eine Zahl', 'Contient un chiffre') },
            { id: 'match', text: translate('Passwords match', 'Passwörter stimmen überein', 'Les mots de passe correspondent') }
        ];

        validations.forEach(rule => {
            const validationItem = document.createElement('div');
            validationItem.className = 'validation-item';
            validationItem.innerHTML = `
                <svg class="validation-icon invalid" id="${rule.id}-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${this.crossIconPath}
                </svg>
                <span>${rule.text}</span>
            `;
            this.validationInfo.appendChild(validationItem);
        });

        passwordGroup.appendChild(passwordLabel);
        passwordGroup.appendChild(this.passwordField);

        // Confirm Password field
        const confirmPasswordGroup = document.createElement('div');
        confirmPasswordGroup.className = 'autumn-form-group';

        const confirmPasswordLabel = document.createElement('label');
        confirmPasswordLabel.className = 'autumn-label';
        confirmPasswordLabel.htmlFor = 'signup-confirm-password';
        confirmPasswordLabel.textContent = translate('Confirm Password', 'Passwort bestätigen', 'Confirmer le mot de passe');

        this.confirmPasswordField = document.createElement('input');
        this.confirmPasswordField.type = 'password';
        this.confirmPasswordField.id = 'signup-confirm-password';
        this.confirmPasswordField.className = 'autumn-input';
        this.confirmPasswordField.autocomplete = 'new-password';

        confirmPasswordGroup.appendChild(confirmPasswordLabel);
        confirmPasswordGroup.appendChild(this.confirmPasswordField);

        // Submit button
        this.submitButton = document.createElement('button');
        this.submitButton.className = 'autumn-button';
        this.submitButton.textContent = translate('Register', 'Registrieren', 'S\'inscrire');
        this.submitButton.type = 'submit';

        // Server messages
        this.serverErrorMessage = document.createElement('p');
        this.serverErrorMessage.className = 'autumn-error hidden';

        this.successMessage = document.createElement('p');
        this.successMessage.className = 'autumn-success hidden';

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

        this.formContainer.appendChild(backButton);
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
        this.submitButton.classList.add('loading');
        this.submitButton.textContent = translate('Registering...', 'Registrierung...', 'Inscription...');

        const username = this.usernameField.value;
        const password = this.passwordField.value;
        const confirmPassword = this.confirmPasswordField.value;

        if (password !== confirmPassword) {
              this.serverErrorMessage.textContent = translate('Passwords do not match.', 'Die Passwörter stimmen nicht überein.', 'Les mots de passe ne correspondent pas.');
            this.serverErrorMessage.classList.remove('hidden');
            this.submitButton.disabled = false;
            this.submitButton.classList.remove('loading');
            this.submitButton.textContent = translate('Register', 'Registrieren', 'S\'inscrire');
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

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
            this.submitButton.classList.remove('loading');
            if (!this.successMessage.classList.contains('hidden')) {
                // Keep "Registering..." text on success until redirect
            } else {
                this.submitButton.textContent = translate('Register', 'Registrieren', 'S\'inscrire');
            }
        }
    }

    /** Update validation icons */
    private updateValidation(id: string, isValid: boolean): void {
        const iconSvgElement = document.getElementById(`${id}-check`) as SVGSVGElement | null;
        const validationItem = iconSvgElement?.closest('.validation-item');
        
        if (iconSvgElement) {
            if (isValid) {
                iconSvgElement.innerHTML = this.checkIconPath;
                iconSvgElement.classList.remove('invalid');
                iconSvgElement.classList.add('valid');
                validationItem?.classList.add('valid');
            } else {
                iconSvgElement.innerHTML = this.crossIconPath;
                iconSvgElement.classList.remove('valid');
                iconSvgElement.classList.add('invalid');
                validationItem?.classList.remove('valid');
            }
        }
    }

    public render(): HTMLElement {
        return this.formContainer;
    }
}
