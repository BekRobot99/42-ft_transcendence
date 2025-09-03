// username validation (alphanumeric, dot, underscore, hyphen)
export const validateUsername = (username: string): boolean => {
    if (typeof username !== 'string') return false;
    return /^[a-z0-9._-]{3,16}$/.test(username);
};

// password validation (min 10 chars, 1 uppercase, 1 lowercase, 1 number)
export const validatePassword = (password: string): boolean => {
    if (typeof password !== 'string') return false;
    return password.length >= 10 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password);
};

// Display name validation (letters, numbers, spaces, _-. max 32 chars, no HTML)
export const validateDisplayName = (name: string): boolean => {
   return typeof name === 'string'
        && name.length >= 1
        && name.length <= 32
        && /^[a-zA-Z0-9 _.\-]+$/.test(name); // Only allow safe characters
};

// tournament name validation (3-32 chars, no HTML tags)
export const ValidTournamentName = (name: string): boolean => {
    return typeof name === 'string'
        && name.length >= 3
        && name.length <= 32
        && /^[a-zA-Z0-9 _.\-]+$/.test(name); // Only allow safe characters
};

// Alias validation (letters, numbers, spaces, _-. max 16 chars, no HTML)
export const ValidAlias = (alias: string): boolean => {
    return typeof alias === 'string'
        && alias.length >= 3
        && alias.length <= 16
        && /^[a-zA-Z0-9 _.\-]+$/.test(alias); // Only allow safe characters
};