class App {
  private googleBtn: HTMLButtonElement | null;

  constructor() {
    this.googleBtn = document.getElementById("google-signin-btn") as HTMLButtonElement;
  }

  public init(): void {
    if (this.googleBtn) {
      this.googleBtn.addEventListener("click", (event) => this.handleGoogleSignIn(event));
    }
  }

  private handleGoogleSignIn(event: Event): void {
    event.preventDefault();
    console.log("Google Sign-In button clicked!");
    // TODO: Implement Google OAuth logic
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init();
});
