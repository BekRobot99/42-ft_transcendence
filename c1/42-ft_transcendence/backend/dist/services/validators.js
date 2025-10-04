"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidAlias = exports.ValidTournamentName = exports.validateDisplayName = exports.validatePassword = exports.validateUsername = void 0;
// username validation (alphanumeric, dot, underscore, hyphen)
const validateUsername = (username) => {
    if (typeof username !== 'string')
        return false;
    return /^[a-z0-9._-]{3,16}$/.test(username);
};
exports.validateUsername = validateUsername;
// password validation (min 10 chars, 1 uppercase, 1 lowercase, 1 number)
const validatePassword = (password) => {
    if (typeof password !== 'string')
        return false;
    return password.length >= 10 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password);
};
exports.validatePassword = validatePassword;
// Display name validation (letters, numbers, spaces, _-. max 32 chars, no HTML)
const validateDisplayName = (name) => {
    return typeof name === 'string'
        && name.length >= 1
        && name.length <= 32
        && /^[a-zA-Z0-9 _.\-]+$/.test(name); // Only allow safe characters
};
exports.validateDisplayName = validateDisplayName;
// tournament name validation (3-32 chars, no HTML tags)
const ValidTournamentName = (name) => {
    return typeof name === 'string'
        && name.length >= 3
        && name.length <= 32
        && /^[a-zA-Z0-9 _.\-]+$/.test(name); // Only allow safe characters
};
exports.ValidTournamentName = ValidTournamentName;
// Alias validation (letters, numbers, spaces, _-. max 16 chars, no HTML)
const ValidAlias = (alias) => {
    return typeof alias === 'string'
        && alias.length >= 3
        && alias.length <= 16
        && /^[a-zA-Z0-9 _.\-]+$/.test(alias); // Only allow safe characters
};
exports.ValidAlias = ValidAlias;
