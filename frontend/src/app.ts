import { removeNavigationBar, renderNavigationBar } from './ui/NavigationBar.js';
import { SignUpForm } from './ui/SingUpForm.js';
import { ConnectForm } from './ui/ConnectForm.js';
import { translate } from './languageService.js';
import { renderSocialView } from './views/SocialView.js';
import { renderTournamentView } from './views/TournamentPage.js';
import { renderProfilePage } from './views/ProfilePage.js';
import { attachHomePageListeners, renderHomePage } from './views/HomePage.js';
import { renderSettingsPage } from './views/SettingsPage.js';
import { renderGamePage } from './views/GamePage.js';
import { renderGamePage3D } from './views/GamePage3D.js';
import { ChatPage } from './views/ChatPage.js';
import { createLanguageDropdown } from './ui/LanguageDropdown.js';


class App {
    private pageContentElement: HTMLElement | null;
    private googleSignInButton: HTMLElement | null = null;
    private signInButton: HTMLElement | null = null;
    private registerButton: HTMLElement | null = null;
    private navBarElement: HTMLElement | null = null;
    private isAuthenticated: boolean = false;
    private currentUser: any = null;
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

         // Handle clicks on SPA links
        document.body.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a[data-link]');
            if (anchor && anchor.getAttribute('href')) {
                e.preventDefault();
                this.navigateTo(anchor.getAttribute('href')!);
            }
        });
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
           if (!res.ok) {
                this.currentUser = null;
                return false;
            }
            const data = await res.json();
            this.currentUser = data.user;
            return !!data.user;
        } catch {
            this.currentUser = null;
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
        const protectedPaths = ['/game', '/settings', '/friends', '/tournament', '/chat'];
        if (!this.isAuthenticated && (protectedPaths.some(p => path.startsWith(p)) || path.startsWith('/profile/'))) {
            history.replaceState({ path: '/' }, '', '/');
            return this.renderView('/');
        }

        // NAV BAR: Show only for authenticated/protected pages
         if (this.isAuthenticated && (protectedPaths.some(p => path.startsWith(p)) || path.startsWith('/profile/'))) {
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

         const createBackButton = (text: string, path: string) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.className = 'block w-full text-center mt-4 text-sm text-black hover:underline';
            button.addEventListener('click', () => this.navigateTo(path));
            return button;
        };


        if (path === '/register') {
            const registerForm = new SignUpForm(this);
            this.pageContentElement.appendChild(registerForm.render());

        }else if (path.startsWith('/auth/google/callback')) {
            this.pageContentElement.innerHTML = `
                <div class="text-center">
                     <p class="text-lg font-semibold">${translate('Signing in with Google...', 'Anmeldung mit Google...', 'Connexion avec Google...')}</p>
                    <p class="text-gray-600">${translate('Please wait, you will be redirected shortly.', 'Bitte warten, Sie werden in Kürze weitergeleitet.', 'Veuillez patienter, vous serez redirigé sous peu.')}</p>
                </div>
            `;
            this.handleGoogleCallback();
        } else if (path === '/verify-2fa') {
            this.renderTwoFactorView();
        } else if (path === '/signin') {
            const signInForm = new ConnectForm(this);
            this.pageContentElement.appendChild(signInForm.render());

            } else if (path.startsWith('/profile/')) {
            const username = path.substring('/profile/'.length);
            if (username) {
                await renderProfilePage(this.pageContentElement, username);
                
            } else {
                this.navigateTo('/game');
            }
        } else if (path === '/game') {
            // Create top navigation bar for game selection
            const topNav = document.createElement('div');
            topNav.className = 'top-game-nav';

            // Left side with title and buttons
            const leftSection = document.createElement('div');
            leftSection.className = 'top-game-nav-left';

            const gameTitle = document.createElement('span');
            gameTitle.className = 'game-nav-title';
            gameTitle.textContent = translate('Choose Game Mode', 'Spielmodus wählen', 'Choisir le mode de jeu');
            leftSection.appendChild(gameTitle);

            // to start a game and clean up
            const startGame = (gameType: '2d' | '3d', mode: 'human' | 'ai') => {
                if (!this.pageContentElement) return;
                this.pageContentElement.innerHTML = '';
                if (document.body.contains(topNav)) document.body.removeChild(topNav);
                
                // Clean up pumpkin
                const pumpkin = document.getElementById('nav-pumpkin');
                if (pumpkin) {
                    cancelAnimationFrame(pumpkinAnimationId);
                    pumpkin.parentNode?.removeChild(pumpkin);
                }

                if (gameType === '2d') {
                    const options: any = { mode: mode };
                    if (mode === 'ai') {
                        options.aiDifficulty = 'medium';
                    }
                    this.currentViewCleanup = renderGamePage(this.pageContentElement, options);
                } else {
                    // 3D 
                    this.currentViewCleanup = renderGamePage3D(this.pageContentElement, {
                        player1Name: translate('Player 1', 'Spieler 1', 'Joueur 1'),
                        player2Name: translate('Player 2', 'Spieler 2', 'Joueur 2'),
                        onGameEnd: (result) => {
                            alert(`${result.winnerName} wins! Score: ${result.score1} - ${result.score2}`);
                            this.navigateTo('/game');
                        }
                    });
                }
            };

            // 2D 
            const game2DContainer = document.createElement('div');
            game2DContainer.className = 'game-dropdown-container';
            
            const game2DButton = document.createElement('button');
            game2DButton.className = 'autumn-button-nav';
            game2DButton.innerHTML = `2D Pong ▾`;
            
            const game2DDropdown = document.createElement('div');
            game2DDropdown.className = 'game-dropdown-menu';
            game2DDropdown.innerHTML = `
                <button class="game-dropdown-item" data-mode="human">${translate('2 Player', '2 Spieler', '2 Joueurs')}</button>
                <button class="game-dropdown-item" data-mode="ai">${translate('1 Player (AI)', '1 Spieler (KI)', '1 Joueur (IA)')}</button>
            `;
            
            // toggle
            game2DButton.addEventListener('click', (e) => {
                e.stopPropagation();
                game2DDropdown.classList.toggle('show');
                // close
                game3DDropdown.classList.remove('show');
            });
            
            game2DDropdown.querySelectorAll('.game-dropdown-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const mode = (e.target as HTMLElement).getAttribute('data-mode') as 'human' | 'ai';
                    game2DDropdown.classList.remove('show');
                    startGame('2d', mode);
                });
            });
            
            game2DContainer.appendChild(game2DButton);
            game2DContainer.appendChild(game2DDropdown);

            // 3D 
            const game3DContainer = document.createElement('div');
            game3DContainer.className = 'game-dropdown-container';
            
            const game3DButton = document.createElement('button');
            game3DButton.className = 'autumn-button-nav';
            game3DButton.innerHTML = `3D Pong ▾`;
            
            const game3DDropdown = document.createElement('div');
            game3DDropdown.className = 'game-dropdown-menu';
            game3DDropdown.innerHTML = `
                <button class="game-dropdown-item" data-mode="human">${translate('2 Player', '2 Spieler', '2 Joueurs')}</button>
            `;
            
            // toggle
            game3DButton.addEventListener('click', (e) => {
                e.stopPropagation();
                game3DDropdown.classList.toggle('show');
                // close
                game2DDropdown.classList.remove('show');
            });
            
            game3DDropdown.querySelectorAll('.game-dropdown-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const mode = (e.target as HTMLElement).getAttribute('data-mode') as 'human' | 'ai';
                    game3DDropdown.classList.remove('show');
                    startGame('3d', mode);
                });
            });
            
            game3DContainer.appendChild(game3DButton);
            game3DContainer.appendChild(game3DDropdown);

            // Tournament Button
            const tournamentButton = document.createElement('button');
            tournamentButton.className = 'autumn-button-nav';
            tournamentButton.innerHTML = `🏆 ${translate('Tournament', 'Turnier', 'Tournoi')}`;
            
            tournamentButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo('/tournament');
            });

            leftSection.appendChild(game2DContainer);
            leftSection.appendChild(game3DContainer);
            leftSection.appendChild(tournamentButton);

            // close dropdowns when clicking outside
            document.addEventListener('click', () => {
                game2DDropdown.classList.remove('show');
                game3DDropdown.classList.remove('show');
            });

            // Right side with language dropdown
            const rightSection = document.createElement('div');
            rightSection.className = 'top-game-nav-right';

            // Import and create language dropdown
            const langSelectorContainer = createLanguageDropdown(this, {
                className: 'autumn-language-dropdown',
                containerClassName: 'flex items-center'
            });
            rightSection.appendChild(langSelectorContainer);

            topNav.appendChild(leftSection);
            topNav.appendChild(rightSection);

            // Insert nav at top of body
            document.body.insertBefore(topNav, document.body.firstChild);

            // Create bouncing pumpkin
            const pumpkin = document.createElement('img');
            pumpkin.src = '/assets/pumpkin.png';
            pumpkin.id = 'nav-pumpkin';
            document.body.appendChild(pumpkin);

            // Initialize pumpkin state
            const pumpkinState = {
                x: Math.random() * (window.innerWidth - 60),
                y: Math.random() * (window.innerHeight - 60),
                dx: (Math.random() > 0.5 ? 1 : -1) * 2,
                dy: (Math.random() > 0.5 ? 1 : -1) * 2
            };

            // Animation function for the pumpkin
            let pumpkinAnimationId: number;
            function animatePumpkin() {
                pumpkinState.x += pumpkinState.dx;
                pumpkinState.y += pumpkinState.dy;

                // Bounce off edges
                if (pumpkinState.x <= 0 || pumpkinState.x >= window.innerWidth - 60) {
                    pumpkinState.dx *= -1;
                }
                if (pumpkinState.y <= 0 || pumpkinState.y >= window.innerHeight - 60) {
                    pumpkinState.dy *= -1;
                }

                pumpkin.style.left = `${pumpkinState.x}px`;
                pumpkin.style.top = `${pumpkinState.y}px`;
                pumpkin.style.transform = `rotate(${Date.now() / 100 % 360}deg)`;

                pumpkinAnimationId = requestAnimationFrame(animatePumpkin);
            }

            // Start the animation
            pumpkinAnimationId = requestAnimationFrame(animatePumpkin);

            // Create main content area with centered game selection
            const gamePageContainer = document.createElement('div');
            gamePageContainer.className = 'game-page-with-nav flex flex-col items-center';

            // Game mode selection title
            const centerTitle = document.createElement('h1');
            centerTitle.className = 'game-mode-title';
            centerTitle.textContent = translate('Choose Game Mode', 'Spielmodus wählen', 'Choisir le mode de jeu');
            gamePageContainer.appendChild(centerTitle);

            // Row container for 2D and 3D buttons (horizontal)
            const gameButtonsRow = document.createElement('div');
            gameButtonsRow.className = 'flex gap-6 mb-6';

            // 2D Game Button with Dropdown (center)
            const center2DContainer = document.createElement('div');
            center2DContainer.className = 'game-dropdown-container';
            
            const center2DButton = document.createElement('button');
            center2DButton.className = 'autumn-button-light game-mode-button-horizontal';
            center2DButton.innerHTML = `2D Pong ▾`;
            
            const center2DDropdown = document.createElement('div');
            center2DDropdown.className = 'game-dropdown-menu';
            center2DDropdown.innerHTML = `
                <button class="game-dropdown-item" data-mode="human">${translate('2 Player', '2 Spieler', '2 Joueurs')}</button>
                <button class="game-dropdown-item" data-mode="ai">${translate('1 Player (AI)', '1 Spieler (KI)', '1 Joueur (IA)')}</button>
            `;
            
            // Toggle dropdown on button click
            center2DButton.addEventListener('click', (e) => {
                e.stopPropagation();
                center2DDropdown.classList.toggle('show');
                // Close other dropdown
                center3DDropdown.classList.remove('show');
            });
            
            center2DDropdown.querySelectorAll('.game-dropdown-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const mode = (e.target as HTMLElement).getAttribute('data-mode') as 'human' | 'ai';
                    center2DDropdown.classList.remove('show');
                    startGame('2d', mode);
                });
            });
            
            center2DContainer.appendChild(center2DButton);
            center2DContainer.appendChild(center2DDropdown);

            // 3D Game Button with Dropdown (center, 2 Player only)
            const center3DContainer = document.createElement('div');
            center3DContainer.className = 'game-dropdown-container';
            
            const center3DButton = document.createElement('button');
            center3DButton.className = 'autumn-button-light game-mode-button-horizontal';
            center3DButton.innerHTML = `3D Pong ▾`;
            
            const center3DDropdown = document.createElement('div');
            center3DDropdown.className = 'game-dropdown-menu';
            center3DDropdown.innerHTML = `
                <button class="game-dropdown-item" data-mode="human">${translate('2 Player', '2 Spieler', '2 Joueurs')}</button>
            `;
            
            // Toggle dropdown on button click
            center3DButton.addEventListener('click', (e) => {
                e.stopPropagation();
                center3DDropdown.classList.toggle('show');
                // Close other dropdown
                center2DDropdown.classList.remove('show');
            });
            
            center3DDropdown.querySelectorAll('.game-dropdown-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const mode = (e.target as HTMLElement).getAttribute('data-mode') as 'human' | 'ai';
                    center3DDropdown.classList.remove('show');
                    startGame('3d', mode);
                });
            });
            
            center3DContainer.appendChild(center3DButton);
            center3DContainer.appendChild(center3DDropdown);

            gameButtonsRow.appendChild(center2DContainer);
            gameButtonsRow.appendChild(center3DContainer);
            gamePageContainer.appendChild(gameButtonsRow);

            // Tournament Button (below, centered)
            const centerTournamentButton = document.createElement('button');
            centerTournamentButton.className = 'autumn-button-light tournament-button-full';
            centerTournamentButton.innerHTML = `${translate('Start a Tournament', 'Starte ein Turnier', 'Démarrer un tournoi')}`;
            
            centerTournamentButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo('/tournament');
            });

            gamePageContainer.appendChild(centerTournamentButton);
            this.pageContentElement.appendChild(gamePageContainer);

            // Close center dropdowns when clicking outside (reuse same listener to close all)
            const closeAllDropdowns = () => {
                center2DDropdown.classList.remove('show');
                center3DDropdown.classList.remove('show');
            };
            document.addEventListener('click', closeAllDropdowns);

            this.currentViewCleanup = () => {
                // Remove navigation bar
                if (document.body.contains(topNav)) {
                    document.body.removeChild(topNav);
                }

                // Clean up pumpkin
                const pumpkin = document.getElementById('nav-pumpkin');
                if (pumpkin) {
                    cancelAnimationFrame(pumpkinAnimationId);
                    pumpkin.parentNode?.removeChild(pumpkin);
                }
            };

        } else if (path === '/tournament') {
            this.currentViewCleanup = await renderTournamentView(this.pageContentElement);

        } else if (path === '/settings') {
            await renderSettingsPage(this.pageContentElement);
            
        } else if (path === '/friends') {
            await renderSocialView(this.pageContentElement);
            
        } else if (path === '/chat') {
            if (this.currentUser) {
                const chatPage = new ChatPage(this.currentUser.id);
                this.pageContentElement.appendChild(chatPage.render());
                this.currentViewCleanup = () => chatPage.destroy();
            }
        } else { // Default to home view
            renderHomePage(this.pageContentElement, this);
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
        title.textContent = translate('Two-Factor Authentication', 'Zwei-Faktor-Authentifizierung', 'Authentification à deux facteurs');

        const instruction = document.createElement('p');
        instruction.className = 'text-gray-600 mb-6 text-center';
        instruction.textContent = translate('Enter the code from your authenticator app to complete sign-in.', 'Geben Sie den Code aus Ihrer Authentifizierungs-App ein, um die Anmeldung abzuschließen.', 'Entrez le code de votre application d\'authentification pour terminer la connexion.');

        const form = document.createElement('form');
        form.className = 'space-y-4';

        const twofaInput = document.createElement('input');
        twofaInput.type = 'text';
        twofaInput.placeholder = translate('6-digit code', '6-stelliger Code', 'Code à 6 chiffres');
        twofaInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
        twofaInput.maxLength = 6;
        twofaInput.autocomplete = 'one-time-code';
        twofaInput.inputMode = 'numeric';
        twofaInput.pattern = '[0-9]*';

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = translate('Verify & Sign In', 'Verifizieren & Anmelden', 'Vérifier et se connecter');
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
            submitButton.textContent = translate('Verifying...', 'Überprüfung...', 'Vérification...');

            const code = twofaInput.value.trim();
            if (!/^\d{6}$/.test(code)) {
                errorMsg.textContent = translate('Please enter a valid 6-digit code.', 'Bitte geben Sie einen gültigen 6-stelligen Code ein.', 'Veuillez entrer un code valide à 6 chiffres.');
                errorMsg.classList.remove('hidden');
                submitButton.disabled = false;
                submitButton.textContent = translate('Verify & Sign In', 'Verifizieren & Anmelden', 'Vérifier et se connecter');
                return;
            }

            try {
                const res = await fetch('/api/auth/google/verify-2fa', {
                    method: 'POST',
                    credentials: 'include', // Important to send the cookie
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mfaCode: code }),
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
                 submitButton.textContent = translate('Verify & Sign In', 'Verifizieren & Anmelden', 'Vérifier et se connecter');
            }
        });
    }
}


// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});