export function renderNavigationBar(app: any): void {
    // Remove existing nav bar if present
    if (app.navBarElement && app.navBarElement.parentNode) {
        app.navBarElement.parentNode.removeChild(app.navBarElement);
    }

    // Create nav bar
    const nav = document.createElement('nav');
    nav.className = 'w-full bg-black text-white shadow-md fixed top-0 left-0 z-50';
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

     // My Profile button
    const profileButton = document.createElement('button');
    profileButton.className = 'bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
    profileButton.textContent = 'My Profile';
    profileButton.addEventListener('click', (e) => {
        if (app.currentUser) {
            app.navigateTo(`/profile/${app.currentUser.username}`, e);
        }
    });

    // Friends button
    const friendsButton = document.createElement('button');
    friendsButton.className = 'bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
    friendsButton.textContent = 'Friends';
    friendsButton.addEventListener('click', (e) => app.navigateTo('/friends', e));

    // Settings button
    const settingsButton = document.createElement('button');
    settingsButton.className = 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
    settingsButton.textContent = 'Settings';
    settingsButton.addEventListener('click', (e) => app.navigateTo('/settings', e));

    // Log out button
    const logoutButton = document.createElement('button');
   logoutButton.className = 'bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
    logoutButton.textContent = 'Log Out';
    logoutButton.addEventListener('click', async () => {
         // Close WebSocket connection before logging out
        if (app.disconnectWebSocket) {
            app.disconnectWebSocket();
        }
        await fetch('/api/signout', { method: 'POST', credentials: 'include' });
        history.replaceState({ path: '/' }, '', '/');
        app.renderView('/');
    });

    right.appendChild(friendsButton);
    right.appendChild(settingsButton);
    right.appendChild(logoutButton);

    nav.appendChild(logo);
    nav.appendChild(right);

    // Insert nav bar at the very top of the body
    document.body.insertBefore(nav, document.body.firstChild);
    app.navBarElement = nav;

    if (app.pageContentElement) {
        app.pageContentElement.style.paddingTop = '80px';
    }
}

export function removeNavigationBar(app: any): void {
    if (app.navBarElement && app.navBarElement.parentNode) {
        app.navBarElement.parentNode.removeChild(app.navBarElement);
        app.navBarElement = null;
    }
    if (app.pageContentElement) {
        app.pageContentElement.style.paddingTop = '';
    }
}