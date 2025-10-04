"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.encryptPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const saltStrength = 10;
const encryptPassword = async (password) => {
    return bcrypt_1.default.hash(password, saltStrength);
};
exports.encryptPassword = encryptPassword;
const verifyPassword = async (password, hash) => {
    return bcrypt_1.default.compare(password, hash);
};
exports.verifyPassword = verifyPassword;
