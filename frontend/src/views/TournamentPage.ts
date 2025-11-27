import { translate } from '../languageService.js';
import { renderGamePage } from './GamePage.js';
import { renderGamePage3D } from './GamePage3D.js';

let tournamentState: any = null;
let appContainer: HTMLElement | null = null;
let me: any = null;
let cleanupGame: (() => void) | null = null;
let leavesInterval: number | null = null;

// Global cleanup function for leaves
function cleanupFallingLeaves() {
    if (leavesInterval) {
        clearInterval(leavesInterval);
        leavesInterval = null;
    }
    // Remove any existing falling leaves
    document.querySelectorAll('.leaf-falling').forEach(leaf => leaf.remove());
}

async function fetchMe() {
    try {
        const res = await fetch('/api/me');
        if (!res.ok) throw new Error('Failed to fetch user data');
        const data = await res.json();
        me = data.user;
    } catch (error) {
        console.error(error);
        appContainer!.innerHTML = `<p class="text-red-500">${translate('Error loading user data. Please try again.', 'Fehler beim Laden der Benutzerdaten. Bitte versuchen Sie es erneut.', 'Erreur lors du chargement des données utilisateur. Veuillez réessayer.')}</p>`;
    }
}

async function fetchTournament(id: number) {
    try {
        const res = await fetch(`/api/tournaments/${id}`);
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Failed to fetch tournament data');
        }
        tournamentState = await res.json();
        render();
    } catch (error) {
        console.error(error);
        tournamentState = null;
        render();
    }
}

function render() {
    if (!appContainer) return;
    if (cleanupGame) {
        cleanupGame();
        cleanupGame = null;
    }
    
    // Clear any falling leaves when switching views
    cleanupFallingLeaves();
    
    appContainer.innerHTML = '';

    // full-width
    const pageContent = document.getElementById('page-content');
    
    if (!tournamentState) {
        pageContent?.classList.remove('tournament-active');
        renderCreationForm();
    } else if (tournamentState.status === 'pending') {
        pageContent?.classList.remove('tournament-active');
        renderLobby();
    } else {
        pageContent?.classList.add('tournament-active');
        renderBracket();
    }
}

function renderCreationForm() {
    const scrollWrapper = document.createElement('div');
    scrollWrapper.style.cssText = 'max-height: 90vh; overflow-y: auto; padding: 1rem;';
    
    const formContainer = document.createElement('div');
    formContainer.className = 'autumn-glass w-full max-w-md mx-auto';
    formContainer.style.cssText = 'min-width: 300px; max-width: min(500px, 90vw);';
    formContainer.innerHTML = `
        <h2 class="autumn-title">${translate('Create a New Tournament', 'Ein neues Turnier erstellen', 'Créer un nouveau tournoi')}</h2>
        <p class="autumn-subtitle">${translate('Create and invite players to your tournament below.', 'Erstelle und lade Spieler zu deinem Turnier ein.', 'Créez et invitez des joueurs à votre tournoi ci-dessous.')}</p>
        <form id="tournament-create-form" class="autumn-form-group">
            <div class="autumn-form-group">
                <label for="tournament-name" class="autumn-label">${translate('Tournament Name', 'Turniername', 'Nom du tournoi')}</label>
                <input type="text" id="tournament-name" name="name" required minlength="3" maxlength="32" class="autumn-input">
            </div>
            <div class="autumn-form-group">
               <label for="player-count" class="autumn-label">${translate('Number of Players', 'Anzahl der Spieler', 'Nombre de joueurs')}</label>
                <select id="player-count" name="playerCount" class="autumn-input">
                    <option value="2" selected>${translate('2 Players', '2 Spieler', '2 Joueurs')}</option>
                    <option value="4">${translate('4 Players', '4 Spieler', '4 Joueurs')}</option>
                    <option value="8">${translate('8 Players', '8 Spieler', '8 Joueurs')}</option>
                    <option value="16">${translate('16 Players', '16 Spieler', '16 Joueurs')}</option>
                </select>
            </div>
            <div class="autumn-form-group">
                <label for="game-type" class="autumn-label">${translate('Game Type', 'Spieltyp', 'Type de jeu')}</label>
                <select id="game-type" name="gameMode" class="autumn-input">
                    <option value="2d" selected>${translate('2D Pong', '2D Pong', 'Pong 2D')}</option>
                    <option value="3d">${translate('3D Pong', '3D Pong', 'Pong 3D')}</option>
                </select>
            </div>
           <button type="submit" class="autumn-button">${translate('Create Tournament', 'Turnier erstellen', 'Créer le tournoi')}</button>
            <p id="create-error" class="autumn-error hidden mt-2 text-center"></p>
        </form>
    `;
    scrollWrapper.appendChild(formContainer);
    appContainer?.appendChild(scrollWrapper);

    const form = document.getElementById('tournament-create-form') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('create-error')!;
        errorEl.classList.add('hidden');
        const formData = new FormData(form);
        const name = formData.get('name') as string;
        const playerCount = parseInt(formData.get('playerCount') as string, 10);
        const gameMode = formData.get('gameMode') as string;

        try {
            const res = await fetch('/api/tournaments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, playerCount, gameMode }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to create tournament');
            }
            const newTournament = await res.json();
            history.pushState({ tournamentId: newTournament.id }, '', `/tournament?id=${newTournament.id}`);
            await fetchTournament(newTournament.id);
        } catch (error: any) {
            errorEl.textContent = error.message;
            errorEl.classList.remove('hidden');
        }
    });
}

function renderLobby() {
    const scrollWrapper = document.createElement('div');
    scrollWrapper.style.cssText = 'max-height: 90vh; overflow-y: auto; padding: 1rem;';
    
    const lobbyContainer = document.createElement('div');
    lobbyContainer.className = 'autumn-glass tournament-lobby-container';
    lobbyContainer.style.cssText = 'min-width: 300px; max-width: min(600px, 90vw); margin: 0 auto;';
    const participants = tournamentState.participants;
    const requiredPlayers = tournamentState.number_of_players;
    const canStart = participants.length === requiredPlayers;

    let participantListHTML = participants.map((p: any) => {
        const initials = (p.alias || '').split(' ').map((s: string) => s[0]).join('').slice(0,2).toUpperCase() || '??';
        const hostBadge = p.user_id === tournamentState.creator_id ? `<span class="participant-host">${translate('Host', 'Gastgeber', 'Hôte')}</span>` : '';
        return `<li class="participant-item"><div class="participant-avatar">${initials}</div><div class="participant-alias">${p.alias}</div>${hostBadge}</li>`;
    }).join('');

    lobbyContainer.innerHTML = `
        <h2 class="autumn-title mb-2 text-center">${tournamentState.name}</h2>
        <p class="autumn-subtitle text-center">${translate('Waiting for players...', 'Warte auf Spieler...', 'En attente de joueurs...')} (${participants.length}/${requiredPlayers})</p>
        <ul class="participant-list mb-6">${participantListHTML}</ul>
        <div id="lobby-actions"></div>
        <p id="lobby-error" class="autumn-error hidden mt-2 text-center"></p>
    `;
    scrollWrapper.appendChild(lobbyContainer);
    appContainer?.appendChild(scrollWrapper);

    const actionsContainer = document.getElementById('lobby-actions')!;
    if (!canStart) {
        const form = document.createElement('form');
        form.id = 'add-participant-form';
        form.className = 'lobby-form';
        form.innerHTML = `
            <input type="text" name="alias" placeholder="${translate('Enter player alias', 'Spieler-Alias eingeben', 'Entrez l\'alias du joueur')}" required minlength="3" maxlength="16" class="autumn-input">
            <button type="submit" class="tournament-button-full">${translate('Add Player', 'Spieler hinzufügen', 'Ajouter un joueur')}</button>
        `;
        actionsContainer.appendChild(form);
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const alias = (form.elements.namedItem('alias') as HTMLInputElement).value;
            const errorEl = document.getElementById('lobby-error')!;
            errorEl.classList.add('hidden');
            try {
                const res = await fetch(`/api/tournaments/${tournamentState.id}/participants`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ alias }),
                });
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || 'Failed to add player');
                }
                await fetchTournament(tournamentState.id);
            } catch (error: any) {
                errorEl.textContent = error.message;
                errorEl.classList.remove('hidden');
            }
        });
    } else {
        const startButton = document.createElement('button');
        startButton.id = 'start-tournament-btn';
        startButton.className = 'autumn-button';
        startButton.textContent = translate('Start Tournament', 'Turnier starten', 'Démarrer le tournoi');
        actionsContainer.appendChild(startButton);
        startButton.addEventListener('click', async () => {
            const errorEl = document.getElementById('lobby-error')!;
            errorEl.classList.add('hidden');
            try {
                const res = await fetch(`/api/tournaments/${tournamentState.id}/start`, { method: 'POST' });
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || 'Failed to start tournament');
                }
                await fetchTournament(tournamentState.id);
            } catch (error: any) {
                errorEl.textContent = error.message;
                errorEl.classList.remove('hidden');
            }
        });
    }
}

function renderBracket() {
    const scrollWrapper = document.createElement('div');
    scrollWrapper.style.cssText = 'max-height: 90vh; overflow: auto; padding: 1rem;';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'tournament-bracket-wrapper';
    wrapper.style.cssText = 'min-width: 600px;';

    // title
    const title = document.createElement('h2');
    title.className = 'autumn-title';
    title.textContent = tournamentState.name;
    wrapper.appendChild(title);

    // bracket container
    const bracketContainer = document.createElement('div');
    bracketContainer.className = 'tournament-bracket-container';
    bracketContainer.style.cssText = 'overflow-x: auto; min-width: 100%;';

    // rounds
    const rounds: { [key: number]: any[] } = {};
    tournamentState.matches.forEach((match: any) => {
        if (!rounds[match.round]) {
            rounds[match.round] = [];
        }
        rounds[match.round]!.push(match);
    });

    const roundKeys = Object.keys(rounds).sort((a, b) => Number(a) - Number(b));
    const isLargeTournament = rounds[1] && rounds[1].length >= 8;

    if (isLargeTournament) {
        bracketContainer.classList.add('split-first-round');
    }

    // vertical rounds
    roundKeys.forEach((roundNumber, index) => {
        const rNum = parseInt(roundNumber);
        const matches = rounds[rNum];
        
        if (!matches) return;
        
        if (isLargeTournament && rNum === 1) {
            const midpoint = Math.ceil(matches.length / 2);
            
            const roundElTop = document.createElement('div');
            roundElTop.className = 'tournament-bracket-round split-top';
            const roundTitleTop = document.createElement('div');
            roundTitleTop.className = 'tournament-bracket-round-title';
            roundTitleTop.textContent = `${translate('Round', 'Runde', 'Manche')} ${roundNumber}`;
            roundElTop.appendChild(roundTitleTop);

            matches.slice(0, midpoint).forEach((match: any) => {
                roundElTop.appendChild(createMatchElement(match));
            });
            bracketContainer.appendChild(roundElTop);

            const roundElBottom = document.createElement('div');
            roundElBottom.className = 'tournament-bracket-round split-bottom';
            const roundTitleBottom = document.createElement('div');
            roundTitleBottom.className = 'tournament-bracket-round-title';
            roundTitleBottom.textContent = `${translate('Round', 'Runde', 'Manche')} ${roundNumber}`;
            roundElBottom.appendChild(roundTitleBottom);

            matches.slice(midpoint).forEach((match: any) => {
                roundElBottom.appendChild(createMatchElement(match));
            });
            bracketContainer.appendChild(roundElBottom);
        } else {
            const roundEl = document.createElement('div');
            roundEl.className = 'tournament-bracket-round';
            const roundTitle = document.createElement('div');
            roundTitle.className = 'tournament-bracket-round-title';
            roundTitle.textContent = `${translate('Round', 'Runde', 'Manche')} ${roundNumber}`;
            roundEl.appendChild(roundTitle);

            if (matches) {
                matches.forEach((match: any) => {
                    roundEl.appendChild(createMatchElement(match));
                });
            }
            bracketContainer.appendChild(roundEl);
        }
    });

    function createMatchElement(match: any): HTMLElement {
        const matchEl = document.createElement('div');
        matchEl.className = 'tournament-bracket-match';
        const player1 = match.player1_alias || `<i>${translate('Winner of', 'Sieger von', 'Gagnant de')} R${match.round - 1} M${Math.ceil(match.match_in_round * 2 - 1)}</i>`;
        const player2 = match.player2_alias || `<i>${translate('Winner of', 'Sieger von', 'Gagnant de')} R${match.round - 1} M${Math.ceil(match.match_in_round * 2)}</i>`;

        let content = `<div class="${match.winner_id === match.player1_id ? 'winner' : 'loser'}">${player1}</div><div class="vs">vs</div><div class="${match.winner_id === match.player2_id ? 'winner' : 'loser'}">${player2}</div>`;

        if (match.status === 'pending' && match.player1_id && match.player2_id && me && me.id === tournamentState.creator_id) {
            content += `<button data-match-id="${match.id}" class="play-match-btn autumn-button-light" style="margin-top:8px">${translate('Play Match', 'Spiel spielen', 'Jouer le match')}</button>`;
        } else if (match.status === 'completed') {
            content += `<div style="margin-top:8px; color:#92400e; font-weight:600;">${match.player1_score} - ${match.player2_score}</div>`;
        }
        matchEl.innerHTML = content;
        return matchEl;
    }

    // champion box
    if (tournamentState.status === 'completed') {
        const winner = tournamentState.matches.find((m: any) => m.round === Object.keys(rounds).length)?.winner_alias;
        const championEl = document.createElement('div');
        championEl.className = 'tournament-bracket-champion';
        championEl.innerHTML = `${translate('Winner', 'Sieger', 'Gagnant')}: ${winner}`;
        
        // hide title and bracket container
        const title = wrapper.querySelector('.autumn-title');
        if (title) (title as HTMLElement).style.display = 'none';
        bracketContainer.style.opacity = '0';
        bracketContainer.style.pointerEvents = 'none';
        
        wrapper.appendChild(championEl);
        
        // leaves falling from navigation bar
        const fallLeaves = () => {
            const leaf = document.createElement('div');
            leaf.className = 'leaf-falling';
            
            leaf.style.left = `${Math.random() * 100}%`;
            const duration = 5 + Math.random() * 4;
            leaf.style.animationDuration = `${duration}s`;
            leaf.style.animationDelay = `${Math.random() * 2}s`;
            
            document.body.appendChild(leaf);
            
            setTimeout(() => {
                if (leaf.parentNode) {
                    leaf.remove();
                }
            }, (duration + 2) * 1000);
        };
        
        // initial leaves and keep adding more
        for (let i = 0; i < 30; i++) {
            setTimeout(() => fallLeaves(), i * 200);
        }
        leavesInterval = setInterval(fallLeaves, 400) as any;
    }

    wrapper.appendChild(bracketContainer);
    scrollWrapper.appendChild(wrapper);
    appContainer?.appendChild(scrollWrapper);

    document.querySelectorAll('.play-match-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const matchId = (e.currentTarget as HTMLElement).dataset.matchId;
            const match = tournamentState.matches.find((m: any) => m.id == matchId);
            if (match) {
                playMatch(match);
            }
        });
    });
}

function playMatch(match: any) {
    if (!appContainer) return;
    appContainer.innerHTML = ''; // Clear view for game
    const gameWrapper = document.createElement('div');
    appContainer.appendChild(gameWrapper);

    const gameOptions = {
        player1Name: match.player1_alias,
        player2Name: match.player2_alias,
        onGameEnd: async (result: { winnerName: string, score1: number, score2: number }) => {
            const winnerId = result.winnerName === match.player1_alias ? match.player1_id : match.player2_id;
            try {
                await fetch(`/api/matches/${match.id}/winner`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        winnerId,
                        score1: result.score1,
                        score2: result.score2
                    }),
                });
            } catch (error) {
                console.error("Failed to report winner", error);
            } finally {
                // Fetch updated state and re-render bracket
                await fetchTournament(tournamentState.id);
            }
        }
   };

    if (tournamentState.game_type === '3d') {
        cleanupGame = renderGamePage3D(gameWrapper, gameOptions);
    } else {
        cleanupGame = renderGamePage(gameWrapper, gameOptions);
    }
}

export async function renderTournamentView(container: HTMLElement): Promise<() => void> {
    appContainer = container;
    
    const handleNavigation = () => cleanupFallingLeaves();
    const handleVisibilityChange = () => {
        if (document.hidden) {
            cleanupFallingLeaves();
        }
    };
    
    const interceptClicks = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.matches('.autumn-button-nav, [data-link], a[href], button[onclick*="navigate"]') || 
            target.closest('.top-nav-bar, .game-nav-title') ||
            target.textContent?.includes('Game Mode') || 
            target.textContent?.includes('Chat') ||
            target.textContent?.includes('Friends') ||
            target.textContent?.includes('Settings')) {
            cleanupFallingLeaves();
        }
    };
    
    window.addEventListener('beforeunload', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('click', interceptClicks, true);
    
    await fetchMe();

    const urlParams = new URLSearchParams(window.location.search);
    const tournamentId = urlParams.get('id');

    if (tournamentId) {
        await fetchTournament(parseInt(tournamentId, 10));
    } else {
        tournamentState = null;
        render();
    }

    const cleanup = () => {
        if (cleanupGame) cleanupGame();
        
        // clear falling leaves
        cleanupFallingLeaves();
        
        const handleNavigation = () => cleanupFallingLeaves();
        const handleVisibilityChange = () => {
            if (document.hidden) {
                cleanupFallingLeaves();
            }
        };
        const interceptClicks = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.matches('.autumn-button-nav, [data-link], a[href], button[onclick*="navigate"]') || 
                target.closest('.top-nav-bar, .game-nav-title') ||
                target.textContent?.includes('Game Mode') || 
                target.textContent?.includes('Chat') ||
                target.textContent?.includes('Friends') ||
                target.textContent?.includes('Settings')) {
                cleanupFallingLeaves();
            }
        };
        
        window.removeEventListener('beforeunload', handleNavigation);
        window.removeEventListener('popstate', handleNavigation);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('click', interceptClicks, true);
        
        appContainer = null;
        tournamentState = null;
        me = null;
    };
    return cleanup;
}
