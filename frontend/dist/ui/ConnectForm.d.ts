export declare class ConnectForm {
    private formContainer;
    private usernameField;
    private passwordField;
    private clientErrorMessage;
    private serverErrorMessage;
    private successMessage;
    private submitButton;
    private mfaInputWrapper;
    private mfaInput;
    private app;
    constructor(app: any);
    private buildForm;
    private addFieldListeners;
    private resetServerMessages;
    private onSubmit;
    render(): HTMLElement;
}
//# sourceMappingURL=ConnectForm.d.ts.map