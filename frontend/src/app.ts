class App {
    private signInButton: HTMLElement | null;
    private registerButton: HTMLElement | null;
    private googleSignInButton: HTMLElement | null;
    
    
    constructor() {
        this.googleSignInButton = document.getElementById('googleSignIn');
         this.signInButton = document.getElementById('signInButton');
        this.registerButton = document.getElementById('registerButton');
        this.init();
    }

    private init(): void {
        if (this.googleSignInButton) {
            this.googleSignInButton.addEventListener('click', this.handleGoogleSignIn.bind(this));
        }
        if (this.signInButton) {
            this.signInButton.addEventListener('click', this.handleSignIn.bind(this));
        }
        if (this.registerButton) {
            this.registerButton.addEventListener('click', this.handleRegister.bind(this));
    }
    }
     private handleSignIn(event: Event): void {
        event.preventDefault();
        console.log('Sign In clicked - Show sign in form');
        // TODO: Show a modal or replace content with sign in form
    }

     private handleRegister(event: Event): void {
        event.preventDefault();
        console.log('Register clicked - Show registration form');
         // TODO: Implement Google OAuth logic
    }

    private handleGoogleSignIn(event: Event): void {
        event.preventDefault();
        console.log('Google Sign In clicked - functionality to be implemented');
    }
   
}


