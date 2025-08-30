export function renderHomePage(container: HTMLElement): void {
    const homeWrapper = document.createElement('div');
    homeWrapper.className = 'bg-white rounded-lg shadow-lg p-8';

    const headerSection = document.createElement('div');
    headerSection.className = 'text-center mb-8';

    const mainTitle = document.createElement('h1');
    mainTitle.className = 'text-3xl font-bold text-gray-800 mb-2';
    mainTitle.textContent = 'ft_transcendence';

    const subtitle = document.createElement('p');
    subtitle.className = 'text-gray-600';
    subtitle.textContent = 'Sign in to start playing Pong!';

    headerSection.appendChild(mainTitle);
    headerSection.appendChild(subtitle);

    const actionButtons = document.createElement('div');
    actionButtons.className = 'flex gap-4 mb-4';

    const signInBtn = document.createElement('button');
    signInBtn.id = 'signInBtn';
    signInBtn.className = 'flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
    signInBtn.textContent = 'Sign In';

    const registerBtn = document.createElement('button');
    registerBtn.id = 'registerBtn';
    registerBtn.className = 'flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
    registerBtn.textContent = 'Register';

    actionButtons.appendChild(signInBtn);
    actionButtons.appendChild(registerBtn);

    const separator = document.createElement('div');
    separator.className = 'relative mb-4';
    const hr = document.createElement('hr');
    hr.className = 'border-t border-gray-300';
    const orText = document.createElement('span');
    orText.className = 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-500';
    orText.textContent = 'or';
    separator.appendChild(hr);
    separator.appendChild(orText);

    const googleBtn = document.createElement('button');
    googleBtn.id = 'googleBtn';
    googleBtn.className = 'w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 border border-gray-300 rounded-lg shadow-sm transition duration-150 ease-in-out';
    const googleIcon = document.createElement('img');
    googleIcon.src = 'https://www.google.com/favicon.ico';
    googleIcon.alt = 'Google logo';
    googleIcon.className = 'w-5 h-5';
    const googleBtnText = document.createElement('span');
    googleBtnText.textContent = 'Continue with Google';
    googleBtn.appendChild(googleIcon);
    googleBtn.appendChild(googleBtnText);

    homeWrapper.appendChild(headerSection);
    homeWrapper.appendChild(actionButtons);
    homeWrapper.appendChild(separator);
    homeWrapper.appendChild(googleBtn);

    container.appendChild(homeWrapper);
}

export function attachHomePageListeners(app: any): void {
    app.googleBtn = document.getElementById('googleBtn');
    app.signInBtn = document.getElementById('signInBtn');
    app.registerBtn = document.getElementById('registerBtn');

    if (app.googleBtn) {
        app.googleBtn.addEventListener('click', async (event: Event) => {
            event.preventDefault();
             try {
        const res = await fetch('/api/auth/google/url');
        if (!res.ok) throw new Error('Failed to get Google auth URL');
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } catch (error) {
        console.error("Google Sign In failed:", error);
      }
        });
    }
    if (app.signInBtn) {
        app.signInBtn.addEventListener('click', (e: Event) => app.navigateTo('/signin', e));
    }
}
