import bcrypt from 'bcrypt';

const saltStrength = 10;

export const encryptPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, saltStrength);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

