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

        // Redirect logic
        if (this.isAuthenticated && path !== '/game') {
            history.replaceState({ path: '/game' }, '', '/game');
            return this.renderView('/game');
        }
        if (!this.isAuthenticated && path === '/game') {
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

        const logoutButton = document.createElement('button');
        logoutButton.className = 'bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
        logoutButton.textContent = 'Log Out';
        logoutButton.addEventListener('click', async () => {
            await fetch('/api/signout', { method: 'POST', credentials: 'include' });
            history.replaceState({ path: '/' }, '', '/');
            this.renderView('/');
        });

        wrapper.appendChild(title);
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
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});