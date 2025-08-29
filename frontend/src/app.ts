import { removeNavigationBar, renderNavigationBar } from './ui/NavigationBar.js';
import { SignUpForm } from './ui/SingUpForm.js';
import { ConnectForm } from './ui/ConnectForm.js';
import { renderSocialView } from './views/socialView.js';
import { renderGamePage } from './views/GamePage.js';
import { attachHomePageListeners, renderHomePage } from './views/HomePage.js';
import { renderSettingsPage } from './views/SettingsPage.js';

class App {
    private pageContentElement: HTMLElement | null;
    private googleSignInButton: HTMLElement | null = null;
    private signInButton: HTMLElement | null = null;
    private registerButton: HTMLElement | null = null;
    private navBarElement: HTMLElement | null = null;
    private isAuthenticated: boolean = false;

    constructor() {
        this.pageContentElement = document.getElementById('page-content');
        this.navBarElement = null;
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
        const protectedPaths = ['/game', '/settings', '/friends'];
        if (!this.isAuthenticated && protectedPaths.includes(path)) {
            history.replaceState({ path: '/' }, '', '/');
            return this.renderView('/');
        }

        // NAV BAR: Show only for authenticated/protected pages
        if (this.isAuthenticated && protectedPaths.includes(path)) {
            renderNavigationBar(this);
        } else {
            removeNavigationBar(this);
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
                // // Create Google Sign-In button container
                // const googleButtonDiv = document.createElement('div');
                // googleButtonDiv.id = 'google-signin-button';
                // this.pageContentElement.appendChild(googleButtonDiv);
                //
                // // Load Google Identity Services script dynamically
                // const existingScript = document.getElementById('google-identity-script');
                // if (!existingScript) {
                //     const script = document.createElement('script');
                //     script.src = 'https://accounts.google.com/gsi/client';
                //     script.async = true;
                //     script.defer = true;
                //     script.id = 'google-identity-script';
                //     script.onload = () => {
                //         // Initialize the Google Sign-In button after script loads
                //         // @ts-ignore
                //         google.accounts.id.initialize({
                //             client_id: 'YOUR_GOOGLE_CLIENT_ID',
                //             callback: this.handleGoogleCredentialResponse.bind(this),
                //         });
                //         // Render the button
                //         // @ts-ignore
                //         google.accounts.id.renderButton(
                //             googleButtonDiv,
                //             { theme: 'outline', size: 'large' }
                //         );
                //     };
                //     document.head.appendChild(script);

            const backButton = document.createElement('button');
            backButton.textContent = '‹ Back to Home';
            backButton.className = 'block w-full text-center mt-4 text-sm text-gray-800 hover:text-gray-900 hover:underline';
            backButton.addEventListener('click', () => this.navigateTo('/'));
            this.pageContentElement.appendChild(backButton);

        } else if (path === '/game') {
            renderGamePage();

        } else if (path === '/settings') {
            await renderSettingsPage(this.pageContentElement);
            const backButton = document.createElement('button');
            backButton.textContent = '‹ Back to Games';
            backButton.className = 'block w-full text-center mt-4 text-sm text-gray-800 hover:text-gray-900 hover:underline';
            backButton.addEventListener('click', () => this.navigateTo('/game'));
            this.pageContentElement.appendChild(backButton);

        } else if (path === '/friends') {
            await renderSocialView(this.pageContentElement);
            const backButton = document.createElement('button');
            backButton.textContent = '‹ Back to Games';
            backButton.className = 'block w-full text-center mt-4 text-sm text-gray-800 hover:text-gray-900 hover:underline';
            backButton.addEventListener('click', () => this.navigateTo('/game'));
            this.pageContentElement.appendChild(backButton);
        } else { // Default to home view
            renderHomePage(this.pageContentElement);
            // Re-attach event listeners for the home view buttons
            attachHomePageListeners(this);
        }
    }
}
// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});