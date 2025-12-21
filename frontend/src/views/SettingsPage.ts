import { translate } from "../languageService.js";

export async function renderSettingsPage(container: HTMLElement): Promise<void> {
    container.innerHTML = '';
    const settingsPageContainer = document.getElementById('page-content');
    if (settingsPageContainer) {
        settingsPageContainer.classList.add('settings-horizontal');
    }

    // Fetch current user info
    let user;
    try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        user = data.user;
    } catch {
        const errorWrapper = document.createElement('div');
        errorWrapper.className = 'autumn-container';
        errorWrapper.innerHTML = `<p style="color: #dc2626; font-family: Georgia, serif;">${translate('Failed to load user info.', 'Benutzerinformationen konnten nicht geladen werden.', 'Échec du chargement des informations utilisateur.')}</p>`;
        container.appendChild(errorWrapper);
        return;
    }

    const settingsWrapper = document.createElement('div');
    settingsWrapper.className = 'autumn-container';
    settingsWrapper.style.maxWidth = '600px';

    const settingsTitle = document.createElement('h2');
    settingsTitle.className = 'autumn-title';
    settingsTitle.style.marginBottom = '2rem';
    settingsTitle.textContent = translate('Settings', 'Einstellungen', 'Paramètres');

    // --- Avatar Section ---
    const avatarSection = document.createElement('div');
    avatarSection.className = 'autumn-glass';
    avatarSection.style.padding = '1.5rem';
    avatarSection.style.marginBottom = '1.5rem';
    avatarSection.style.textAlign = 'center';

    const avatarTitle = document.createElement('h3');
    avatarTitle.style.color = 'var(--autumn-secondary)';
    avatarTitle.style.fontFamily = 'Georgia, serif';
    avatarTitle.style.fontWeight = '600';
    avatarTitle.style.marginBottom = '1rem';
    avatarTitle.textContent = translate('Profile Picture', 'Profilbild', 'Photo de profil');

    // fixed size container
    const avatarContainer = document.createElement('div');
    avatarContainer.style.width = '120px';
    avatarContainer.style.height = '120px';
    avatarContainer.style.margin = '0 auto 1rem';
    avatarContainer.style.position = 'relative';

    const avatarPreview = document.createElement('div');
    avatarPreview.id = 'avatar-preview';
    avatarPreview.style.width = '120px';
    avatarPreview.style.height = '120px';
    avatarPreview.style.borderRadius = '50%';
    avatarPreview.style.background = 'linear-gradient(135deg, var(--autumn-primary), var(--autumn-secondary))';
    avatarPreview.style.display = 'flex';
    avatarPreview.style.alignItems = 'center';
    avatarPreview.style.justifyContent = 'center';
    avatarPreview.style.fontSize = '3rem';
    avatarPreview.style.fontWeight = 'bold';
    avatarPreview.style.color = 'white';
    avatarPreview.style.fontFamily = 'Georgia, serif';
    avatarPreview.style.boxShadow = '0 8px 24px rgba(217, 119, 6, 0.3)';
    avatarPreview.textContent = (user.display_name || user.username).charAt(0).toUpperCase();

    avatarContainer.appendChild(avatarPreview);

    const avatarButtonsContainer = document.createElement('div');
    avatarButtonsContainer.style.display = 'flex';
    avatarButtonsContainer.style.justifyContent = 'center';
    avatarButtonsContainer.style.gap = '0.75rem';
    avatarButtonsContainer.style.flexWrap = 'wrap';

    const avatarUploadLabel = document.createElement('label');
    avatarUploadLabel.htmlFor = 'avatar-input';
    avatarUploadLabel.className = 'autumn-button-small';
    avatarUploadLabel.style.cursor = 'pointer';
    avatarUploadLabel.textContent = translate('Change Avatar', 'Ändern', 'Changer');

    const avatarFileInput = document.createElement('input');
    avatarFileInput.type = 'file';
    avatarFileInput.id = 'avatar-input';
    avatarFileInput.accept = 'image/png, image/jpeg';
    avatarFileInput.style.display = 'none';

    const deleteAvatarBtn = document.createElement('button');
    deleteAvatarBtn.id = 'delete-avatar-btn';
    deleteAvatarBtn.className = 'autumn-button-small delete';
    deleteAvatarBtn.textContent = translate('Delete', 'Löschen', 'Supprimer');
    deleteAvatarBtn.style.display = user.avatar_path ? 'inline-flex' : 'none';

    const avatarErrorMsg = document.createElement('p');
    avatarErrorMsg.style.color = '#dc2626';
    avatarErrorMsg.style.fontSize = '0.875rem';
    avatarErrorMsg.style.marginTop = '0.5rem';
    avatarErrorMsg.style.fontFamily = 'Georgia, serif';
    avatarErrorMsg.style.display = 'none';

    avatarSection.appendChild(avatarTitle);
    avatarSection.appendChild(avatarContainer);
    avatarButtonsContainer.appendChild(avatarUploadLabel);
    avatarButtonsContainer.appendChild(avatarFileInput);
    avatarButtonsContainer.appendChild(deleteAvatarBtn);
    avatarSection.appendChild(avatarButtonsContainer);
    avatarSection.appendChild(avatarErrorMsg);

    avatarFileInput.addEventListener('change', async () => {
        avatarErrorMsg.style.display = 'none';
        const file = avatarFileInput.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB
            avatarErrorMsg.textContent = translate('File is too large (max 5MB).', 'Datei ist zu groß (max. 5MB).', 'Le fichier est trop volumineux (max 5 Mo).');
            avatarErrorMsg.style.display = 'block';
            avatarFileInput.value = '';
            return;
        }

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

            avatarPreview.textContent = (user.display_name || user.username).charAt(0).toUpperCase();
            user.avatar_path = data.avatarUrl;
            deleteAvatarBtn.style.display = 'inline-flex';
        } catch (error: any) {
            avatarErrorMsg.textContent = error.message;
            avatarErrorMsg.style.display = 'block';
        } finally {
            avatarFileInput.value = '';
        }
    });

    deleteAvatarBtn.addEventListener('click', async () => {
        if (!confirm(translate('Are you sure you want to delete your avatar?', 'Sind Sie sicher, dass Sie Ihren Avatar löschen möchten?', 'Êtes-vous sûr de vouloir supprimer votre avatar ?'))) {
            return;
        }
        avatarErrorMsg.style.display = 'none';
        try {
            const res = await fetch('/api/me/avatar', {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to delete avatar.');
            }
            avatarPreview.textContent = (user.display_name || user.username).charAt(0).toUpperCase();
            user.avatar_path = null;
            deleteAvatarBtn.style.display = 'none';
        } catch (error: any) {
            avatarErrorMsg.textContent = error.message;
            avatarErrorMsg.style.display = 'block';
        }
    });

    // Form for user profile data
    const profileForm = document.createElement('div');
    profileForm.className = 'autumn-glass';
    profileForm.style.padding = '1.5rem';

    const profileTitle = document.createElement('h3');
    profileTitle.style.color = 'var(--autumn-secondary)';
    profileTitle.style.fontFamily = 'Georgia, serif';
    profileTitle.style.fontWeight = '600';
    profileTitle.style.marginBottom = '1rem';
    profileTitle.textContent = translate('Profile Information', 'Profilinformationen', 'Informations de profil');

    const form = document.createElement('form');

    // Username
    const usernameGroup = document.createElement('div');
    usernameGroup.style.marginBottom = '1rem';
    const usernameLabel = document.createElement('label');
    usernameLabel.className = 'autumn-label';
    usernameLabel.textContent = translate('Username', 'Benutzername', 'Nom d\'utilisateur');
    const usernameField = document.createElement('input');
    usernameField.type = 'text';
    usernameField.value = user.username;
    usernameField.maxLength = 16;
    usernameField.className = 'autumn-input';
    usernameField.autocomplete = 'off';
    usernameGroup.appendChild(usernameLabel);
    usernameGroup.appendChild(usernameField);

    // Display name
    const displayNameGroup = document.createElement('div');
    displayNameGroup.style.marginBottom = '1rem';
    const displayNameLabel = document.createElement('label');
    displayNameLabel.className = 'autumn-label';
    displayNameLabel.textContent = translate('Display Name', 'Anzeigename', 'Nom d\'affichage');
    const displayNameInput = document.createElement('input');
    displayNameInput.type = 'text';
    displayNameInput.value = user.display_name || '';
    displayNameInput.maxLength = 32;
    displayNameInput.className = 'autumn-input';
    displayNameInput.autocomplete = 'off';
    displayNameGroup.appendChild(displayNameLabel);
    displayNameGroup.appendChild(displayNameInput);

    // error and success messages
    const errorMsg = document.createElement('p');
    errorMsg.style.color = '#dc2626';
    errorMsg.style.fontSize = '0.875rem';
    errorMsg.style.fontFamily = 'Georgia, serif';
    errorMsg.style.marginBottom = '0.5rem';
    errorMsg.style.display = 'none';
    const successMsg = document.createElement('p');
    successMsg.style.color = 'var(--autumn-secondary)';
    successMsg.style.fontSize = '0.875rem';
    successMsg.style.fontFamily = 'Georgia, serif';
    successMsg.style.marginBottom = '0.5rem';
    successMsg.style.display = 'none';

    // save button
    const saveProfileBtn = document.createElement('button');
    saveProfileBtn.className = 'autumn-button-light';
    saveProfileBtn.style.width = '100%';
    saveProfileBtn.textContent = translate('Save Changes', 'Änderungen speichern', 'Enregistrer les modifications');

    form.appendChild(usernameGroup);
    form.appendChild(displayNameGroup);
    form.appendChild(errorMsg);
    form.appendChild(successMsg);
    form.appendChild(saveProfileBtn);

    profileForm.appendChild(profileTitle);
    profileForm.appendChild(form);

    // 2FA Section
    const twofaGroup = document.createElement('div');
    twofaGroup.className = 'autumn-glass';
    twofaGroup.style.padding = '1.5rem';

    const twofaTitle = document.createElement('h3');
    twofaTitle.style.color = 'var(--autumn-secondary)';
    twofaTitle.style.fontFamily = 'Georgia, serif';
    twofaTitle.style.fontWeight = '600';
    twofaTitle.style.marginBottom = '1rem';
    twofaTitle.textContent = translate('Two-Factor Authentication', '2FA', 'Authentification 2FA');

    const twofaStatus = document.createElement('p');
    twofaStatus.style.marginBottom = '1rem';
    twofaStatus.style.fontFamily = 'Georgia, serif';
    twofaStatus.textContent = user.twofa_enabled ? translate('2FA is enabled.', '2FA ist aktiviert.', 'La 2FA est activée.') : translate('2FA is not enabled.', '2FA ist nicht aktiviert.', 'La 2FA n\'est pas activée.');

    const twofaButton = document.createElement('button');
    twofaButton.type = 'button';
    twofaButton.className = 'autumn-button-light twofa';
    twofaButton.textContent = user.twofa_enabled ? translate('Disable 2FA', '2FA deaktivieren', 'Désactiver') : translate('Enable 2FA', '2FA aktivieren', 'Activer');

    const twofaContainer = document.createElement('div');
    twofaContainer.style.marginTop = '1rem';

    // 2FA toggle logic with QR code
    twofaButton.addEventListener('click', async () => {
        twofaContainer.innerHTML = '';
        
        const msg = document.createElement('p');
        msg.style.fontSize = '0.875rem';
        msg.style.fontFamily = 'Georgia, serif';
        msg.style.marginTop = '0.5rem';

        // If enabling 2FA, first get QR code from server
        if (!user.twofa_enabled) {
            msg.textContent = translate('Loading QR code...', 'QR-Code wird geladen...', 'Chargement du QR code...');
            msg.style.color = 'var(--autumn-secondary)';
            twofaContainer.appendChild(msg);

            try {
                const setupRes = await fetch('/api/2fa/setup', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
                const setupData = await setupRes.json();
                
                if (!setupRes.ok) {
                    msg.textContent = setupData.message || 'Failed to setup 2FA';
                    msg.style.color = '#dc2626';
                    return;
                }

                twofaContainer.innerHTML = '';

                // Show QR code image
                const qrImg = document.createElement('img');
                qrImg.src = setupData.qr;
                qrImg.alt = 'QR Code';
                qrImg.style.display = 'block';
                qrImg.style.margin = '0 auto 1rem';
                qrImg.style.maxWidth = '200px';
                qrImg.style.borderRadius = '8px';

                const instructions = document.createElement('p');
                instructions.style.fontSize = '0.875rem';
                instructions.style.fontFamily = 'Georgia, serif';
                instructions.style.marginBottom = '1rem';
                instructions.style.textAlign = 'center';
                instructions.textContent = translate(
                    'Scan with Google Authenticator, then enter code below',
                    'Mit Google Authenticator scannen, dann Code eingeben',
                    'Scanner avec Google Authenticator, puis entrer le code'
                );

                twofaContainer.appendChild(qrImg);
                twofaContainer.appendChild(instructions);
            } catch {
                msg.textContent = translate('Error loading QR code', 'Fehler beim Laden des QR-Codes', 'Erreur de chargement du QR code');
                msg.style.color = '#dc2626';
                return;
            }
        }

        // Code input field
        const codeInput = document.createElement('input');
        codeInput.type = 'text';
        codeInput.className = 'autumn-input';
        codeInput.style.marginBottom = '0.5rem';
        codeInput.placeholder = translate('Enter 6-digit code', '6-stelliger Code', 'Code à 6 chiffres');
        codeInput.maxLength = 6;

        const actionBtn = document.createElement('button');
        actionBtn.className = 'autumn-button-light twofa';
        actionBtn.textContent = user.twofa_enabled ? translate('Disable', 'Deaktivieren', 'Désactiver') : translate('Enable', 'Aktivieren', 'Activer');

        const resultMsg = document.createElement('p');
        resultMsg.style.fontSize = '0.875rem';
        resultMsg.style.fontFamily = 'Georgia, serif';
        resultMsg.style.marginTop = '0.5rem';

        actionBtn.onclick = async () => {
            const code = codeInput.value.trim();
            if (!/^\d{6}$/.test(code)) {
                resultMsg.textContent = translate('Enter valid 6-digit code', 'Gültigen 6-stelligen Code eingeben', 'Code 6 chiffres valide');
                resultMsg.style.color = '#dc2626';
                return;
            }
            
            const endpoint = user.twofa_enabled ? '/api/2fa/disable' : '/api/2fa/enable';
            const res = await fetch(endpoint, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });
            const data = await res.json();
            
            if (res.ok) {
                resultMsg.textContent = user.twofa_enabled ? translate('2FA disabled!', '2FA deaktiviert!', '2FA désactivée !') : translate('2FA enabled!', '2FA aktiviert!', '2FA activée !');
                resultMsg.style.color = 'var(--autumn-secondary)';
                user.twofa_enabled = !user.twofa_enabled;
                twofaStatus.textContent = user.twofa_enabled ? translate('2FA is enabled.', '2FA ist aktiviert.', 'La 2FA est activée.') : translate('2FA is not enabled.', '2FA ist nicht aktiviert.', 'La 2FA n\'est pas activée.');
                twofaButton.textContent = user.twofa_enabled ? translate('Disable 2FA', '2FA deaktivieren', 'Désactiver') : translate('Enable 2FA', '2FA aktivieren', 'Activer');
                setTimeout(() => { twofaContainer.innerHTML = ''; }, 1500);
            } else {
                resultMsg.textContent = data.message || 'Failed';
                resultMsg.style.color = '#dc2626';
            }
        };

        twofaContainer.appendChild(codeInput);
        twofaContainer.appendChild(actionBtn);
        twofaContainer.appendChild(resultMsg);
    });

    twofaGroup.appendChild(twofaTitle);
    twofaGroup.appendChild(twofaStatus);
    twofaGroup.appendChild(twofaButton);
    twofaGroup.appendChild(twofaContainer);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';
        successMsg.style.display = 'none';
        saveProfileBtn.disabled = true;
        saveProfileBtn.textContent = translate('Saving...', 'Speichern...', 'Enregistrement...');

        // Validation
        const username = usernameField.value.trim().toLowerCase();
        const displayName = displayNameInput.value.trim();

        if (!/^[a-z0-9._-]{3,16}$/.test(username)) {
            errorMsg.textContent = translate('Username must be 3-16 chars, lowercase letters/numbers only', 'Benutzername: 3-16 Zeichen, nur Kleinbuchstaben/Zahlen', 'Nom d\'utilisateur: 3-16 caractères, lettres minuscules/chiffres uniquement');
            errorMsg.style.display = 'block';
            saveProfileBtn.disabled = false;
            saveProfileBtn.textContent = translate('Save Changes', 'Änderungen speichern', 'Enregistrer');
            return;
        }
        if (displayName.length < 1 || displayName.length > 32) {
            errorMsg.textContent = translate('Display name must be 1-32 characters', 'Anzeigename muss 1-32 Zeichen lang sein', 'Le nom d\'affichage doit comporter de 1 à 32 caractères');
            errorMsg.style.display = 'block';
            saveProfileBtn.disabled = false;
            saveProfileBtn.textContent = translate('Save Changes', 'Änderungen speichern', 'Enregistrer');
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
                successMsg.style.display = 'block';
                // update avatar
                avatarPreview.textContent = displayName.charAt(0).toUpperCase();
            } else {
                errorMsg.textContent = data.message || translate('Failed to update profile.', 'Profil konnte nicht aktualisiert werden.', 'Échec de la mise à jour du profil.');
                errorMsg.style.display = 'block';
            }
        } catch {
            errorMsg.textContent = translate('Unexpected error. Please try again.', 'Unerwarteter Fehler. Bitte versuchen Sie es erneut.', 'Erreur inattendue. Veuillez réessayer.');
            errorMsg.style.display = 'block';
        } finally {
            saveProfileBtn.disabled = false;
            saveProfileBtn.textContent = translate('Save Changes', 'Änderungen speichern', 'Enregistrer');
        }
    });

    // 2FA
    const sideBySideWrapper = document.createElement('div');
    sideBySideWrapper.className = 'sideBySideWrapper';
    sideBySideWrapper.style.display = 'grid';
    sideBySideWrapper.style.gridTemplateColumns = '1fr 1fr';
    sideBySideWrapper.style.gap = '1.5rem';
    sideBySideWrapper.style.marginBottom = '1.5rem';

    sideBySideWrapper.appendChild(profileForm);
    sideBySideWrapper.appendChild(twofaGroup);

    settingsWrapper.appendChild(settingsTitle);
    settingsWrapper.appendChild(avatarSection);
    settingsWrapper.appendChild(sideBySideWrapper);
    container.appendChild(settingsWrapper);
}
