import { translate } from "../languageService.js";

export async function renderProfilePage(gamecontainer: HTMLElement, username: string): Promise<void> {
    gamecontainer.innerHTML = `<p class="text-center">${translate('Loading profile...', 'Lade Profil...', 'Chargement du profil...')}</p>`;

    try {
        const res = await fetch(`/api/users/${username}/profile`, { credentials: 'include' });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Failed to load profile.');
        }
        const data = await res.json();
        const { user, stats, matchHistory } = data;

        gamecontainer.innerHTML = ''; // Clear loading message

        const gamewrapper = document.createElement('div');
        gamewrapper.className = 'bg-white rounded-lg p-8 space-y-8 w-full max-w-4xl mx-auto border-2 border-black shadow-[8px_8px_0px_#000000]';

        // --- User Info Header ---
        const header = document.createElement('div');
        header.className = 'flex flex-col md:flex-row items-center gap-6 border-b pb-6';
        const avatar = document.createElement('img');
        avatar.src = user.avatar_path || '/assets/default-avatar.jpg';
        avatar.alt = `${user.username}'s avatar`;
        avatar.className = 'w-32 h-32 rounded-full object-cover border-4 border-gray-200';
        avatar.onerror = () => { avatar.src = '/assets/default-avatar.jpg'; };

        const userInfo = document.createElement('div');
        const displayName = document.createElement('h2');
        displayName.className = 'text-3xl font-bold text-gray-800';
        displayName.textContent = user.display_name || user.username;
        const userName = document.createElement('p');
        userName.className = 'text-lg text-gray-500';
        userName.textContent = `@${user.username}`;
        const memberSince = document.createElement('p');
        memberSince.className = 'text-sm text-gray-400 mt-2';
        memberSince.textContent = `${translate('Member since', 'Mitglied seit', 'Membre depuis')} ${new Date(user.created_at).toLocaleDateString()}`;

        userInfo.appendChild(displayName);
        userInfo.appendChild(userName);
        userInfo.appendChild(memberSince);
        header.appendChild(avatar);
        header.appendChild(userInfo);

        // --- Stats Section ---
        const statsSection = document.createElement('div');
        statsSection.className = 'flex justify-around text-center';
        const winsDiv = document.createElement('div');
        winsDiv.innerHTML = `<p class="text-2xl font-bold text-green-600">${stats.wins}</p><p class="text-gray-500">${translate('Wins', 'Siege', 'Victoires')}</p>`;
        const lossesDiv = document.createElement('div');
        lossesDiv.innerHTML = `<p class="text-2xl font-bold text-red-600">${stats.losses}</p><p class="text-gray-500">${translate('Losses', 'Niederlagen', 'Défaites')}</p>`;
        const winRate = (stats.wins + stats.losses) > 0 ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100) : 0;
        const winRateDiv = document.createElement('div');
        winRateDiv.innerHTML = `<p class="text-2xl font-bold text-blue-600">${winRate}%</p><p class="text-gray-500">${translate('Win Rate', 'Siegquote', 'Taux de victoire')}</p>`;

        statsSection.appendChild(winsDiv);
        statsSection.appendChild(lossesDiv);
        statsSection.appendChild(winRateDiv);

        // --- Match History Section ---
        const historySection = document.createElement('div');
        const historyTitle = document.createElement('h3');
        historyTitle.className = 'text-xl font-semibold mb-4';
        historyTitle.textContent = translate('Match History', 'Spielverlauf', 'Historique des matchs');
        historySection.appendChild(historyTitle);

        if (matchHistory.length === 0) {
           historySection.innerHTML += `<p class="text-gray-500">${translate('No matches played yet.', 'Noch keine Spiele gespielt.', 'Aucun match joué pour le moment.')}</p>`;
        } else {
            const table = document.createElement('table');
            table.className = 'w-full text-left border-collapse';
            table.innerHTML = `
                <thead>
                    <tr>
                         <th class="py-2 px-4 bg-gray-100 border-b">${translate('Result', 'Ergebnis', 'Résultat')}</th>
                        <th class="py-2 px-4 bg-gray-100 border-b">${translate('Opponent', 'Gegner', 'Adversaire')}</th>
                        <th class="py-2 px-4 bg-gray-100 border-b">${translate('Score', 'Punktestand', 'Score')}</th>
                        <th class="py-2 px-4 bg-gray-100 border-b">${translate('Tournament', 'Turnier', 'Tournoi')}</th>
                        <th class="py-2 px-4 bg-gray-100 border-b">${translate('Date', 'Datum', 'Date')}</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;
            const tbody = table.querySelector('tbody')!;
            matchHistory.forEach((match: any) => {
                const row = document.createElement('tr');
                const resultText = match.result === 'Win' ? translate('Win', 'Sieg', 'Victoire') : translate('Loss', 'Niederlage', 'Défaite');
                const resultClass = match.result === 'Win' ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
                const opponentLink = match.opponent.username
                    ? `<a href="/profile/${match.opponent.username}" class="text-blue-600 hover:underline" data-link>${match.opponent.alias} (@${match.opponent.username})</a>`
                    : `${match.opponent.alias} (${translate('Guest', 'Gast', 'Invité')})`;

                row.innerHTML = `
                    <td class="py-2 px-4 border-b"><span class="${resultClass}">${resultText}</span></td>
                    <td class="py-2 px-4 border-b">${opponentLink}</td>
                    <td class="py-2 px-4 border-b">${match.score}</td>
                    <td class="py-2 px-4 border-b">${match.tournamentName}</td>
                    <td class="py-2 px-4 border-b">${new Date(match.playedAt).toLocaleString()}</td>
                `;
                tbody.appendChild(row);
            });
            const tableWrapper = document.createElement('div');
            tableWrapper.className = 'overflow-x-auto';
            tableWrapper.appendChild(table);
            historySection.appendChild(tableWrapper);

        }

        gamewrapper.appendChild(header);
        gamewrapper.appendChild(statsSection);
        gamewrapper.appendChild(historySection);
        gamecontainer.appendChild(gamewrapper);

    } catch (error: any) {
        gamecontainer.innerHTML = `<p class="text-red-600 text-center">${error.message}</p>`;
    }
}
