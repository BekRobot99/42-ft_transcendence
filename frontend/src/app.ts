import { SignUpForm } from './ui/SingUpForm';
class App {
    private pageContentElement: HTMLElement | null;
    private initialPageContentHTML: string = '';

    // To keep track of elements for re-attaching listeners when rendering the home view
    private googleSignInButton: HTMLElement | null = null;
    private signInButton: HTMLElement | null = null;
    private registerButton: HTMLElement | null = null;
    
    
    constructor() {
        this.pageContentElement = document.getElementById('page-content');

        if (this.pageContentElement) {
            // Store the initial HTML content of the page
            this.initialPageContentHTML = this.pageContentElement.innerHTML;
        }
        this.init();
    }

    private init(): void {
        // Listen for browser navigation (back/forward buttons)
        window.addEventListener('popstate', this.handlePopState.bind(this));
        // Render the initial view based on the current URL path
        // Normalize '/index.html' or similar to '/' for consistent routing
        const initialPath = window.location.pathname === '/index.html' ? '/' : window.location.pathname;
        this.renderView(initialPath);
    }

    private navigateTo(path: string, event?: Event): void {
        if (event) {
            event.preventDefault();
        }
        // Only push state if the path is different to avoid duplicate history entries
        if (window.location.pathname !== path) {
            history.pushState({ path }, '', path);
        }
        this.renderView(path);
    }

    private handlePopState(event: PopStateEvent): void {
        // When the user navigates using back/forward buttons
        // Default to home ('/') if no state path is found, or use current pathname
        const path = event.state?.path || (window.location.pathname === '/index.html' ? '/' : window.location.pathname);
        this.renderView(path);
    }

    private renderView(path: string): void {
        if (!this.pageContentElement) return;

        this.pageContentElement.innerHTML = ''; // Clear existing content

        if (path === '/register') {
            const registerForm = new SignUpForm();
            this.pageContentElement.appendChild(registerForm.render());

            const backButton = document.createElement('button');
            backButton.textContent = '‹ Back to Home';
            backButton.className = 'block w-full text-center mt-4 text-sm text-blue-600 hover:text-blue-800 hover:underline';
            backButton.addEventListener('click', () => this.navigateTo('/'));
            this.pageContentElement.appendChild(backButton);

        } else if (path === '/signin') {
            // Placeholder for sign-in view
            const signInContainer = document.createElement('div');
            const signInTitle = document.createElement('h2');
            signInTitle.className = 'text-2xl font-bold text-gray-800 text-center mb-6';
            signInTitle.textContent = 'Sign In';
            
            const signInText = document.createElement('p');
            signInText.className = 'text-center text-gray-600';
            signInText.textContent = 'Sign-in form will be implemented here.';

            signInContainer.appendChild(signInTitle);
            signInContainer.appendChild(signInText);
            this.pageContentElement.appendChild(signInContainer);

            const backButton = document.createElement('button');
            backButton.textContent = '‹ Back to Home';
            backButton.className = 'block w-full text-center mt-4 text-sm text-blue-600 hover:text-blue-800 hover:underline';
            backButton.addEventListener('click', () => this.navigateTo('/'));
            this.pageContentElement.appendChild(backButton);

        } else { // Default to home view (initial content from index.html)
            this.pageContentElement.innerHTML = this.initialPageContentHTML;
            // Re-attach event listeners for the home view buttons as innerHTML removes them
            this.attachHomeViewListeners();
        }
    }

    private attachHomeViewListeners(): void {
        this.googleSignInButton = document.getElementById('googleSignIn');
        this.signInButton = document.getElementById('signInButton');
        this.registerButton = document.getElementById('registerButton');

        if (this.googleSignInButton) {
            this.googleSignInButton.addEventListener('click', this.handleGoogleSignIn.bind(this));
        }
        if (this.signInButton) {
           this.signInButton.addEventListener('click', (e) => this.navigateTo('/signin', e));
        }
        if (this.registerButton) {
          this.registerButton.addEventListener('click', (e) => this.navigateTo('/register', e));
    }
    }

    private handleGoogleSignIn(event: Event): void {
        event.preventDefault();
        console.log('Google Sign In clicked - functionality to be implemented');
    }
   // init app when the DOM is fully loaded 
}


