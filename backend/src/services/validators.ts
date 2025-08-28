export const validateUsername = (username: string): boolean => {
    return /^[a-z0-9._-]{3,16}$/.test(username);
};

export const validatePassword = (password: string): boolean => {
    return password.length >= 10 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password);
};

export const validateDisplayName = (name: string): boolean => {
    return typeof name === 'string' && name.length >= 1 && name.length <= 32 && !/<|>/.test(name);
};