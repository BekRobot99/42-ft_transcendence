export class ConnectForm {
    private formContainer: HTMLElement;
    private usernameField!: HTMLInputElement;
    private passwordField!: HTMLInputElement;
    private clientErrorMessage!: HTMLElement;  // For client-side validation
    private serverErrorMessage!: HTMLElement;  // For backend error responses
    private successMessage!: HTMLElement;      // For backend success responses
    private submitButton!: HTMLButtonElement;

    constructor() {
        this.formContainer = document.createElement('div');
        this.formContainer.className = 'w-full space-y-4';
        this.buildForm();
    }

    /** Build and initialize form structure */
    private buildForm(): void {
        // Username field
        const usernameGroup = document.createElement('div');
        usernameGroup.className = 'space-y-2';

        const usernameLabel = document.createElement('label');
        usernameLabel.className = 'block text-sm font-medium text-gray-700';
        usernameLabel.htmlFor = 'signin-username';
        usernameLabel.textContent = 'Username';

        this.usernameField = document.createElement('input');
        this.usernameField.type = 'text';
        this.usernameField.id = 'signin-username';
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
        passwordLabel.htmlFor = 'signin-password';
        passwordLabel.textContent = 'Password';

        this.passwordField = document.createElement('input');
        this.passwordField.type = 'password';
        this.passwordField.id = 'signin-password';
        this.passwordField.className =
            'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
        this.passwordField.autocomplete = 'current-password';

        passwordGroup.appendChild(passwordLabel);
        passwordGroup.appendChild(this.passwordField);

        // Submit button
        this.submitButton = document.createElement('button');
        this.submitButton.className =
            'w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
        this.submitButton.textContent = 'Sign In';
        this.submitButton.type = 'submit';

        // Messages
        this.serverErrorMessage = document.createElement('p');
        this.serverErrorMessage.className = 'text-red-600 text-sm hidden mt-2 text-center';

        this.successMessage = document.createElement('p');
        this.successMessage.className = 'text-green-600 text-sm hidden mt-2 text-center';

        // Form wrapper
        const form = document.createElement('form');
        form.className = 'space-y-4';
        form.addEventListener('submit', this.onSubmit.bind(this));

        form.appendChild(usernameGroup);
        form.appendChild(passwordGroup);
        form.appendChild(this.submitButton);
        form.appendChild(this.serverErrorMessage);
        form.appendChild(this.successMessage);

        this.formContainer.appendChild(form);
        this.addFieldListeners();
    }

    /** Add field-specific listeners */
    private addFieldListeners(): void {
        this.usernameField.addEventListener('input', () => {
            const normalized = this.usernameField.value.toLowerCase();
            if (this.usernameField.value !== normalized) {
                this.usernameField.value = normalized;
            }

            const isValid = /^[a-z0-9._-]*$/.test(this.usernameField.value);

            if (!isValid && this.usernameField.value.length > 0) {
                this.clientErrorMessage.textContent =
                    'Username can only contain lowercase letters (a-z), numbers (0-9), underscores (_), hyphens (-), and periods (.)';
                this.clientErrorMessage.classList.remove('hidden');
            } else {
                this.clientErrorMessage.classList.add('hidden');
            }
            this.resetServerMessages();
        });

        this.passwordField.addEventListener('input', () => {
            this.resetServerMessages();
        });
    }

    /** Clear server-side messages */
    private resetServerMessages(): void {
        this.serverErrorMessage.classList.add('hidden');
        this.serverErrorMessage.textContent = '';
        this.successMessage.classList.add('hidden');
        this.successMessage.textContent = '';
    }

    /** Handle form submit */
    private async onSubmit(event: Event): Promise<void> {
        event.preventDefault();
        this.resetServerMessages();
        this.submitButton.disabled = true;
        this.submitButton.textContent = 'Signing In...';

        const username = this.usernameField.value;
        const password = this.passwordField.value;

        if (!username || !password) {
            this.serverErrorMessage.textContent = 'Username and password are required.';
            this.serverErrorMessage.classList.remove('hidden');
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'Sign In';
            return;
        }

        try {
            const response = await fetch('/api/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                this.successMessage.textContent = data.message || 'Sign-in successful!';
                this.successMessage.classList.remove('hidden');
                console.log('Signed in user:', data.user);

                this.usernameField.value = '';
                this.passwordField.value = '';
                // has to be checked after
                setTimeout(() => {
                    window.location.href = '/game';
                }, 1000);
            } else {
                this.serverErrorMessage.textContent = data.message || 'Sign-in failed.';
                this.serverErrorMessage.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Sign-in error:', error);
            this.serverErrorMessage.textContent =
                'An unexpected error occurred. Please try again.';
            this.serverErrorMessage.classList.remove('hidden');
        } finally {
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'Sign In';
        }
    }

    /** Public accessor */
    public render(): HTMLElement {
        return this.formContainer;
    }
}
