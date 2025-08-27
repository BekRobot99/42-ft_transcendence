import { SignUpForm } from './ui/SingUpForm.js';
import { ConnectForm } from './ui/ConnectForm.js';

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

     // --- NAV BAR ---
    private renderNavBar(): void {
        // Remove existing nav bar if present
        if (this.navBarElement && this.navBarElement.parentNode) {
            this.navBarElement.parentNode.removeChild(this.navBarElement);
        }

        // Create nav bar
        const nav = document.createElement('nav');
        nav.className = 'w-full bg-gray-900 text-white shadow-md fixed top-0 left-0 z-50';
        nav.style.height = '64px';
        nav.style.display = 'flex';
        nav.style.alignItems = 'center';
        nav.style.justifyContent = 'space-between';
        nav.style.padding = '0 2rem';

        // Logo/title
        const logo = document.createElement('div');
        logo.className = 'font-bold text-xl tracking-tight';
        logo.textContent = 'ft_transcendence';

        // Right side buttons
        const right = document.createElement('div');
        right.className = 'flex items-center gap-4';

        // Settings button
        const settingsButton = document.createElement('button');
        settingsButton.className = 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
        settingsButton.textContent = 'Settings';
        settingsButton.addEventListener('click', (e) => this.navigateTo('/settings', e));

        // Log out button
        const logoutButton = document.createElement('button');
        logoutButton.className = 'bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
        logoutButton.textContent = 'Log Out';
        logoutButton.addEventListener('click', async () => {
            await fetch('/api/signout', { method: 'POST', credentials: 'include' });
            history.replaceState({ path: '/' }, '', '/');
            this.renderView('/');
        });

        right.appendChild(settingsButton);
        right.appendChild(logoutButton);

        nav.appendChild(logo);
        nav.appendChild(right);

        // Insert nav bar at the very top of the body
        document.body.insertBefore(nav, document.body.firstChild);
        this.navBarElement = nav;

        // Add padding to page content so it's not hidden under the fixed nav bar
        if (this.pageContentElement) {
            this.pageContentElement.style.paddingTop = '80px';
        }
    }

    private removeNavBar(): void {
        if (this.navBarElement && this.navBarElement.parentNode) {
            this.navBarElement.parentNode.removeChild(this.navBarElement);
            this.navBarElement = null;
        }
        if (this.pageContentElement) {
            this.pageContentElement.style.paddingTop = '';
        }
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

        // NAV BAR: Show only for authenticated/protected pages
        if (this.isAuthenticated && protectedPaths.includes(path)) {
            this.renderNavBar();
        } else {
            this.removeNavBar();
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

        // Only render the game content area, nav bar is handled separately
        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold mb-4';
        title.textContent = 'Welcome to Pong!';

        // TODO: add game content here

        wrapper.appendChild(title);
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
        title.className = 'text-2xl font-bold mb-6';
        title.textContent = 'Settings';

         // --- Avatar Section ---
        const avatarSection = document.createElement('div');
        avatarSection.className = 'mb-6 text-center';

        const avatarImage = document.createElement('img');
        avatarImage.id = 'avatar-preview';
        avatarImage.className = 'w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200';
        avatarImage.src = user.avatar_path ? `${user.avatar_path}?t=${new Date().getTime()}` : '/assets/def_avatar.jpg';
        avatarImage.alt = 'User Avatar';
        avatarImage.onerror = () => { avatarImage.src = '/assets/def_avatar.jpg'; };

        const avatarButtonsContainer = document.createElement('div');
        avatarButtonsContainer.className = 'flex justify-center items-center gap-4 mt-2';

        const avatarLabel = document.createElement('label');
        avatarLabel.htmlFor = 'avatar-input';
        avatarLabel.className = 'cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
        avatarLabel.textContent = 'Change Avatar';

        const avatarInput = document.createElement('input');
        avatarInput.type = 'file';
        avatarInput.id = 'avatar-input';
        avatarInput.accept = 'image/png, image/jpeg';
        avatarInput.className = 'hidden';

         const deleteAvatarButton = document.createElement('button');
        deleteAvatarButton.id = 'delete-avatar-btn';
        deleteAvatarButton.className = 'bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
        deleteAvatarButton.textContent = 'Delete';
        if (!user.avatar_path) {
            deleteAvatarButton.classList.add('hidden');
        }

        const avatarErrorMsg = document.createElement('p');
        avatarErrorMsg.className = 'text-red-600 text-sm mt-2 hidden';

        avatarSection.appendChild(avatarImage);
        const avatarForm = document.createElement('form');
        avatarForm.appendChild(avatarLabel);
        avatarForm.appendChild(avatarInput);
        avatarButtonsContainer.appendChild(avatarForm);
        avatarButtonsContainer.appendChild(deleteAvatarButton);

        avatarSection.appendChild(avatarButtonsContainer);
        avatarSection.appendChild(avatarErrorMsg);

        avatarInput.addEventListener('change', async () => {
            avatarErrorMsg.classList.add('hidden');
            const file = avatarInput.files?.[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) { // 5MB
                avatarErrorMsg.textContent = 'File is too large (max 5MB).';
                avatarErrorMsg.classList.remove('hidden');
                avatarInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => { avatarImage.src = e.target?.result as string; };
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('avatar', file);

            try {
                const res = await fetch('/api/me/avatar', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Upload failed');
                
                avatarImage.src = `${data.avatarUrl}?t=${new Date().getTime()}`;
                user.avatar_path = data.avatarUrl;
                deleteAvatarButton.classList.remove('hidden'); // Show delete button
            } catch (error: any) {
                avatarErrorMsg.textContent = error.message;
                avatarErrorMsg.classList.remove('hidden');
                avatarImage.src = user.avatar_path ? `${user.avatar_path}?t=${new Date().getTime()}` : '/assets/def_avatar.jpg';
            } finally {
                avatarInput.value = '';
            }
        });

        deleteAvatarButton.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to delete your avatar?')) {
                return;
            }
            avatarErrorMsg.classList.add('hidden');
            try {
                const res = await fetch('/api/me/avatar', {
                    method: 'DELETE',
                    credentials: 'include',
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Failed to delete avatar.');
                }
                avatarImage.src = '/assets/default-avatar.jpg';
                user.avatar_path = null;
                deleteAvatarButton.classList.add('hidden');
            } catch (error: any) {
                avatarErrorMsg.textContent = error.message;
                avatarErrorMsg.classList.remove('hidden');
            }
        });

        // Form for user profile data
        const form = document.createElement('form');

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

               // 2FA Section
        const mfaWrapper = document.createElement('div');
        mfaWrapper.className = 'mb-4 border-t pt-4 mt-4';

        const mfaTitle = document.createElement('h3');
        mfaTitle.className = 'text-lg font-semibold mb-2';
        mfaTitle.textContent = 'Multi-Factor Authentication (MFA)';

        const mfaStatus = document.createElement('p');
        mfaStatus.className = 'mb-2';
        mfaStatus.textContent = user.mfa_enabled ? 'MFA is enabled.' : 'MFA is not enabled.';

        const mfaButton = document.createElement('button');
        mfaButton.type = 'button'; // Add this line
        mfaButton.className = 'bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out mb-2';
        mfaButton.textContent = user.mfa_enabled ? 'Disable MFA' : 'Enable MFA';

        const mfaContainer = document.createElement('div'); // For QR code and input

        mfaButton.addEventListener('click', async () => {
            mfaContainer.innerHTML = '';
            if (!user.mfa_enabled) {
                // Enable flow: get QR code
                const res = await fetch('/api/2fa/setup', { method: 'POST', credentials: 'include' });
                const data = await res.json();
                if (!res.ok) {
                    mfaContainer.innerHTML = `<p class="text-red-600">${data.message || 'Failed to start MFA setup.'}</p>`;
                    return;
                }
                // Show QR code and input
                const qrImg = document.createElement('img');
                qrImg.src = data.qr;
                qrImg.alt = '2FA QR Code';
                qrImg.className = 'mx-auto mb-2';
                const secretText = document.createElement('p');
                secretText.className = 'text-xs text-gray-500 mb-2 break-all';
                secretText.textContent = `Secret: ${data.secret}`;
                const codeInput = document.createElement('input');
                codeInput.type = 'text';
                codeInput.placeholder = 'Enter 6-digit code';
                codeInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm mb-2';
                codeInput.maxLength = 6;
                const verifyBtn = document.createElement('button');
                verifyBtn.type = 'button';
                verifyBtn.textContent = 'Verify & Enable';
                verifyBtn.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm mb-2';
                const msg = document.createElement('p');
                msg.className = 'text-sm mt-2';

                verifyBtn.addEventListener('click', async () => {
                    msg.textContent = '';
                    verifyBtn.disabled = true;
                    const code = codeInput.value.trim();
                    if (!/^\d{6}$/.test(code)) {
                        msg.textContent = 'Enter a valid 6-digit code.';
                        msg.className = 'text-red-600 text-sm mt-2';
                        verifyBtn.disabled = false;
                        return;
                    }
                    const res2 = await fetch('/api/2fa/enable', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code }),
                    });
                    const data2 = await res2.json();
                    if (res2.ok) {
                        msg.textContent = '2FA enabled!';
                        msg.className = 'text-green-600 text-sm mt-2';
                        mfaStatus.textContent = 'MFA is enabled.';
                        mfaButton.textContent = 'Disable MFA';
                        user.mfa_enabled = 1;
                        setTimeout(() => { mfaContainer.innerHTML = ''; }, 1500);
                    } else {
                        msg.textContent = data2.message || 'Failed to enable 2FA.';
                        msg.className = 'text-red-600 text-sm mt-2';
                    }
                    verifyBtn.disabled = false;
                });

                mfaContainer.appendChild(qrImg);
                mfaContainer.appendChild(secretText);
                mfaContainer.appendChild(codeInput);
                mfaContainer.appendChild(verifyBtn);
                mfaContainer.appendChild(msg);
            } else {
                // Disable flow
                const codeInput = document.createElement('input');
                codeInput.type = 'text';
                codeInput.placeholder = 'Enter 2FA code to disable';
                codeInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm mb-2';
                codeInput.maxLength = 6;
                const disableBtn = document.createElement('button');
                disableBtn.type = 'button';
                disableBtn.textContent = 'Disable 2FA';
                disableBtn.className = 'w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm mb-2';
                const msg = document.createElement('p');
                msg.className = 'text-sm mt-2';

                disableBtn.addEventListener('click', async () => {
                    msg.textContent = '';
                    disableBtn.disabled = true;
                    const code = codeInput.value.trim();
                    if (!/^\d{6}$/.test(code)) {
                        msg.textContent = 'Enter a valid 6-digit code.';
                        msg.className = 'text-red-600 text-sm mt-2';
                        disableBtn.disabled = false;
                        return;
                    }
                    const res2 = await fetch('/api/2fa/disable', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code }),
                    });
                    const data2 = await res2.json();
                    if (res2.ok) {
                        msg.textContent = '2FA disabled!';
                        msg.className = 'text-green-600 text-sm mt-2';
                        mfaStatus.textContent = '2FA is not enabled.';
                        mfaButton.textContent = 'Enable 2FA';
                        user.mfa_enabled = 0;
                        setTimeout(() => { mfaContainer.innerHTML = ''; }, 1500);
                    } else {
                        msg.textContent = data2.message || 'Failed to disable 2FA.';
                        msg.className = 'text-red-600 text-sm mt-2';
                    }
                    disableBtn.disabled = false;
                });

                mfaContainer.appendChild(codeInput);
                mfaContainer.appendChild(disableBtn);
                mfaContainer.appendChild(msg);
            }
        });

        mfaWrapper.appendChild(mfaTitle);
        mfaWrapper.appendChild(mfaStatus);
        mfaWrapper.appendChild(mfaButton);
        mfaWrapper.appendChild(mfaContainer);

        // Error and success messages
        const errorMsg = document.createElement('p');
        errorMsg.className = 'text-red-600 text-sm hidden mb-2';
        const successMsg = document.createElement('p');
        successMsg.className = 'text-green-600 text-sm hidden mb-2';

        // Save button
        const saveButton = document.createElement('button');
        saveButton.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
        saveButton.textContent = 'Save Changes';

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
        wrapper.appendChild(avatarSection);
        wrapper.appendChild(form);
        wrapper.appendChild(mfaWrapper);
        container.appendChild(wrapper);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});