export interface AuthRequestBody {
    username?: string;
    password?: string;
    mfaCode?: string;
}

export interface IGoogleAuthBody {
    code: string;
}

export interface UserUpdateRequestBody {
    username?: string;
    displayName?: string;
}
