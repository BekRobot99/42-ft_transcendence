import { translate } from "../languageService.js";

export async function renderSettingsPage(container: HTMLElement): Promise<void> {
    container.innerHTML = '';
    // Fetch current user info
    let user;
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        user = data.user;
    } catch {
       container.innerHTML = `<p class="text-red-600">${translate('Failed to load user info.', 'Benutzerinformationen konnten nicht geladen werden.', 'Échec du chargement des informations utilisateur.')}</p>`;
        return;
    }

    const settingsWrapper = document.createElement('div');
    settingsWrapper.className = 'bg-white rounded-lg shadow-lg p-8';

    const settingsTitle = document.createElement('h2');
    settingsTitle.className = 'text-2xl font-bold mb-6';
    settingsTitle.textContent = translate('Settings', 'Einstellungen', 'Paramètres');

    // --- Avatar Section ---
    const avatarSection = document.createElement('div');
    avatarSection.className = 'mb-6 text-center';

    const avatarPreview = document.createElement('img');
    avatarPreview.id = 'avatar-preview';
    avatarPreview.className = 'w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200';
    avatarPreview.src = user.avatar_path ? `${user.avatar_path}?t=${new Date().getTime()}` : '/assets/default-avatar.jpg';
    avatarPreview.alt = 'User Avatar';
    avatarPreview.onerror = () => { avatarPreview.src = '/assets/default-avatar.jpg'; };

    const avatarButtonsContainer = document.createElement('div');
    avatarButtonsContainer.className = 'flex justify-center items-center gap-4 mt-2';

    const avatarUploadLabel = document.createElement('label');
    avatarUploadLabel.htmlFor = 'avatar-input';
    avatarUploadLabel.className = 'cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
    avatarUploadLabel.textContent = translate('Change Avatar', 'Avatar ändern', 'Changer d\'avatar');

    const avatarFileInput = document.createElement('input');
    avatarFileInput.type = 'file';
    avatarFileInput.id = 'avatar-input';
    avatarFileInput.accept = 'image/png, image/jpeg';
    avatarFileInput.className = 'hidden';

    const deleteAvatarBtn = document.createElement('button');
    deleteAvatarBtn.id = 'delete-avatar-btn';
    deleteAvatarBtn.className = 'bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
    deleteAvatarBtn.textContent = translate('Delete', 'Löschen', 'Supprimer');
    if (!user.avatar_path) {
        deleteAvatarBtn.classList.add('hidden');
    }

    const avatarErrorMsg = document.createElement('p');
    avatarErrorMsg.className = 'text-red-600 text-sm mt-2 hidden';

    avatarSection.appendChild(avatarPreview);
    const avatarForm = document.createElement('form');
    avatarForm.appendChild(avatarUploadLabel);
    avatarForm.appendChild(avatarFileInput);

    avatarButtonsContainer.appendChild(avatarForm);
    avatarButtonsContainer.appendChild(deleteAvatarBtn);

    avatarSection.appendChild(avatarButtonsContainer);
    avatarSection.appendChild(avatarErrorMsg);

    avatarFileInput.addEventListener('change', async () => {
        avatarErrorMsg.classList.add('hidden');
        const file = avatarFileInput.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB
            avatarErrorMsg.textContent = translate('File is too large (max 5MB).', 'Datei ist zu groß (max. 5MB).', 'Le fichier est trop volumineux (max 5 Mo).');
            avatarErrorMsg.classList.remove('hidden');
            avatarFileInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => { avatarPreview.src = e.target?.result as string; };
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

            avatarPreview.src = `${data.avatarUrl}?t=${new Date().getTime()}`;
            user.avatar_path = data.avatarUrl;
            deleteAvatarBtn.classList.remove('hidden'); // Show delete button
        } catch (error: any) {
            avatarErrorMsg.textContent = error.message;
            avatarErrorMsg.classList.remove('hidden');
            avatarPreview.src = user.avatar_path ? `${user.avatar_path}?t=${new Date().getTime()}` : '/assets/default-avatar.jpg';
        } finally {
            avatarFileInput.value = '';
        }
    });

    deleteAvatarBtn.addEventListener('click', async () => {
        if (!confirm(translate('Are you sure you want to delete your avatar?', 'Sind Sie sicher, dass Sie Ihren Avatar löschen möchten?', 'Êtes-vous sûr de vouloir supprimer votre avatar ?'))) {
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
            avatarPreview.src = '/assets/default-avatar.jpg';
            user.avatar_path = null;
            deleteAvatarBtn.classList.add('hidden');
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
    usernameLabel.textContent = translate('Username', 'Benutzername', 'Nom d\'utilisateur');
    const usernameField = document.createElement('input');
    usernameField.type = 'text';
    usernameField.value = user.username;
    usernameField.maxLength = 16;
    usernameField.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    usernameField.autocomplete = 'off';
    usernameGroup.appendChild(usernameLabel);
    usernameGroup.appendChild(usernameField);

    // Display name
    const displayNameGroup = document.createElement('div');
    displayNameGroup.className = 'mb-4';
    const displayNameLabel = document.createElement('label');
    displayNameLabel.className = 'block text-sm font-medium text-gray-700 mb-1';
    displayNameLabel.textContent = translate('Display Name', 'Anzeigename', 'Nom d\'affichage');
    const displayNameInput = document.createElement('input');
    displayNameInput.type = 'text';
    displayNameInput.value = user.display_name || '';
    displayNameInput.maxLength = 32;
    displayNameInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    displayNameInput.autocomplete = 'off';
    displayNameGroup.appendChild(displayNameLabel);
    displayNameGroup.appendChild(displayNameInput);

    // 2FA Section
    const twofaGroup = document.createElement('div');
    twofaGroup.className = 'mb-4 border-t pt-4 mt-4';

    const twofaTitle = document.createElement('h3');
    twofaTitle.className = 'text-lg font-semibold mb-2';
    twofaTitle.textContent = translate('Two-Factor Authentication (2FA)', 'Zwei-Faktor-Authentifizierung (2FA)', 'Authentification à deux facteurs (2FA)');

    const twofaStatus = document.createElement('p');
    twofaStatus.className = 'mb-2';
    twofaStatus.textContent = user.twofa_enabled ? translate('2FA is enabled.', '2FA ist aktiviert.', 'La 2FA est activée.') : translate('2FA is not enabled.', '2FA ist nicht aktiviert.', 'La 2FA n\'est pas activée.');

    const twofaButton = document.createElement('button');
    twofaButton.type = 'button';
    twofaButton.className = 'bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out mb-2';
    twofaButton.textContent = user.twofa_enabled ? translate('Disable 2FA', '2FA deaktivieren', 'Désactiver la 2FA') : translate('Enable 2FA', '2FA aktivieren', 'Activer la 2FA');

    const twofaContainer = document.createElement('div'); // For QR code and input

    twofaButton.addEventListener('click', async () => {
        twofaContainer.innerHTML = '';
        if (!user.twofa_enabled) {
            // Enable flow: get QR code
            const res = await fetch('/api/2fa/setup', { method: 'POST', credentials: 'include' });
            const data = await res.json();
            if (!res.ok) {
                twofaContainer.innerHTML = `<p class="text-red-600">${data.message || 'Failed to start 2FA setup.'}</p>`;
                return;
            }
            // Show QR code and input
            const qrImg = document.createElement('img');
            qrImg.src = data.qr;
            qrImg.alt = '2FA QR Code';
            qrImg.className = 'mx-auto mb-2';
            const secretText = document.createElement('p');
            secretText.className = 'text-xs text-gray-500 mb-2 break-all';
            secretText.textContent = `${translate('Secret', 'Secret', 'Secret')}: ${data.secret}`;
            const codeInput = document.createElement('input');
            codeInput.type = 'text';
             codeInput.placeholder = translate('Enter 6-digit code', '6-stelligen Code eingeben', 'Entrez le code à 6 chiffres');
            codeInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm mb-2';
            codeInput.maxLength = 6;
            const verifyBtn = document.createElement('button');
            verifyBtn.type = 'button';
              verifyBtn.textContent = translate('Verify & Enable', 'Verifizieren & Aktivieren', 'Vérifier et activer');
            verifyBtn.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm mb-2';
            const msg = document.createElement('p');
            msg.className = 'text-sm mt-2';

            verifyBtn.addEventListener('click', async () => {
                msg.textContent = '';
                verifyBtn.disabled = true;
                const code = codeInput.value.trim();
                if (!/^\d{6}$/.test(code)) {
                     msg.textContent = translate('Enter a valid 6-digit code.', 'Geben Sie einen gültigen 6-stelligen Code ein.', 'Entrez un code valide à 6 chiffres.');
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
                     msg.textContent = translate('2FA enabled!', '2FA aktiviert!', '2FA activée !');
                    msg.className = 'text-green-600 text-sm mt-2';
                   twofaStatus.textContent = translate('2FA is enabled.', '2FA ist aktiviert.', 'La 2FA est activée.');
                    twofaButton.textContent = translate('Disable 2FA', '2FA deaktivieren', 'Désactiver la 2FA');
                    user.twofa_enabled = 1;
                    setTimeout(() => { twofaContainer.innerHTML = ''; }, 1500);
                } else {
                    msg.textContent = data2.message || 'Failed to enable 2FA.';
                    msg.className = 'text-red-600 text-sm mt-2';
                }
                verifyBtn.disabled = false;
            });

            twofaContainer.appendChild(qrImg);
            twofaContainer.appendChild(secretText);
            twofaContainer.appendChild(codeInput);
            twofaContainer.appendChild(verifyBtn);
            twofaContainer.appendChild(msg);
        } else {
            // Disable flow
            const codeInput = document.createElement('input');
            codeInput.type = 'text';
            codeInput.placeholder = translate('Enter 2FA code to disable', '2FA-Code zum Deaktivieren eingeben', 'Entrez le code 2FA pour désactiver');
            codeInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm mb-2';
            codeInput.maxLength = 6;
            const disableBtn = document.createElement('button');
            disableBtn.type = 'button';
            disableBtn.textContent = translate('Disable 2FA', '2FA deaktivieren', 'Désactiver la 2FA');
            disableBtn.className = 'w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm mb-2';
            const msg = document.createElement('p');
            msg.className = 'text-sm mt-2';

            disableBtn.addEventListener('click', async () => {
                msg.textContent = '';
                disableBtn.disabled = true;
                const code = codeInput.value.trim();
                if (!/^\d{6}$/.test(code)) {
                     msg.textContent = translate('Enter a valid 6-digit code.', 'Geben Sie einen gültigen 6-stelligen Code ein.', 'Entrez un code valide à 6 chiffres.');
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
                    msg.textContent = translate('2FA disabled!', '2FA deaktiviert!', '2FA désactivée !');
                    msg.className = 'text-green-600 text-sm mt-2';
                    twofaStatus.textContent = translate('2FA is not enabled.', '2FA ist nicht aktiviert.', 'La 2FA n\'est pas activée.');
                    twofaButton.textContent = translate('Enable 2FA', '2FA aktivieren', 'Activer la 2FA');
                    user.twofa_enabled = 0;
                    setTimeout(() => { twofaContainer.innerHTML = ''; }, 1500);
                } else {
                    msg.textContent = data2.message || 'Failed to disable 2FA.';
                    msg.className = 'text-red-600 text-sm mt-2';
                }
                disableBtn.disabled = false;
            });

            twofaContainer.appendChild(codeInput);
            twofaContainer.appendChild(disableBtn);
            twofaContainer.appendChild(msg);
        }
    });

    twofaGroup.appendChild(twofaTitle);
    twofaGroup.appendChild(twofaStatus);
    twofaGroup.appendChild(twofaButton);
    twofaGroup.appendChild(twofaContainer);

    // Error and success messages
    const errorMsg = document.createElement('p');
    errorMsg.className = 'text-red-600 text-sm hidden mb-2';
    const successMsg = document.createElement('p');
    successMsg.className = 'text-green-600 text-sm hidden mb-2';

    // Save button
    const saveProfileBtn = document.createElement('button');
    saveProfileBtn.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out';
    saveProfileBtn.textContent = translate('Save Changes', 'Änderungen speichern', 'Enregistrer les modifications');

    form.appendChild(usernameGroup);
    form.appendChild(displayNameGroup);
    form.appendChild(errorMsg);
    form.appendChild(successMsg);
    form.appendChild(saveProfileBtn);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.classList.add('hidden');
        successMsg.classList.add('hidden');
        saveProfileBtn.disabled = true;
        saveProfileBtn.textContent = translate('Saving...', 'Speichern...', 'Enregistrement...');

        // Validation
        const username = usernameField.value.trim().toLowerCase();
        const displayName = displayNameInput.value.trim();

        if (!/^[a-z0-9._-]{3,16}$/.test(username)) {
            errorMsg.textContent = translate('Username must be 3-16 chars, lowercase, and only a-z, 0-9, ., _, -', 'Benutzername muss 3-16 Zeichen lang sein, Kleinbuchstaben und nur a-z, 0-9, ., _, - enthalten', 'Le nom d\'utilisateur doit comporter de 3 à 16 caractères, être en minuscules et ne contenir que a-z, 0-9, ., _, -');
            errorMsg.classList.remove('hidden');
            saveProfileBtn.disabled = false;
            saveProfileBtn.textContent = translate('Save Changes', 'Änderungen speichern', 'Enregistrer les modifications');
            return;
        }
        if (displayName.length < 1 || displayName.length > 32 || /<|>/.test(displayName)) {
            errorMsg.textContent = translate('Display name must be 1-32 characters and not contain < or >', 'Anzeigename muss 1-32 Zeichen lang sein und darf keine < oder > enthalten', 'Le nom d\'affichage doit comporter de 1 à 32 caractères et ne pas contenir < ou >');
            errorMsg.classList.remove('hidden');
            saveProfileBtn.disabled = false;
            saveProfileBtn.textContent = translate('Save Changes', 'Änderungen speichern', 'Enregistrer les modifications');
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
                successMsg.textContent = translate('Profile updated!', 'Profil aktualisiert!', 'Profil mis à jour !');
                successMsg.classList.remove('hidden');
            } else {
                errorMsg.textContent = data.message || translate('Failed to update profile.', 'Profil konnte nicht aktualisiert werden.', 'Échec de la mise à jour du profil.');
                errorMsg.classList.remove('hidden');
            }
        } catch {
            errorMsg.textContent = translate('Unexpected error. Please try again.', 'Unerwarteter Fehler. Bitte versuchen Sie es erneut.', 'Erreur inattendue. Veuillez réessayer.');
            errorMsg.classList.remove('hidden');
        } finally {
            saveProfileBtn.disabled = false;
            saveProfileBtn.textContent = translate('Save Changes', 'Änderungen speichern', 'Enregistrer les modifications');
        }
    });

    settingsWrapper.appendChild(settingsTitle);
    settingsWrapper.appendChild(avatarSection);
    settingsWrapper.appendChild(form);
    settingsWrapper.appendChild(twofaGroup);
    container.appendChild(settingsWrapper);
}
