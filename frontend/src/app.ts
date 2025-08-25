import { SignUpForm } from './ui/SingUpForm.js';
import { ConnectForm } from './ui/ConnectForm.js';

class App {
    private pageContentElement: HTMLElement | null;
    private googleSignInButton: HTMLElement | null = null;
    private signInButton: HTMLElement | null = null;
    private registerButton: HTMLElement | null = null;
    private isAuthenticated: boolean = false;

    constructor() {
        this.pageContentElement = document.getElementById('page-content');

        this.init();
    }

    private init(): void {
        // Listen for browser navigation (back/forward buttons)
        window.addEventListener('popstate', this.handlePopState.bind(this));
        // Render the initial view based on the current URL path
        // Normalize '/index.html' or similar to '/' for consistent routing
        const initialPath = window.location.pathname === '/index.html' ? '/' : window.location.pathname;
        this.renderView(initialPath);
    }

    private navigateTo(path: string, event?: Event): void {
        if (event) {
            event.preventDefault();
        }
        // Only push state if the path is different to avoid duplicate history entries
        if (window.location.pathname !== path) {
            history.pushState({ path }, '', path);
        }
        this.renderView(path);
    }

    private handlePopState(event: PopStateEvent): void {
        // When the user navigates using back/forward buttons
        // Default to home ('/') if no state path is found, or use current pathname
        const path = event.state?.path || (window.location.pathname === '/index.html' ? '/' : window.location.pathname);
        this.renderView(path);
    }

    private renderHomeView(container: HTMLElement): void {
        const homeContentWrapper = document.createElement('div');
        homeContentWrapper.className = 'bg-white rounded-lg shadow-lg p-8';

        const textCenterDiv = document.createElement('div');
        textCenterDiv.className = 'text-center mb-8';

        const title = document.createElement('h1');
        title.className = 'text-3xl font-bold text-gray-800 mb-2';
        title.textContent = 'ft_transcendence';

        const subtitle = document.createElement('p');
        subtitle.className = 'text-gray-600';
        subtitle.textContent = 'Sign in to start playing Pong!';

        textCenterDiv.appendChild(title);
        textCenterDiv.appendChild(subtitle);

        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'flex gap-4 mb-4';

        const signInButton = document.createElement('button');
        signInButton.id = 'signInButton';
        signInButton.className = 'flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
        signInButton.textContent = 'Sign In';

        const registerButton = document.createElement('button');
        registerButton.id = 'registerButton';
        registerButton.className = 'flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
        registerButton.textContent = 'Register';

        buttonGroup.appendChild(signInButton);
        buttonGroup.appendChild(registerButton);

        const separatorDiv = document.createElement('div');
        separatorDiv.className = 'relative mb-4';
        const hr = document.createElement('hr');
        hr.className = 'border-t border-gray-300';
        const orSpan = document.createElement('span');
        orSpan.className = 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-500';
        orSpan.textContent = 'or';
        separatorDiv.appendChild(hr);
        separatorDiv.appendChild(orSpan);

        const googleSignInButton = document.createElement('button');
        googleSignInButton.id = 'googleSignIn';
        googleSignInButton.className = 'w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 border border-gray-300 rounded-lg shadow-sm transition duration-150 ease-in-out';
        const googleIcon = document.createElement('img');
        googleIcon.src = 'https://www.google.com/favicon.ico';
        googleIcon.alt = 'Google logo';
        googleIcon.className = 'w-5 h-5';
        const googleSignInText = document.createElement('span');
        googleSignInText.textContent = 'Continue with Google';
        googleSignInButton.appendChild(googleIcon);
        googleSignInButton.appendChild(googleSignInText);

        homeContentWrapper.appendChild(textCenterDiv);
        homeContentWrapper.appendChild(buttonGroup);
        homeContentWrapper.appendChild(separatorDiv);
        homeContentWrapper.appendChild(googleSignInButton);

        container.appendChild(homeContentWrapper);
    }

    private async checkAuth(): Promise<boolean> {
        try {
            const res = await fetch('/api/me', { credentials: 'include' });
            if (!res.ok) return false;
            const data = await res.json();
            return !!data.user;
        } catch {
            return false;
        }
    }

    private async renderView(path: string): Promise<void> {
        if (!this.pageContentElement) return;

        // Check authentication status
        this.isAuthenticated = await this.checkAuth();

        // Only redirect to /game if authenticated and trying to access a public page
        const publicPaths = ['/', '/signin', '/register'];
        if (this.isAuthenticated && publicPaths.includes(path)) {
            history.replaceState({ path: '/game' }, '', '/game');
            return this.renderView('/game');
        }
        // Only redirect to / if not authenticated and trying to access a protected page
        const protectedPaths = ['/game', '/settings'];
        if (!this.isAuthenticated && protectedPaths.includes(path)) {
            history.replaceState({ path: '/' }, '', '/');
            return this.renderView('/');
        }

        this.pageContentElement.innerHTML = ''; // Clear existing content

        if (path === '/register') {
            const registerForm = new SignUpForm();
            this.pageContentElement.appendChild(registerForm.render());

            const backButton = document.createElement('button');
            backButton.textContent = '‹ Back to Home';
            backButton.className = 'block w-full text-center mt-4 text-sm text-gray-800 hover:text-gray-900 hover:underline';
            backButton.addEventListener('click', () => this.navigateTo('/'));
            this.pageContentElement.appendChild(backButton);

        } else if (path === '/signin') {
            const signInForm = new ConnectForm();
            this.pageContentElement.appendChild(signInForm.render());

            const backButton = document.createElement('button');
            backButton.textContent = '‹ Back to Home';
            backButton.className = 'block w-full text-center mt-4 text-sm text-gray-800 hover:text-gray-900 hover:underline';
            backButton.addEventListener('click', () => this.navigateTo('/'));
            this.pageContentElement.appendChild(backButton);

        } else if (path === '/game') {
            this.renderGameView(this.pageContentElement);

        } else if (path === '/settings') {
            await this.renderSettingsView(this.pageContentElement);
            const backButton = document.createElement('button');
            backButton.textContent = '‹ Back to Games';
            backButton.className = 'block w-full text-center mt-4 text-sm text-gray-800 hover:text-gray-900 hover:underline';
            backButton.addEventListener('click', () => this.navigateTo('/game'));
            this.pageContentElement.appendChild(backButton);

        } else { // Default to home view
            this.renderHomeView(this.pageContentElement);
            // Re-attach event listeners for the home view buttons
            this.attachHomeViewListeners();
        }
    }

    private renderGameView(container: HTMLElement): void {
        const wrapper = document.createElement('div');
        wrapper.className = 'bg-white rounded-lg shadow-lg p-8 text-center';

        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold mb-4';
        title.textContent = 'Welcome to Pong!';

        // Settings button
        const settingsButton = document.createElement('button');
        settingsButton.className = 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out mr-4';
        settingsButton.textContent = 'Settings';
        settingsButton.addEventListener('click', () => {
            this.navigateTo('/settings');
        });

        const logoutButton = document.createElement('button');
        logoutButton.className = 'bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
        logoutButton.textContent = 'Log Out';
        logoutButton.addEventListener('click', async () => {
            await fetch('/api/signout', { method: 'POST', credentials: 'include' });
            history.replaceState({ path: '/' }, '', '/');
            this.renderView('/');
        });

        wrapper.appendChild(title);
        wrapper.appendChild(settingsButton);
        wrapper.appendChild(logoutButton);
        container.appendChild(wrapper);
    }

    private attachHomeViewListeners(): void {
        this.googleSignInButton = document.getElementById('googleSignIn');
        this.signInButton = document.getElementById('signInButton');
        this.registerButton = document.getElementById('registerButton');

        if (this.googleSignInButton) {
            this.googleSignInButton.addEventListener('click', this.handleGoogleSignIn.bind(this));
        }
        if (this.signInButton) {
            this.signInButton.addEventListener('click', (e) => this.navigateTo('/signin', e));
        }
        if (this.registerButton) {
            this.registerButton.addEventListener('click', (e) => this.navigateTo('/register', e));
        }
    }

    private handleGoogleSignIn(event: Event): void {
        event.preventDefault();
        console.log('Google Sign In clicked - functionality to be implemented');
    }

    private async renderSettingsView(container: HTMLElement): Promise<void> {
        container.innerHTML = '';
        // Fetch current user info
        let user;
        try {
            const res = await fetch('/api/me', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch user');
            const data = await res.json();
            user = data.user;
        } catch {
            container.innerHTML = '<p class="text-red-600">Failed to load user info.</p>';
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'bg-white rounded-lg shadow-lg p-8';

        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold mb-4';
        title.textContent = 'Settings';

        // Username
        const usernameGroup = document.createElement('div');
        usernameGroup.className = 'mb-4';
        const usernameLabel = document.createElement('label');
        usernameLabel.className = 'block text-sm font-medium text-gray-700 mb-1';
        usernameLabel.textContent = 'Username';
        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.value = user.username;
        usernameInput.maxLength = 16;
        usernameInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
        usernameInput.autocomplete = 'off';
        usernameGroup.appendChild(usernameLabel);
        usernameGroup.appendChild(usernameInput);

        // Display name
        const displayNameGroup = document.createElement('div');
        displayNameGroup.className = 'mb-4';
        const displayNameLabel = document.createElement('label');
        displayNameLabel.className = 'block text-sm font-medium text-gray-700 mb-1';
        displayNameLabel.textContent = 'Display Name';
        const displayNameInput = document.createElement('input');
        displayNameInput.type = 'text';
        displayNameInput.value = user.display_name || '';
        displayNameInput.maxLength = 32;
        displayNameInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
        displayNameInput.autocomplete = 'off';
        displayNameGroup.appendChild(displayNameLabel);
        displayNameGroup.appendChild(displayNameInput);

        // Error and success messages
        const errorMsg = document.createElement('p');
        errorMsg.className = 'text-red-600 text-sm hidden mb-2';
        const successMsg = document.createElement('p');
        successMsg.className = 'text-green-600 text-sm hidden mb-2';

        // Save button
        const saveButton = document.createElement('button');
        saveButton.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
        saveButton.textContent = 'Save Changes';

        // Form
        const form = document.createElement('form');
        form.appendChild(usernameGroup);
        form.appendChild(displayNameGroup);
        form.appendChild(errorMsg);
        form.appendChild(successMsg);
        form.appendChild(saveButton);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.classList.add('hidden');
            successMsg.classList.add('hidden');
            saveButton.disabled = true;
            saveButton.textContent = 'Saving...';

            // Validation
            const username = usernameInput.value.trim().toLowerCase();
            const displayName = displayNameInput.value.trim();

            if (!/^[a-z0-9._-]{3,16}$/.test(username)) {
                errorMsg.textContent = 'Username must be 3-16 chars, lowercase, and only a-z, 0-9, ., _, -';
                errorMsg.classList.remove('hidden');
                saveButton.disabled = false;
                saveButton.textContent = 'Save Changes';
                return;
            }
            if (displayName.length < 1 || displayName.length > 32 || /<|>/.test(displayName)) {
                errorMsg.textContent = 'Display name must be 1-32 characters and not contain < or >';
                errorMsg.classList.remove('hidden');
                saveButton.disabled = false;
                saveButton.textContent = 'Save Changes';
                return;
            }

            // Send update
            try {
                const res = await fetch('/api/me', {
                    method: 'PUT',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, displayName }),
                });
                const data = await res.json();
                if (res.ok) {
                    successMsg.textContent = 'Profile updated!';
                    successMsg.classList.remove('hidden');
                } else {
                    errorMsg.textContent = data.message || 'Failed to update profile.';
                    errorMsg.classList.remove('hidden');
                }
            } catch {
                errorMsg.textContent = 'Unexpected error. Please try again.';
                errorMsg.classList.remove('hidden');
            } finally {
                saveButton.disabled = false;
                saveButton.textContent = 'Save Changes';
            }
        });

        wrapper.appendChild(title);
        wrapper.appendChild(form);
        container.appendChild(wrapper);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});