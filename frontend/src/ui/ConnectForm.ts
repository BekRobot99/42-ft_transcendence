export class ConnectForm {
    private formContainer: HTMLElement;
    private usernameField!: HTMLInputElement;
    private passwordField!: HTMLInputElement;
    private errorMessage!: HTMLElement;

    constructor() {
        this.formContainer = document.createElement('div');
        this.formContainer.className = 'w-full space-y-4';
        this.buildFormElements();
    }

    /** Build all form elements (inputs, labels, button) */
    private buildFormElements(): void {
        // Username field group
        const usernameGroup = document.createElement('div');
        usernameGroup.className = 'space-y-2';

        const usernameLabel = document.createElement('label');
        usernameLabel.className = 'block text-sm font-medium text-gray-700';
        usernameLabel.htmlFor = 'signin-username';
        usernameLabel.textContent = 'Username';

        this.usernameField = document.createElement('input');
        this.usernameField.type = 'text';
        this.usernameField.id = 'signin-username';
        this.usernameField.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
        this.usernameField.maxLength = 16;

        this.errorMessage = document.createElement('p');
        this.errorMessage.className = 'text-red-600 text-sm hidden';

        usernameGroup.appendChild(usernameLabel);
        usernameGroup.appendChild(this.usernameField);
        usernameGroup.appendChild(this.errorMessage);

        // Password field group
        const passwordGroup = document.createElement('div');
        passwordGroup.className = 'space-y-2';

        const passwordLabel = document.createElement('label');
        passwordLabel.className = 'block text-sm font-medium text-gray-700';
        passwordLabel.htmlFor = 'signin-password';
        passwordLabel.textContent = 'Password';

        this.passwordField = document.createElement('input');
        this.passwordField.type = 'password';
        this.passwordField.id = 'signin-password';
        this.passwordField.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

        passwordGroup.appendChild(passwordLabel);
        passwordGroup.appendChild(this.passwordField);

        // Submit button
        const submitButton = document.createElement('button');
        submitButton.className = 'w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
        submitButton.textContent = 'Sign In';

        submitButton.addEventListener('click', (e) => this.handleSubmit(e));

        // Add all sections to container
        this.formContainer.appendChild(usernameGroup);
        this.formContainer.appendChild(passwordGroup);
        this.formContainer.appendChild(submitButton);

        this.addFieldValidation();
    }

    /** Attach validation handlers for fields */
    private addFieldValidation(): void {
        // Username validation
        this.usernameField.addEventListener('input', () => {
            const rawValue = this.usernameField.value;
            this.usernameField.value = rawValue.toLowerCase();

            const isValid = /^[a-z0-9._-]*$/.test(this.usernameField.value);

            if (!isValid && this.usernameField.value.length > 0) {
                this.showError('Username can only contain lowercase letters (a-z), numbers (0-9), underscores (_), hyphens (-), and periods (.)');
            } else if (this.usernameField.value && this.passwordField.value) {
                this.hideError();
            }
        });

        // Password validation
        this.passwordField.addEventListener('input', () => {
            if (this.usernameField.value && this.passwordField.value) {
                this.hideError();
            }
        });
    }

    /** Handle form submission */
    private handleSubmit(event: Event): void {
        event.preventDefault();
        const username = this.usernameField.value;
        const password = this.passwordField.value;

        if (!username || !password) {
            this.showError('Username and password are required.');
        } else {
            this.hideError();
            console.log('Sign In attempt with:', username, password);
            // TODO: Replace with real sign-in logic (API call etc.)
        }
    }

    /** Show error message */
    private showError(message: string): void {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
    }

    /** Hide error message */
    private hideError(): void {
        this.errorMessage.classList.add('hidden');
    }

    /** Public method to return the form */
    public render(): HTMLElement {
        return this.formContainer;
    }
}
