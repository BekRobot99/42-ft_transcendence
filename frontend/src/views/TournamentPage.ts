import { translate } from '../languageService.js';
import { renderGamePage } from './GamePage.js';
import { renderGamePage3D } from './GamePage3D.js';

let tournamentState: any = null;
let appContainer: HTMLElement | null = null;
let me: any = null;
let cleanupGame: (() => void) | null = null;

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
    appContainer.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'w-full max-w-4xl mx-auto text-center';
    appContainer.appendChild(header);

    if (!tournamentState) {
        renderCreationForm();
    } else if (tournamentState.status === 'pending') {
        renderLobby();
    } else {
        renderBracket();
    }
}

function renderCreationForm() {
    const formContainer = document.createElement('div');
    formContainer.className = 'bg-white p-8 border-2 border-black shadow-[8px_8px_0px_#000000] w-full max-w-md mx-auto';
    formContainer.innerHTML = `
        <h2 class="text-2xl font-bold mb-6 text-center">${translate('Create a New Tournament', 'Ein neues Turnier erstellen', 'Créer un nouveau tournoi')}</h2>
        <form id="tournament-create-form" class="space-y-4">
            <div>
                <label for="tournament-name" class="block text-sm font-medium text-gray-700">${translate('Tournament Name', 'Turniername', 'Nom du tournoi')}</label>
                <input type="text" id="tournament-name" name="name" required minlength="3" maxlength="32" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
               <label for="player-count" class="block text-sm font-medium text-gray-700">${translate('Number of Players', 'Anzahl der Spieler', 'Nombre de joueurs')}</label>
                <select id="player-count" name="playerCount" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="2" selected>${translate('2 Players', '2 Spieler', '2 Joueurs')}</option>
                    <option value="4">${translate('4 Players', '4 Spieler', '4 Joueurs')}</option>
                    <option value="8">${translate('8 Players', '8 Spieler', '8 Joueurs')}</option>
                    <option value="16">${translate('16 Players', '16 Spieler', '16 Joueurs')}</option>
                </select>
            </div>
            <div>
                <label for="game-type" class="block text-sm font-medium text-gray-700">${translate('Game Type', 'Spieltyp', 'Type de jeu')}</label>
                <select id="game-type" name="gameMode" class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="2d" selected>${translate('2D Pong', '2D Pong', 'Pong 2D')}</option>
                    <option value="3d">${translate('3D Pong', '3D Pong', 'Pong 3D')}</option>
                </select>
            </div>
           <button type="submit" class="w-full relative inline-block px-4 py-3 font-medium group">
                <span class="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-blue-800 group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
                <span class="absolute inset-0 w-full h-full bg-blue-600 border-2 border-blue-800 group-hover:bg-blue-800"></span>
                <span class="relative text-white">${translate('Create Tournament', 'Turnier erstellen', 'Créer le tournoi')}</span>
            </button>
            <p id="create-error" class="text-red-600 text-sm hidden mt-2 text-center"></p>
        </form>
    `;
    appContainer?.appendChild(formContainer);

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
    const lobbyContainer = document.createElement('div');
    lobbyContainer.className = 'bg-white p-8 border-2 border-black shadow-[8px_8px_0px_#000000] w-full max-w-2xl mx-auto';
    const participants = tournamentState.participants;
    const requiredPlayers = tournamentState.number_of_players;
    const canStart = participants.length === requiredPlayers;

    let participantListHTML = participants.map((p: any) => `<li class="p-2 bg-gray-200 rounded">${p.alias} ${p.user_id === tournamentState.creator_id ? `(${translate('Host', 'Gastgeber', 'Hôte')})` : ''}</li>`).join('');

    lobbyContainer.innerHTML = `
        <h2 class="text-2xl font-bold mb-2 text-center">${tournamentState.name}</h2>
        <p class="text-gray-600 mb-6 text-center">${translate('Waiting for players...', 'Warte auf Spieler...', 'En attente de joueurs...')} (${participants.length}/${requiredPlayers})</p>
        <ul class="space-y-2 mb-6">${participantListHTML}</ul>
        <div id="lobby-actions"></div>
        <p id="lobby-error" class="text-red-600 text-sm hidden mt-2 text-center"></p>
    `;
    appContainer?.appendChild(lobbyContainer);

    const actionsContainer = document.getElementById('lobby-actions')!;
    if (!canStart) {
        const form = document.createElement('form');
        form.id = 'add-participant-form';
        form.className = 'flex items-center space-x-2';
        form.innerHTML = `
            <input type="text" name="alias" placeholder="${translate('Enter player alias', 'Spieler-Alias eingeben', 'Entrez l\'alias du joueur')}" required minlength="3" maxlength="16" class="flex-grow px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <button type="submit" class="relative inline-block px-4 py-2 font-medium group">
                <span class="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-blue-800 group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
                <span class="absolute inset-0 w-full h-full bg-blue-600 border-2 border-blue-800 group-hover:bg-blue-800"></span>
                <span class="relative text-white">${translate('Add Player', 'Spieler hinzufügen', 'Ajouter un joueur')}</span>
            </button>
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
        startButton.className = 'w-full relative inline-block px-4 py-3 font-medium group';
        startButton.innerHTML = `
            <span class="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
            <span class="absolute inset-0 w-full h-full bg-white border-2 border-black group-hover:bg-black"></span>
            <span class="relative text-black group-hover:text-white">${translate('Start Tournament', 'Turnier starten', 'Démarrer le tournoi')}</span>
        `;
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
    const bracketContainer = document.createElement('div');
    bracketContainer.className = 'w-full max-w-4xl mx-auto';
    bracketContainer.innerHTML = `<h2 class="text-3xl font-bold mb-6 text-center">${tournamentState.name}</h2>`;

    const rounds: { [key: number]: any[] } = {};
    tournamentState.matches.forEach((match: any) => {
        if (!rounds[match.round]) rounds[match.round] = [];
        (rounds[match.round] ?? []).push(match);
    });

    const bracketGrid = document.createElement('div');
    bracketGrid.className = 'flex justify-center space-x-8';

    Object.keys(rounds).sort().forEach(roundNumber => {
        const roundEl = document.createElement('div');
        roundEl.className = 'flex flex-col justify-around space-y-8';
        roundEl.innerHTML = `<h3 class="text-xl font-semibold text-center mb-4">${translate('Round', 'Runde', 'Manche')} ${roundNumber}</h3>`;

        const matches = rounds[parseInt(roundNumber)];
        if (matches) {
            matches.forEach((match: any) => {
                const matchEl = document.createElement('div');
                matchEl.className = 'p-4 border-2 border-black rounded-lg bg-gray-100 shadow-[4px_4px_0px_#000000]';
                 const player1 = match.player1_alias || `<i>${translate('Winner of', 'Sieger von', 'Gagnant de')} R${match.round - 1} M${Math.ceil(match.match_in_round * 2 - 1)}</i>`;
            const player2 = match.player2_alias || `<i>${translate('Winner of', 'Sieger von', 'Gagnant de')} R${match.round - 1} M${Math.ceil(match.match_in_round * 2)}</i>`;
                
                let content = `<div class="font-bold ${match.winner_id === match.player1_id ? 'text-green-600' : ''}">${player1}</div><div class="text-gray-500 my-1">vs</div><div class="font-bold ${match.winner_id === match.player2_id ? 'text-green-600' : ''}">${player2}</div>`;

                if (match.status === 'pending' && match.player1_id && match.player2_id && me && me.id === tournamentState.creator_id) {
                     content += `<button data-match-id="${match.id}" class="play-match-btn mt-2 w-full relative inline-block px-2 py-1 font-medium group">
                    <span class="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-0.5 translate-y-0.5 bg-blue-600 group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
                    <span class="absolute inset-0 w-full h-full bg-blue-400 border-2 border-blue-600 group-hover:bg-blue-600"></span>
                    <span class="relative text-black group-hover:text-white text-sm font-bold">${translate('Play Match', 'Spiel spielen', 'Jouer le match')}</span>
                </button>`;
                } else if (match.status === 'completed') {
                    content += `<p class="text-sm text-center mt-2 text-green-700">${translate('Winner', 'Sieger', 'Gagnant')}: ${match.winner_alias}</p>`;
                }
                matchEl.innerHTML = content;
                roundEl.appendChild(matchEl);
            });
        }
        bracketGrid.appendChild(roundEl);
    });

    bracketContainer.appendChild(bracketGrid);

    if (tournamentState.status === 'completed') {
        const winner = tournamentState.matches.find((m: any) => m.round === Object.keys(rounds).length)?.winner_alias;
        bracketContainer.innerHTML += `<p class="text-4xl font-bold text-center mt-8 text-yellow-500">🏆 ${translate('Winner', 'Sieger', 'Gagnant')}: ${winner} 🏆</p>`;
    }

    appContainer?.appendChild(bracketContainer);

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
        appContainer = null;
        tournamentState = null;
        me = null;
    };
    return cleanup;
}
