// frontend/src/views/SocialView.ts

// Helper to create a profile card
function createProfileCard(user: any, ...buttons: HTMLButtonElement[]): HTMLElement {
    const card = document.createElement('div');
    card.className = 'flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm';

    const profileInfo = document.createElement('div');
    profileInfo.className = 'flex items-center gap-3';

    const profileAvatar = document.createElement('img');
    profileAvatar.src = user.avatar_path || '/assets/default-avatar.jpg';
    profileAvatar.alt = `${user.username}'s avatar`;
    profileAvatar.className = 'w-10 h-10 rounded-full object-cover';
    profileAvatar.onerror = () => { profileAvatar.src = '/assets/default-avatar.jpg'; };

    const profileNameBox = document.createElement('div');
    const profileDisplayName = document.createElement('span');
    profileDisplayName.className = 'font-semibold text-gray-800';
    profileDisplayName.textContent = user.display_name || user.username;
    const profileUsername = document.createElement('span');
    profileUsername.className = 'text-sm text-gray-500';
    profileUsername.textContent = `@${user.username}`;
    
    profileNameBox.appendChild(profileDisplayName);
    profileNameBox.appendChild(document.createElement('br'));
    profileNameBox.appendChild(profileUsername);

    profileInfo.appendChild(profileAvatar);
    profileInfo.appendChild(profileNameBox);

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'flex gap-2';
    buttons.forEach(btn => buttonGroup.appendChild(btn));

    card.appendChild(profileInfo);
    card.appendChild(buttonGroup);

    return card;
}

// Main render function
export async function renderSocialView(container: HTMLElement): Promise<void> {
    container.innerHTML = ''; // Clear previous content

    const wrapper = document.createElement('div');
    wrapper.className = 'bg-white rounded-lg shadow-lg p-8 space-y-8';

    const pageTitle = document.createElement('h2');
    pageTitle.className = 'text-2xl font-bold mb-6 text-center';
    pageTitle.textContent = 'Friends';

    // --- Add Friend Section ---
    const addFriendSection = document.createElement('div');
    addFriendSection.className = 'border-b pb-6';
    const addFriendForm = document.createElement('form');
    addFriendForm.className = 'flex gap-2';
    const friendUsernameInput = document.createElement('input');
    friendUsernameInput.type = 'text';
    friendUsernameInput.placeholder = 'Enter username to add';
    friendUsernameInput.className = 'flex-grow px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
    const sendRequestButton = document.createElement('button');
    sendRequestButton.type = 'submit';
    sendRequestButton.textContent = 'Send Request';
    sendRequestButton.className = 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm';
    const addFriendFeedback = document.createElement('p');
    addFriendFeedback.className = 'text-sm mt-2';

    addFriendForm.appendChild(friendUsernameInput);
    addFriendForm.appendChild(sendRequestButton);
    addFriendSection.appendChild(addFriendForm);
    addFriendSection.appendChild(addFriendFeedback);

    addFriendForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = friendUsernameInput.value.trim();
        if (!username) return;

        sendRequestButton.disabled = true;
        sendRequestButton.textContent = 'Sending...';
        addFriendFeedback.textContent = '';
        addFriendFeedback.className = 'text-sm mt-2';

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
            addFriendFeedback.classList.add('text-green-600');
            friendUsernameInput.value = '';
            renderSocialView(container); // Re-render to show new outgoing request
        } catch (error: any) {
            addFriendFeedback.textContent = error.message;
            addFriendFeedback.classList.add('text-red-600');
        } finally {
            sendRequestButton.disabled = false;
            sendRequestButton.textContent = 'Send Request';
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

    // Incoming
    if (incoming.length > 0) {
        const incomingTitle = document.createElement('h3');
        incomingTitle.className = 'text-xl font-semibold mb-4';
        incomingTitle.textContent = 'Incoming Requests';
        const incomingList = document.createElement('div');
        incomingList.className = 'space-y-3';

        incoming.forEach(req => {
            const acceptButton = document.createElement('button');
            acceptButton.textContent = 'Accept';
            acceptButton.className = 'bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-1 px-3 rounded-lg';
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
            declineButton.textContent = 'Decline';
            declineButton.className = 'bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-1 px-3 rounded-lg';
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
        container.appendChild(incomingTitle);
        container.appendChild(incomingList);
    }

    // Outgoing
    if (outgoing.length > 0) {
        const outgoingTitle = document.createElement('h3');
        outgoingTitle.className = 'text-xl font-semibold mt-6 mb-4';
        outgoingTitle.textContent = 'Outgoing Requests';
        const outgoingList = document.createElement('div');
        outgoingList.className = 'space-y-3';

        outgoing.forEach(req => {
            const cancelButton = document.createElement('button');
            cancelButton.textContent = 'Cancel';
            cancelButton.className = 'bg-gray-500 hover:bg-gray-600 text-white text-sm font-semibold py-1 px-3 rounded-lg';
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
        container.appendChild(outgoingTitle);
        container.appendChild(outgoingList);
    }
}

// Render Friends List
function renderFriendList(container: HTMLElement, friends: any[], rerenderCallback: () => void) {
    container.innerHTML = '';
    const title = document.createElement('h3');
    title.className = 'text-xl font-semibold mt-6 mb-4';
    title.textContent = 'Your Friends';
    container.appendChild(title);

    const list = document.createElement('div');
    list.className = 'space-y-3';

    if (friends.length === 0) {
        list.textContent = 'You have no friends yet. Add one above!';
        list.className = 'text-gray-500';
    } else {
        friends.forEach(friend => {
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.className = 'bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-1 px-3 rounded-lg';
            removeButton.onclick = async () => {
                if (confirm(`Are you sure you want to remove ${friend.username}?`)) {
                    await fetch(`/api/friends/${friend.id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                    });
                    rerenderCallback();
                }
            };
            list.appendChild(createProfileCard(friend, removeButton));
        });
    }
    container.appendChild(list);
}
