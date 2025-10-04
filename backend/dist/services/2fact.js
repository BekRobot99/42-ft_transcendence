"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMfaSecret = createMfaSecret;
exports.validateMfaToken = validateMfaToken;
exports.createMfaQrCode = createMfaQrCode;
const otplib_1 = require("otplib");
const qrcode_1 = __importDefault(require("qrcode"));
function createMfaSecret(username) {
    const secret = otplib_1.authenticator.generateSecret();
    const otpauth = otplib_1.authenticator.keyuri(username, 'ft_transcendence', secret);
    return { secret, otpauth };
}
function validateMfaToken(secret, token) {
    return otplib_1.authenticator.check(token, secret);
}
async function createMfaQrCode(otpauth) {
    return qrcode_1.default.toDataURL(otpauth);
}
