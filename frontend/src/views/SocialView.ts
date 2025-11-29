import { translate } from "../languageService.js";

// Helper to create a profile card
function createProfileCard(user: any, ...buttons: HTMLButtonElement[]): HTMLElement {
    const card = document.createElement('div');
    card.className = 'flex items-center justify-between autumn-glass p-4 rounded-xl transition-all duration-300 hover:transform hover:translateY(-1px)';
    card.dataset.userId = user.id;
    card.style.background = 'rgba(255, 255, 255, 0.15)';
    card.style.backdropFilter = 'blur(12px)';
    card.style.border = '1px solid rgba(255, 255, 255, 0.2)';

    const profileInfo = document.createElement('div');
    profileInfo.className = 'flex items-center gap-3';

    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'relative';
    avatarContainer.style.width = '48px';
    avatarContainer.style.height = '48px';
    avatarContainer.style.flexShrink = '0';

    const profileAvatar = document.createElement('div');
    profileAvatar.className = 'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg';
    profileAvatar.style.background = 'linear-gradient(135deg, var(--autumn-primary), var(--autumn-secondary))';
    profileAvatar.style.boxShadow = '0 4px 12px rgba(217, 119, 6, 0.3)';
    profileAvatar.style.width = '100%';
    profileAvatar.style.height = '100%';
    profileAvatar.textContent = (user.display_name || user.username).charAt(0).toUpperCase();

    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white';
    statusIndicator.style.background = user.isOnline ? '#22c55e' : '#78716c';
    statusIndicator.title = user.isOnline ? translate('Online', 'Online', 'En ligne') : translate('Offline', 'Offline', 'Hors ligne');

    avatarContainer.appendChild(profileAvatar);
    avatarContainer.appendChild(statusIndicator);

    const profileNameBox = document.createElement('div');
    const profileDisplayName = document.createElement('div');
    profileDisplayName.className = 'font-semibold';
    profileDisplayName.style.color = 'var(--autumn-dark)';
    profileDisplayName.style.fontFamily = 'Georgia, serif';
    profileDisplayName.textContent = user.display_name || user.username;

    const profileUsername = document.createElement('div');
    profileUsername.className = 'text-sm';
    profileUsername.style.color = '#78716c';
    profileUsername.textContent = `@${user.username}`;
    
    profileNameBox.appendChild(profileDisplayName);
    profileNameBox.appendChild(profileUsername);

    profileInfo.appendChild(avatarContainer);
    profileInfo.appendChild(profileNameBox);

    const profileLink = document.createElement('a');
    profileLink.href = `/profile/${user.username}`;
    profileLink.setAttribute('data-link', '');
    profileLink.className = 'flex-grow';
    profileLink.appendChild(profileInfo);
    
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'flex gap-2';
    buttons.forEach(btn => buttonGroup.appendChild(btn));

    card.appendChild(profileLink);
    card.appendChild(buttonGroup);

    return card;
}

// Main render function
export async function renderSocialView(container: HTMLElement): Promise<void> {
    container.innerHTML = ''; // Clear previous content

    const wrapper = document.createElement('div');
    wrapper.className = 'autumn-container';
    wrapper.style.maxWidth = '900px';
    wrapper.style.width = 'calc(100% - 2rem)';

    const pageTitle = document.createElement('h2');
    pageTitle.className = 'autumn-title';
    pageTitle.style.marginBottom = '2rem';
    pageTitle.textContent = translate('Friends', 'Freunde', 'Amis');

    // --- Add Friend Section ---
    const addFriendSection = document.createElement('div');
    addFriendSection.className = 'autumn-glass';
    addFriendSection.style.marginBottom = '1.5rem';
    addFriendSection.style.padding = '1.5rem';

    const addFriendTitle = document.createElement('h3');
    addFriendTitle.style.color = 'var(--autumn-secondary)';
    addFriendTitle.style.fontFamily = 'Georgia, serif';
    addFriendTitle.style.fontWeight = '600';
    addFriendTitle.style.marginBottom = '1rem';
    addFriendTitle.textContent = translate('Add Friend', 'Freund hinzufügen', 'Ajouter un ami');

    const addFriendForm = document.createElement('form');
    addFriendForm.style.display = 'flex';
    addFriendForm.style.flexDirection = 'column';
    addFriendForm.style.alignItems = 'center';
    addFriendForm.style.gap = '1rem';

    const friendUsernameInput = document.createElement('input');
    friendUsernameInput.type = 'text';
    friendUsernameInput.className = 'autumn-input';
    friendUsernameInput.style.width = '100%';
    friendUsernameInput.style.maxWidth = '400px';
    friendUsernameInput.style.margin = '0';
    friendUsernameInput.placeholder = translate('Enter username to add', 'Benutzernamen eingeben', 'Entrez le nom d\'utilisateur');

    const sendRequestButton = document.createElement('button');
    sendRequestButton.type = 'submit';
    sendRequestButton.className = 'autumn-button-small';
    sendRequestButton.textContent = translate('Send Request', 'Anfrage senden', 'Envoyer');

    const addFriendFeedback = document.createElement('p');
    addFriendFeedback.style.fontSize = '0.875rem';
    addFriendFeedback.style.marginTop = '0.5rem';
    addFriendFeedback.style.fontFamily = 'Georgia, serif';

    addFriendForm.appendChild(friendUsernameInput);
    addFriendForm.appendChild(sendRequestButton);
    addFriendSection.appendChild(addFriendTitle);
    addFriendSection.appendChild(addFriendForm);
    addFriendSection.appendChild(addFriendFeedback);

    addFriendForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = friendUsernameInput.value.trim();
        if (!username) return;

        sendRequestButton.disabled = true;
        sendRequestButton.textContent = translate('Sending...', 'Senden...', 'Envoi...');
        addFriendFeedback.textContent = '';
        addFriendFeedback.style.color = '';

        try {
            const res = await fetch('/api/friends/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            
            addFriendFeedback.textContent = data.message;
            addFriendFeedback.style.color = 'var(--autumn-secondary)';
            friendUsernameInput.value = '';
            renderSocialView(container); // Re-render to show new outgoing request
        } catch (error: any) {
            addFriendFeedback.textContent = error.message;
            addFriendFeedback.style.color = '#dc2626';
        } finally {
            sendRequestButton.disabled = false;
            sendRequestButton.textContent = translate('Send Request', 'Anfrage senden', 'Envoyer');
        }
    });

    // --- Sections for requests and friends list ---
    const friendRequestsContainer = document.createElement('div');
    const friendListContainer = document.createElement('div');

    wrapper.appendChild(pageTitle);
    wrapper.appendChild(addFriendSection);
    wrapper.appendChild(friendRequestsContainer);
    wrapper.appendChild(friendListContainer);
    container.appendChild(wrapper);

    // Fetch all data and render sections
    try {
        const [requestsRes, friendsRes] = await Promise.all([
            fetch('/api/friends/requests', { credentials: 'include' }),
            fetch('/api/friends', { credentials: 'include' }),
        ]);

        if (!requestsRes.ok || !friendsRes.ok) {
            throw new Error('Failed to load friends data.');
        }

        const { incoming, outgoing } = await requestsRes.json();
        const friends = await friendsRes.json();

        renderFriendRequests(friendRequestsContainer, incoming, outgoing, () => renderSocialView(container));
        renderFriendList(friendListContainer, friends, () => renderSocialView(container));

    } catch (error: any) {
        container.innerHTML = `<p class="text-red-600">${error.message}</p>`;
    }
}

// Render Incoming and Outgoing Requests
function renderFriendRequests(container: HTMLElement, incoming: any[], outgoing: any[], rerenderCallback: () => void) {
    container.innerHTML = '';
    
    if (incoming.length === 0 && outgoing.length === 0) {
        return; // Don't render anything if no requests
    }

    const requestsWrapper = document.createElement('div');
    requestsWrapper.className = 'autumn-glass';
    requestsWrapper.style.padding = '1.5rem';
    requestsWrapper.style.marginBottom = '1.5rem';

    // Incoming
    if (incoming.length > 0) {
        const incomingTitle = document.createElement('h3');
        incomingTitle.style.color = 'var(--autumn-secondary)';
        incomingTitle.style.fontFamily = 'Georgia, serif';
        incomingTitle.style.fontWeight = '600';
        incomingTitle.style.marginBottom = '1rem';
        incomingTitle.textContent = translate('Incoming Requests', 'Eingehende Anfragen', 'Demandes entrantes');
        
        const incomingList = document.createElement('div');
        incomingList.style.display = 'flex';
        incomingList.style.flexDirection = 'column';
        incomingList.style.gap = '0.75rem';

        incoming.forEach(req => {
            const acceptButton = document.createElement('button');
            acceptButton.className = 'autumn-button-small';
            acceptButton.style.background = 'linear-gradient(135deg, #ba6317 0%, #92400e 100%)';
            acceptButton.innerHTML = `${translate('Accept', 'Akzeptieren', 'Accepter')}`;
            acceptButton.onclick = async () => {
                await fetch(`/api/friends/request/${req.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ action: 'accept' })
                });
                rerenderCallback();
            };

            const declineButton = document.createElement('button');
            declineButton.className = 'autumn-button-small';
            declineButton.style.background = 'linear-gradient(135deg, #78716c, #57534e)';
            declineButton.innerHTML = `${translate('Decline', 'Ablehnen', 'Refuser')}`;
            declineButton.onclick = async () => {
                await fetch(`/api/friends/request/${req.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ action: 'decline' })
                });
                rerenderCallback();
            };

            incomingList.appendChild(createProfileCard(req, acceptButton, declineButton));
        });
        requestsWrapper.appendChild(incomingTitle);
        requestsWrapper.appendChild(incomingList);
    }

    // Outgoing
    if (outgoing.length > 0) {
        const outgoingTitle = document.createElement('h3');
        outgoingTitle.style.color = 'var(--autumn-secondary)';
        outgoingTitle.style.fontFamily = 'Georgia, serif';
        outgoingTitle.style.fontWeight = '600';
        outgoingTitle.style.marginTop = incoming.length > 0 ? '1.5rem' : '0';
        outgoingTitle.style.marginBottom = '1rem';
        outgoingTitle.textContent = translate('Outgoing Requests', 'Ausgehende Anfragen', 'Demandes sortantes');
        
        const outgoingList = document.createElement('div');
        outgoingList.style.display = 'flex';
        outgoingList.style.flexDirection = 'column';
        outgoingList.style.gap = '0.75rem';

        outgoing.forEach(req => {
            const cancelButton = document.createElement('button');
            cancelButton.className = 'autumn-button-small';
            cancelButton.style.background = 'linear-gradient(135deg, #78716c, #57534e)';
            cancelButton.innerHTML = `${translate('Cancel', 'Abbrechen', 'Annuler')}`;
            cancelButton.onclick = async () => {
                await fetch(`/api/friends/request/${req.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ action: 'decline' })
                });
                rerenderCallback();
            };
            outgoingList.appendChild(createProfileCard(req, cancelButton));
        });
        requestsWrapper.appendChild(outgoingTitle);
        requestsWrapper.appendChild(outgoingList);
    }

    container.appendChild(requestsWrapper);
}

// Render Friends List
function renderFriendList(container: HTMLElement, friends: any[], rerenderCallback: () => void) {
    container.innerHTML = '';
    
    const friendsWrapper = document.createElement('div');
    friendsWrapper.className = 'autumn-glass';
    friendsWrapper.style.padding = '1.5rem';

    const title = document.createElement('h3');
    title.style.color = 'var(--autumn-secondary)';
    title.style.fontFamily = 'Georgia, serif';
    title.style.fontWeight = '600';
    title.style.marginBottom = '1rem';
    title.textContent = `${translate('Your Friends', 'Deine Freunde', 'Tes amis')} (${friends.length})`;

    if (friends.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.padding = '2rem';
        emptyMessage.style.color = '#78716c';
        emptyMessage.style.fontFamily = 'Georgia, serif';
        emptyMessage.style.fontStyle = 'italic';
        emptyMessage.innerHTML = `
            <img src="/assets/leaf.png" alt="" style="width: 64px; height: 64px; opacity: 0.5; display: block; margin: 0 auto 1rem;" />
            ${translate('You have no friends yet. Add one above!', 'Du hast noch keine Freunde. Füge oben einen hinzu!', 'Vous n\'avez pas encore d\'amis. Ajoutez-en un ci-dessus !')}
        `;
        friendsWrapper.appendChild(title);
        friendsWrapper.appendChild(emptyMessage);
    } else {
        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.gap = '0.75rem';

        friends.forEach(friend => {
            const removeButton = document.createElement('button');
            removeButton.className = 'autumn-button-small';
            removeButton.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            removeButton.innerHTML = `${translate('Remove', 'Entfernen', 'Supprimer')}`;
            removeButton.onclick = async () => {
                if (confirm(translate(`Are you sure you want to remove ${friend.username}?`, `Bist du sicher, dass du ${friend.username} entfernen möchtest?`, `Êtes-vous sûr de vouloir supprimer ${friend.username} ?`))) {
                    await fetch(`/api/friends/${friend.id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                    });
                    rerenderCallback();
                }
            };
            list.appendChild(createProfileCard(friend, removeButton));
        });
        friendsWrapper.appendChild(title);
        friendsWrapper.appendChild(list);
    }
    
    container.appendChild(friendsWrapper);
}
