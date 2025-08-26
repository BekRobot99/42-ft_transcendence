import { authenticator } from 'otplib';
import qrcode from 'qrcode';

export function createMfaSecret(username: string) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(username, 'ft_transcendence', secret);
    return { secret, otpauth };
}

export function validateMfaToken(secret: string, token: string) {
    return authenticator.check(token, secret);
}

export async function createMfaQrCode(otpauth: string): Promise<string> {
    return qrcode.toDataURL(otpauth);
}
