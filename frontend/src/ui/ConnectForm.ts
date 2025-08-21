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

    private buildFormElements(): void {
        // Username input
        const usernameGroup = document.createElement('div');
        usernameGroup.className = 'space-y-2';

        const usernameLabel = document.createElement('label');
        usernameLabel.className = 'block text-sm font-medium text-gray-700';
        usernameLabel.htmlFor = 'username-signin';
        usernameLabel.textContent = 'Username';

        this.usernameField = document.createElement('input');
        this.usernameField.type = 'text';
        this.usernameField.id = 'username-signin';
        this.usernameField.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
        this.usernameField.maxLength = 16;

        this.errorMessage = document.createElement('p');
        this.errorMessage.className = 'text-red-600 text-sm hidden';

        usernameGroup.appendChild(usernameLabel);
        usernameGroup.appendChild(this.usernameField);
        usernameGroup.appendChild(this.errorMessage);

        // Password input
        const passwordGroup = document.createElement('div');
        passwordGroup.className = 'space-y-2';

        const passwordLabel = document.createElement('label');
        passwordLabel.className = 'block text-sm font-medium text-gray-700';
        passwordLabel.htmlFor = 'password-signin';
        passwordLabel.textContent = 'Password';

        this.passwordField = document.createElement('input');
        this.passwordField.type = 'password';
        this.passwordField.id = 'password-signin';
        this.passwordField.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

        passwordGroup.appendChild(passwordLabel);
        passwordGroup.appendChild(this.passwordField);

        // Sign In button
        const signInButton = document.createElement('button');
        signInButton.className = 'w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
        signInButton.textContent = 'Sign In';
        // TODO: replace with actual sign-in logic
        signInButton.addEventListener('click', (e) => {
            e.preventDefault();
            const username = this.usernameField.value;
            const password = this.passwordField.value;
            if (!username || !password) {
                this.errorMessage.textContent = 'Username and password are required.';
                this.errorMessage.classList.remove('hidden');
            } else {
                this.errorMessage.classList.add('hidden');
                console.log('Sign In attempt with:', username);
            }
        });

        // Add everything to the container
        this.formContainer.appendChild(usernameGroup);
        this.formContainer.appendChild(passwordGroup);
        this.formContainer.appendChild(signInButton);

        this.addFieldValidation();
    }

    private addFieldValidation(): void {
        // Username validation
        this.usernameField.addEventListener('input', () => {
            const username = this.usernameField.value;
            // Force lowercase
            this.usernameField.value = username.toLowerCase();

            const isValid = /^[a-z0-9._-]*$/.test(this.usernameField.value);

            if (!isValid && this.usernameField.value.length > 0) {
                this.errorMessage.textContent = 'Username can only contain lowercase letters (a-z), numbers (0-9), underscores (_), hyphens (-), and periods (.)';
                this.errorMessage.classList.remove('hidden');
            } else {
                // Clear specific username validation error if input is valid or empty
                if (this.errorMessage.textContent === 'Username can only contain lowercase letters (a-z), numbers (0-9), underscores (_), hyphens (-), and periods (.)') {
                    this.errorMessage.classList.add('hidden');
                    this.errorMessage.textContent = ''; // Clear the message
                }
                // Also, if both fields now have content (and username is valid), ensure general error is hidden
                if (this.usernameField.value.length > 0 && this.passwordField.value.length > 0 && this.errorMessage.textContent === 'Username and password are required.') {
                    this.errorMessage.classList.add('hidden');
                    this.errorMessage.textContent = ''; // Clear the message
                }
            }
        });

        this.passwordField.addEventListener('input', () => {
            // Clear general "Username and password are required" error if user starts typing in password field
            // and username field also has content.
            if (this.usernameField.value.length > 0 && this.passwordField.value.length > 0 && this.errorMessage.textContent === 'Username and password are required.') {
                this.errorMessage.classList.add('hidden');
                this.errorMessage.textContent = ''; // Clear the message
            }
        });
    }

    public render(): HTMLElement {
        return this.formContainer;
    }
}