export declare class SignUpForm {
    private formContainer;
    private usernameField;
    private passwordField;
    private confirmPasswordField;
    private validationInfo;
    private clientErrorMessage;
    private serverErrorMessage;
    private successMessage;
    private submitButton;
    private app;
    private readonly checkIconPath;
    private readonly crossIconPath;
    constructor(app: any);
    /** Build all form elements */
    private buildForm;
    /** Add event listeners */
    private addFieldListeners;
    /** Clear backend messages */
    private resetServerMessages;
    /** Handle register submit */
    private onRegister;
    /** Update validation icons */
    private updateValidation;
    render(): HTMLElement;
}
//# sourceMappingURL=SingUpForm.d.ts.map