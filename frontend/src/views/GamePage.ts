export function renderGamePage(container: HTMLElement): void {
    const gameWrapper = document.createElement('div');
    gameWrapper.className = 'bg-white rounded-lg shadow-lg p-8 text-center';

    const gameTitle = document.createElement('h2');
    gameTitle.className = 'text-2xl font-bold mb-4';
    gameTitle.textContent = 'Welcome to Pong!';

    // TODO: add game content here

    gameWrapper.appendChild(gameTitle);
    container.appendChild(gameWrapper);
}
