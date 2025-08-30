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
    private webSocket: WebSocket | null = null;
    private intentionalDisconnect: boolean = false;
    private currentViewCleanup: (() => void) | null = null;

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

    private connectWebSocket(): void {
        if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
            return; // Already connected
        }

        // Use wss for secure connections, ws for localhost dev
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/ws/status`;

        this.webSocket = new WebSocket(wsUrl);

        this.webSocket.onopen = () => {
            console.log('WebSocket connection established.');
            this.intentionalDisconnect = false;
        };

        this.webSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'status_update') {
                    const { userId, status } = data;
                    // This query will only find something if the friends view is currently rendered
                    const indicator = document.querySelector(`[data-user-id='${userId}'] .status-indicator`);
                    if (indicator) {
                        const isOnline = status === 'online';
                        indicator.className = `status-indicator inline-block w-3 h-3 rounded-full ml-2 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`;
                        indicator.setAttribute('title', isOnline ? 'Online' : 'Offline');
                    }
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        };

        this.webSocket.onclose = () => {
            console.log('WebSocket connection closed.');
            this.webSocket = null;
           // Only attempt to reconnect if this wasn't an intentional disconnect
            if (!this.intentionalDisconnect) {
                console.log('Attempting to reconnect in 5 seconds...');
                setTimeout(() => this.checkAuth().then(isAuth => {
                    if (isAuth && !this.intentionalDisconnect) this.connectWebSocket();
                }), 5000);
            }
        };

        this.webSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.webSocket?.close();
        };
    }

    public  disconnectWebSocket(): void {
        if (this.webSocket) {
            this.intentionalDisconnect = true;
            this.webSocket.close();
            this.webSocket = null;
            console.log('WebSocket connection closed intentionally.');
        }
    }

    private async renderView(path: string): Promise<void> {
        if (!this.pageContentElement) return;

        // Check authentication status
        this.isAuthenticated = await this.checkAuth();


        // Manage WebSocket connection based on auth state
        if (this.isAuthenticated) {
            this.connectWebSocket();
        } else {
            this.disconnectWebSocket();
        }

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

        // Call cleanup function for the previous view if it exists
        if (this.currentViewCleanup) {
            this.currentViewCleanup();
            this.currentViewCleanup = null;
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

        }else if (path.startsWith('/auth/google/callback')) {
            this.pageContentElement.innerHTML = `
                <div class="text-center">
                    <p class="text-lg font-semibold">Signing in with Google...</p>
                    <p class="text-gray-600">Please wait, you will be redirected shortly.</p>
                </div>
            `;
            this.handleGoogleCallback();
        } else if (path === '/verify-2fa') {
            this.renderTwoFactorView();
        } else if (path === '/signin') {
            const signInForm = new ConnectForm();
            this.pageContentElement.appendChild(signInForm.render());

            const backButton = document.createElement('button');
            backButton.textContent = '‹ Back to Home';
            backButton.className = 'block w-full text-center mt-4 text-sm text-gray-800 hover:text-gray-900 hover:underline';
            backButton.addEventListener('click', () => this.navigateTo('/'));
            this.pageContentElement.appendChild(backButton);

        } else if (path === '/game') {
            this.currentViewCleanup = renderGamePage(this.pageContentElement);

        } else if (path === '/settings') {
            await renderSettingsPage(this.pageContentElement);
            const backButton = document.createElement('button');
            backButton.textContent = '‹ Back to Game';
            backButton.className = 'block w-full text-center mt-4 text-sm text-gray-800 hover:text-gray-900 hover:underline';
            backButton.addEventListener('click', () => this.navigateTo('/game'));
            this.pageContentElement.appendChild(backButton);

        } else if (path === '/friends') {
            await renderSocialView(this.pageContentElement);
            const backButton = document.createElement('button');
            backButton.textContent = '‹ Back to Game';
            backButton.className = 'block w-full text-center mt-4 text-sm text-gray-800 hover:text-gray-900 hover:underline';
            backButton.addEventListener('click', () => this.navigateTo('/game'));
            this.pageContentElement.appendChild(backButton);
        } else { // Default to home view
            renderHomePage(this.pageContentElement);
            // Re-attach event listeners for the home view buttons
            attachHomePageListeners(this);
        }
    }
     private async handleGoogleCallback(): Promise<void> {
        const code = new URLSearchParams(window.location.search).get('code');

        if (!code) {
            console.error('Google callback did not provide a code.');
            // Clear the URL of auth params and navigate home
            history.replaceState({ path: '/' }, '', '/');
            this.renderView('/');
            return;
        }

        try {
            const res = await fetch('/api/auth/google/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Google sign-in failed.');
            }

            const data = await res.json();

            if (data.twofaRequired) {
                // The backend has set a pending token. Navigate to the 2FA verification view.
                this.navigateTo('/verify-2fa');
            } else {
                // Success! The backend has set the cookie.
                // Navigate to the main authenticated page.
                this.navigateTo('/game');
            }

        } catch (error) {
            console.error('Error during Google sign-in:', error);
            // Navigate home and show an error
            this.navigateTo('/');
            if (this.pageContentElement) {
                const errorEl = document.createElement('p');
                errorEl.className = 'text-red-600 text-center mt-4';
                errorEl.textContent = (error as Error).message;
                this.pageContentElement.prepend(errorEl);
            }
        }
    }
    private async renderTwoFactorView(): Promise<void> {
        if (!this.pageContentElement) return;
        this.pageContentElement.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.className = 'bg-white rounded-lg shadow-lg p-8 w-full max-w-md';

        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold mb-4 text-center';
        title.textContent = 'Two-Factor Authentication';

        const instruction = document.createElement('p');
        instruction.className = 'text-gray-600 mb-6 text-center';
        instruction.textContent = 'Enter the code from your authenticator app to complete sign-in.';

        const form = document.createElement('form');
        form.className = 'space-y-4';

        const twofaInput = document.createElement('input');
        twofaInput.type = 'text';
        twofaInput.placeholder = '6-digit code';
        twofaInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
        twofaInput.maxLength = 6;
        twofaInput.autocomplete = 'one-time-code';
        twofaInput.inputMode = 'numeric';
        twofaInput.pattern = '[0-9]*';

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Verify & Sign In';
        submitButton.className = 'w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg shadow-sm';

        const errorMsg = document.createElement('p');
        errorMsg.className = 'text-red-600 text-sm hidden mt-2 text-center';

        form.appendChild(twofaInput);
        form.appendChild(submitButton);
        form.appendChild(errorMsg);

        wrapper.appendChild(title);
        wrapper.appendChild(instruction);
        wrapper.appendChild(form);

        this.pageContentElement.appendChild(wrapper);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.classList.add('hidden');
            submitButton.disabled = true;
            submitButton.textContent = 'Verifying...';

            const code = twofaInput.value.trim();
            if (!/^\d{6}$/.test(code)) {
                errorMsg.textContent = 'Please enter a valid 6-digit code.';
                errorMsg.classList.remove('hidden');
                submitButton.disabled = false;
                submitButton.textContent = 'Verify & Sign In';
                return;
            }

            try {
                const res = await fetch('/api/auth/google/verify-2fa', {
                    method: 'POST',
                    credentials: 'include', // Important to send the cookie
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ twofaCode: code }),
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Verification failed.');
                }
                // Success, navigate to game
                this.navigateTo('/game');
            } catch (error: any) {
                errorMsg.textContent = error.message;
                errorMsg.classList.remove('hidden');
                twofaInput.value = ''; // Clear input on error
                submitButton.disabled = false;
                submitButton.textContent = 'Verify & Sign In';
            }
        });
    }
}


// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});