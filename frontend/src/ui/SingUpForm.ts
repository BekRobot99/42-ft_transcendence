export class SignUpForm {
    private formContainer: HTMLElement;
    private usernameField!: HTMLInputElement;
    private passwordField!: HTMLInputElement;
    private confirmPasswordField!: HTMLInputElement;
    private validationInfo!: HTMLElement;
    private errorMessage!: HTMLElement;

    // SVG paths for validation icons
    private readonly validIconPath = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`;
    private readonly invalidIconPath = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`;

    constructor() {
        this.formContainer = document.createElement('div');
        this.formContainer.className = 'w-full space-y-4';
        this.initializeForm();
    }

    // Initializes the form with all necessary fields and validation
    private initializeForm(): void {
        // Username field
        const usernameSection = document.createElement('div');
        usernameSection.className = 'space-y-2';
        
        const usernameLabel = document.createElement('label');
        usernameLabel.className = 'block text-sm font-medium text-gray-700';
        usernameLabel.htmlFor = 'username';
        usernameLabel.textContent = 'Username';
        
        this.usernameField = document.createElement('input');
        this.usernameField.type = 'text';
        this.usernameField.id = 'username';
        this.usernameField.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
        this.usernameField.maxLength = 16;
        
        this.errorMessage = document.createElement('p');
        this.errorMessage.className = 'text-red-600 text-sm hidden';
        
        usernameSection.appendChild(usernameLabel);
        usernameSection.appendChild(this.usernameField);
        usernameSection.appendChild(this.errorMessage);

        // Password field
        const passwordSection = document.createElement('div');
        passwordSection.className = 'space-y-2';
        
        const passwordLabel = document.createElement('label');
        passwordLabel.className = 'block text-sm font-medium text-gray-700';
        passwordLabel.htmlFor = 'password';
        passwordLabel.textContent = 'Password';
        
        this.passwordField = document.createElement('input');
        this.passwordField.type = 'password';
        this.passwordField.id = 'password';
        this.passwordField.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
        
        this.validationInfo = document.createElement('div');
        this.validationInfo.className = 'space-y-1 mt-2';

        const validationRules = [
            { id: 'length', text: 'At least 10 characters' },
            { id: 'uppercase', text: 'Contains uppercase letter' },
            { id: 'lowercase', text: 'Contains lowercase letter' },
            { id: 'number', text: 'Contains number' }
        ];

        validationRules.forEach(rule => {
            const ruleElement = document.createElement('div');
            ruleElement.className = 'flex items-center space-x-2';
            ruleElement.innerHTML = `
                <svg class="w-4 h-4 text-gray-400" id="${rule.id}-indicator" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    ${this.invalidIconPath}
                </svg>
                <span class="text-sm text-gray-600">${rule.text}</span>
            `;
            this.validationInfo.appendChild(ruleElement);
        });

        passwordSection.appendChild(passwordLabel);
        passwordSection.appendChild(this.passwordField);

        // Confirm Password field
        const confirmPasswordSection = document.createElement('div');
        confirmPasswordSection.className = 'space-y-2';
        
        const confirmPasswordLabel = document.createElement('label');
        confirmPasswordLabel.className = 'block text-sm font-medium text-gray-700';
        confirmPasswordLabel.htmlFor = 'confirmPassword';
        confirmPasswordLabel.textContent = 'Confirm Password';
        
        this.confirmPasswordField = document.createElement('input');
        this.confirmPasswordField.type = 'password';
        this.confirmPasswordField.id = 'confirmPassword';
        this.confirmPasswordField.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
        
        confirmPasswordSection.appendChild(confirmPasswordLabel);
        confirmPasswordSection.appendChild(this.confirmPasswordField);

        // Submit button
        const submitButton = document.createElement('button');
        submitButton.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
        submitButton.textContent = 'Sign Up';

        // Add all elements to the container
        this.formContainer.appendChild(usernameSection);
        this.formContainer.appendChild(passwordSection);
        this.formContainer.appendChild(confirmPasswordSection);
        this.formContainer.appendChild(this.validationInfo);
        this.formContainer.appendChild(submitButton);

        this.setupEventHandlers();
    }

    // Sets up event handlers for validation and form submission
    private setupEventHandlers(): void {
        // Username validation
        this.usernameField.addEventListener('input', () => {
            const username = this.usernameField.value;
            this.usernameField.value = username.toLowerCase();
            
            const isValid = /^[a-z0-9._-]*$/.test(this.usernameField.value);
            
            if (!isValid && this.usernameField.value.length > 0) {
                this.errorMessage.textContent = 'Username can only contain lowercase letters (a-z), numbers (0-9), underscores (_), hyphens (-), and periods (.)';
                this.errorMessage.classList.remove('hidden');
            } else {
                this.errorMessage.classList.add('hidden');
            }
        });

        // Password validation
        this.passwordField.addEventListener('input', () => {
            const password = this.passwordField.value;
            this.updateValidationStatus('length', password.length >= 10);
            this.updateValidationStatus('uppercase', /[A-Z]/.test(password));
            this.updateValidationStatus('lowercase', /[a-z]/.test(password));
            this.updateValidationStatus('number', /[0-9]/.test(password));
        });

        // Prevent paste in confirm password
        this.confirmPasswordField.addEventListener('paste', (e) => {
            e.preventDefault();
        });
    }

    private updateValidationStatus(ruleId: string, isValid: boolean): void {
        const iconElement = document.getElementById(`${ruleId}-indicator`) as unknown as SVGSVGElement | null;
        if (iconElement) {
            if (isValid) {
                iconElement.innerHTML = this.validIconPath;
                iconElement.classList.remove('text-gray-400', 'text-red-500');
                iconElement.classList.add('text-green-500');
            } else {
                iconElement.innerHTML = this.invalidIconPath;
                iconElement.classList.remove('text-green-500');
                iconElement.classList.add('text-gray-400');
            }
        }
    }

    public render(): HTMLElement {
        return this.formContainer;
    }
}