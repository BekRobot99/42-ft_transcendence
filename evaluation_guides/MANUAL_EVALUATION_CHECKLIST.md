# ft_transcendence - Manual Evaluation Checklist

**Version:** 18.0 | **Last Updated:** Based on transc.pdf, subject.md, and eval.md

This is a comprehensive manual checklist for evaluating the ft_transcendence project. All requirements are extracted from the three official documents. Evaluate each item by marking [ ] as completed.

---

## Part 1: Preliminary Setup & General Instructions

### Repository & Deployment
- [ ] Git repository is clean - cloned in an empty folder (`git clone`)
- [ ] No malicious aliases or code tricks present
- [ ] `.env` file contains all credentials/API keys (NOT committed to Git)
- [ ] `docker-compose.yaml` (or equivalent) exists at root
- [ ] Docker builds without errors: `docker-compose up --build`
- [ ] Docker launches successfully with single command line
- [ ] Website is accessible after Docker launch

### Code Quality & Libraries
- [ ] No libraries/tools provide an "immediate complete solution" for entire features
- [ ] All direct instructions about third-party libraries (can/must/can't) are followed
- [ ] Use of small libraries for simple subcomponents is justified
- [ ] Team can explain ANY non-explicitly approved library usage
- [ ] No segfaults or unexpected terminations during defense
- [ ] No unhandled errors or warnings in browser console

### Memory & Performance
- [ ] No memory leaks detected (use: `leaks`, `valgrind`, or `e_fence`)
- [ ] Application runs without crashes on unexpected usage
- [ ] Performance is acceptable (no hangs, freezes, or delays)

---

## Part 2: Mandatory Part - Technical Requirements

### Technology Stack (Default/Mandatory Constraints)
- [ ] **Frontend:** TypeScript is base code
- [ ] **Backend:** Pure PHP (unless Framework/Web module overrides)
- [ ] **Database:** SQLite (if database used)
- [ ] **Containerization:** Docker with single-command launch
- [ ] **Architecture:** Single Page Application (SPA)
- [ ] **Browser Compatibility:** Latest stable Firefox version
- [ ] Back/Forward browser buttons work correctly in SPA

### Website Accessibility & Registration
- [ ] Website is fully available and accessible
- [ ] Registration/Subscribe system works
- [ ] Users can register with username/credentials
- [ ] Registered users can log in
- [ ] Login persists session correctly
- [ ] No 500 errors during normal usage

### Security (MANDATORY - Stop if Missing)
- [ ] **HTTPS/TLS:** Website uses HTTPS/TLS encryption
- [ ] **WebSocket:** WebSocket connections use WSS (secure)
- [ ] **Password Hashing:** Database passwords are hashed (never plaintext)
- [ ] **SQL Injection:** Server-side protection against SQL injection
- [ ] **XSS Protection:** Server-side sanitization/validation against XSS
- [ ] **Form Validation:** Server-side validation for all forms and user input
- [ ] **Input Sanitization:** All user inputs are sanitized
- [ ] **SSL Certificates:** Valid certificates (not self-signed or expired)
- [ ] **Credentials:** No API keys/secrets committed to Git
- [ ] **Environment Variables:** Sensitive data in `.env` file only

### The Game - Pong (Core Mandatory)
- [ ] **Game is playable:** Live Pong game works locally
- [ ] **Local 2-Player:** Two players can play on same keyboard
- [ ] **Keyboard Control:** Each player uses specific keyboard section
- [ ] **Paddle Speed:** All players have identical paddle speed
- [ ] **AI Speed:** If AI module included, AI moves at same speed as players
- [ ] **Pong Rules:** Game adheres to original Pong rules (paddle, ball, scoring)
- [ ] **Game Controls:** Controls are intuitive or clearly explained
- [ ] **Game End:** End-game state handled (screen displays result or proper exit)
- [ ] **Real-Time:** Multiplayer gameplay is real-time

### Tournament & Matchmaking System
- [ ] **Tournament System:** Tournament system available
- [ ] **Multiple Players:** Multiple players can participate
- [ ] **Turn-Based:** Players take turns playing against each other
- [ ] **Clear Display:** Shows who is playing whom and order of play
- [ ] **Matchmaking:** System organizes matchmaking of participants
- [ ] **Match Announcements:** System announces the next match

### Registration in Tournament
- [ ] **Alias Input:** Players input alias at tournament start
- [ ] **Alias Reset:** Aliases reset when new tournament begins
- [ ] **No Persistent Accounts:** Default requires only alias input (no account creation)
  - *Can be modified by Standard User Management module*

### Error Handling - Lags & Disconnects
- [ ] **Unexpected Disconnections:** Handled gracefully (no crash)
- [ ] **Lag Handling:** Lags do not cause crashes or unplayable state
- [ ] **Game Stability:** Site/Game does not crash on disconnects
- [ ] *(Optional)* Reconnection features implemented
- [ ] *(Optional)* Pause/resume functionality implemented

---

## Part 3: Modules Evaluation (7 Major Modules Required for 100%)

**Reminder:** 1 Major Module = 2 Minor Modules = 2 points

### Module Selection Record
- [ ] Module 1: _________________________ (Major/Minor)
- [ ] Module 2: _________________________ (Major/Minor)
- [ ] Module 3: _________________________ (Major/Minor)
- [ ] Module 4: _________________________ (Major/Minor)
- [ ] Module 5: _________________________ (Major/Minor)
- [ ] Module 6: _________________________ (Major/Minor)
- [ ] Module 7: _________________________ (Major/Minor)

### Generic Module Evaluation (Apply to Each Module)
For each module selected, evaluate:

#### Module: ______________________
- [ ] Functions properly without issues
- [ ] Team understands how it works
- [ ] Team can explain why this module was chosen
- [ ] No visible errors or bugs
- [ ] Comprehensive explanation provided
- [ ] All technical constraints met
- [ ] Integration with mandatory part is seamless

---

## Part 4: Specific Modules Details

### V.1 Web Module

#### V.1.1 Backend Framework [MAJOR]
- [ ] Uses **Fastify** with **Node.js**
- [ ] Fastify server starts without errors
- [ ] API endpoints respond correctly
- [ ] Request/response handling works
- [ ] WebSocket connections established via Fastify

#### V.1.2 Frontend Framework [MINOR]
- [ ] Uses **Tailwind CSS**
- [ ] TypeScript is used for styling/UI logic
- [ ] UI is responsive and clean
- [ ] CSS compiles without errors
- [ ] No CSS conflicts or broken styling

#### V.1.3 Database Module [MINOR]
- [ ] Uses **SQLite**
- [ ] Database file created and persists
- [ ] Queries execute correctly
- [ ] Data is properly stored and retrieved
- [ ] No database connection errors

#### V.1.4 Blockchain Module [MAJOR]
- [ ] Uses **Avalanche** blockchain
- [ ] **Solidity** smart contracts implemented
- [ ] Tournament scores stored on blockchain
- [ ] Smart contracts deploy successfully
- [ ] (Optional) Uses testnet for development
- [ ] Blockchain integration is tested

---

### V.3 User Management Module

#### V.3.1 Standard User Management [MAJOR]
- [ ] **Registration/Login:** Secure subscribe and login system
- [ ] **Avatars:** Users can upload/set avatars
- [ ] **Friend Lists:** Users can add/remove friends
- [ ] **Online Status:** Shows who is online/offline
- [ ] **Player Stats:** Displays wins/losses statistics
- [ ] **Match History:** Shows history of past matches
- [ ] **User Profiles:** Profiles display all user information

#### V.3.2 Remote Authentication [MAJOR]
- [ ] **OAuth 2.0:** Implemented for external services
- [ ] **OAuth Providers:** At least one provider (Google, GitHub, etc.)
- [ ] **Secure Token Handling:** OAuth tokens handled securely
- [ ] **User Data:** Fetches correct user data from OAuth
- [ ] **Session Management:** OAuth session persists correctly
- [ ] **Fallback:** Fallback to standard login if OAuth fails

---

### V.4 Gameplay & User Experience Module

#### V.4.1 Remote Players [MAJOR]
- [ ] **Two Players, Separate Computers:** Remote players can play together
- [ ] **Real-Time Synchronization:** Ball/paddle sync between players
- [ ] **Lag Handling:** Lag doesn't break gameplay
- [ ] **Disconnect Handling:** Disconnects are handled gracefully
- [ ] **Player Identification:** Clear indication of who is who
- [ ] **Network Communication:** Uses WebSocket or equivalent for real-time

#### V.4.2 Multiplayer (>2 Players) [MAJOR]
- [ ] **Supports >2 Players:** Game works with 3+ players
- [ ] **Game Logic:** Scoring/rules adapt to multiple players
- [ ] **Square Board:** Board layout accommodates multiple paddles
- [ ] **Player Turns:** Clear turn order or simultaneous play
- [ ] **Win Condition:** Clear victory conditions for multiplayer

#### V.4.3 New Game (Non-Pong) [MAJOR]
- [ ] **Second Game Implemented:** Another game besides Pong
- [ ] **Game Rules:** Rules clearly defined and implemented
- [ ] **Game State:** Game state tracked correctly
- [ ] **Match History:** History recorded for the new game
- [ ] **Matchmaking:** Matchmaking system works for new game
- [ ] **UI Integration:** New game accessible from main interface

#### V.4.4 Game Customization [MINOR]
- [ ] **Power-ups:** Implemented and functional (if chosen)
- [ ] **Attacks:** Game attacks work as designed (if chosen)
- [ ] **Different Maps:** Multiple maps available (if chosen)
- [ ] **Customization Menu:** UI for selecting customization options
- [ ] **Balance:** Game remains balanced with customizations

#### V.4.5 Live Chat [MAJOR]
- [ ] **Direct Messages:** Users can send direct messages
- [ ] **Message History:** Chat history is maintained
- [ ] **User Blocking:** Users can block other users
- [ ] **Blocked User Behavior:** Blocked users cannot message or see blocker
- [ ] **Game Invites:** Users can invite others to games via chat
- [ ] **Tournament Notifications:** Chat shows tournament-related notifications
- [ ] **Real-Time Delivery:** Messages deliver in real-time
- [ ] **Online Indicators:** Chat shows user online status

---

### V.5 AI-Algo Module

#### V.5.1 AI Opponent [MAJOR]
- [ ] **AI Implementation:** AI opponent functional
- [ ] **Keyboard Simulation:** AI simulates actual keyboard input
- [ ] **Update Frequency:** AI view/decisions refresh ~once per second
- [ ] **Speed Constraint:** AI moves at same speed as regular players
- [ ] **AI Logic:** AI makes intelligent moves (not random)
- [ ] **A* Prohibition:** A* algorithm is NOT used
- [ ] **Difficulty:** AI provides challenge to players
- [ ] **Play Testing:** AI is tested against human players

#### V.5.2 Dashboards [MINOR]
- [ ] **User Statistics Dashboard:** Visual stats for users
- [ ] **Game Session Dashboard:** Stats for game sessions
- [ ] **Charts/Graphs:** Data visualized in charts or graphs
- [ ] **Real-Time Updates:** Dashboards update in real-time
- [ ] **Data Accuracy:** Statistics are correct and calculated properly
- [ ] **Multiple Views:** Different dashboard views available
- [ ] **Responsive Design:** Dashboards work on all screen sizes

---

### V.6 Cybersecurity Module

#### V.6.1 WAF & Vault [MAJOR]
- [ ] **Web Application Firewall:** ModSecurity or similar WAF implemented
- [ ] **WAF Rules:** Effective security rules configured
- [ ] **Vault Integration:** **HashiCorp Vault** used for secrets
- [ ] **Secret Management:** Sensitive data stored in Vault
- [ ] **Rotation:** Secrets can be rotated
- [ ] **Authentication:** Vault authentication configured
- [ ] **Encryption:** Secrets encrypted in transit and at rest

#### V.6.2 GDPR Compliance [MINOR]
- [ ] **Data Anonymization:** User data can be anonymized
- [ ] **Local Data Storage:** Option to store data locally (not externally)
- [ ] **Account Deletion:** Users can request account deletion
- [ ] **Data Export:** Users can export their data
- [ ] **Privacy Policy:** Privacy policy is documented
- [ ] **Consent:** User consent collected for data usage
- [ ] **Right to Forget:** Data deleted upon request

#### V.6.3 2FA & JWT [MAJOR]
- [ ] **Two-Factor Authentication:** 2FA enabled
- [ ] **2FA Method:** SMS/App/Email 2FA working
- [ ] **Recovery Codes:** Backup codes provided for 2FA
- [ ] **JWT Implementation:** JSON Web Tokens used for sessions
- [ ] **JWT Signing:** JWTs properly signed with secret
- [ ] **JWT Validation:** Tokens validated on server
- [ ] **Token Expiry:** Tokens expire after set time
- [ ] **Token Refresh:** Refresh tokens work correctly

---

### V.7 DevOps Module

#### V.7.1 Infrastructure (ELK Stack) [MAJOR]
- [ ] **Elasticsearch:** Deployed and running
- [ ] **Logstash:** Parses and ships logs
- [ ] **Kibana:** Log visualization/dashboard functional
- [ ] **Log Collection:** All application logs collected
- [ ] **Log Storage:** Logs stored in Elasticsearch
- [ ] **Log Queries:** Can search/filter logs in Kibana
- [ ] **Log Retention:** Log retention policy configured
- [ ] **Monitoring:** ELK stack monitors application health

#### V.7.2 Monitoring [MINOR]
- [ ] **Prometheus:** Prometheus deployed
- [ ] **Metrics Collection:** Application metrics collected
- [ ] **Grafana:** Grafana dashboards display metrics
- [ ] **Dashboard Visualization:** Metrics visualized effectively
- [ ] **Alerts:** Alerts configured for critical metrics
- [ ] **CPU/Memory:** System metrics tracked
- [ ] **Uptime:** Service uptime monitored

#### V.7.3 Microservices Architecture [MAJOR]
- [ ] **Loosely Coupled:** Services are independent
- [ ] **Service Discovery:** Services can discover each other
- [ ] **Communication:** Inter-service communication works
- [ ] **Scalability:** Services can scale independently
- [ ] **Data Isolation:** Each service has isolated data
- [ ] **API Gateway:** API gateway routes requests correctly
- [ ] **Containerization:** Each service in separate container
- [ ] **Orchestration:** Service orchestration/management in place

---

### V.8 Graphics Module

#### V.8.1 3D Graphics [MAJOR]
- [ ] **Babylon.js:** Used for 3D rendering
- [ ] **3D Pong:** Pong game rendered in 3D
- [ ] **Advanced Visuals:** Uses advanced 3D techniques
- [ ] **Lighting:** 3D lighting implemented
- [ ] **Textures:** 3D textures/materials applied
- [ ] **Camera:** 3D camera controls functional
- [ ] **Performance:** 3D rendering performs smoothly
- [ ] **Cross-Browser:** 3D works across browsers

---

### V.9 Accessibility Module

#### V.9.1 Responsive Design [MINOR]
- [ ] **Desktop:** Works on desktop screens
- [ ] **Mobile:** Works on mobile devices
- [ ] **Tablet:** Works on tablet devices
- [ ] **Responsive Breakpoints:** CSS breakpoints configured
- [ ] **Touch Input:** Mobile touch input works
- [ ] **Layout:** Layout adapts to screen size
- [ ] **Images:** Images scale responsively

#### V.9.2 Browser Compatibility [MINOR]
- [ ] **Firefox:** Latest stable Firefox supported
- [ ] **Second Browser:** One additional browser supported
  - [ ] Chrome/Chromium
  - [ ] Safari
  - [ ] Edge
  - [ ] Other: _______________
- [ ] **Compatibility Testing:** Tested on multiple browsers
- [ ] **Fallbacks:** Polyfills/fallbacks for older features

#### V.9.3 Multi-Language Support [MINOR]
- [ ] **Language Switcher:** UI to switch languages
- [ ] **3+ Languages:** At least 3 languages supported
  - [ ] Language 1: _______________
  - [ ] Language 2: _______________
  - [ ] Language 3: _______________
- [ ] **Translation:** All text properly translated
- [ ] **Persistence:** Language preference saved
- [ ] **RTL Support:** Right-to-left languages supported (if used)

#### V.9.4 Visually Impaired Support [MINOR]
- [ ] **Screen Reader:** Screen reader compatible
- [ ] **Alt Text:** All images have descriptive alt text
- [ ] **ARIA Labels:** Form inputs have proper ARIA labels
- [ ] **High Contrast:** High-contrast mode available
- [ ] **Text Sizing:** Users can adjust text size
- [ ] **Keyboard Navigation:** Full keyboard navigation possible
- [ ] **Focus Indicators:** Visual focus indicators present
- [ ] **Color Contrast:** Text meets WCAG contrast standards

#### V.9.5 Server-Side Rendering (SSR) [MINOR]
- [ ] **SSR Implemented:** Server-side rendering functional
- [ ] **Initial Load:** Page renders on server first
- [ ] **SEO:** Pages are SEO-friendly
- [ ] **Performance:** Page load time improved
- [ ] **Hydration:** Client-side hydration works
- [ ] **Meta Tags:** Meta tags properly rendered on server
- [ ] **Dynamic Routes:** Dynamic routes rendered on server

---

### V.10 Server-Side Pong Module

#### V.10.1 Server-Side Logic + API [MAJOR]
- [ ] **Server-Side Game Logic:** Pong logic runs on server
- [ ] **Ball Movement:** Server calculates ball physics
- [ ] **Scoring:** Server handles scoring
- [ ] **Player Interactions:** Server processes player inputs
- [ ] **API Endpoints:** API allows game initialization
- [ ] **Game Control API:** Players can control game via API
- [ ] **Game State API:** API returns game state
- [ ] **Client Synchronization:** Clients sync with server state
- [ ] **Validation:** Server validates all inputs
- [ ] **Real-Time Updates:** WebSocket sends game updates

#### V.10.2 CLI Gameplay [MAJOR]
- [ ] **CLI Application:** Command-line Pong application created
- [ ] **API Connection:** CLI connects to web API
- [ ] **Authentication:** CLI users can log in
- [ ] **Gameplay:** CLI users can play Pong via CLI
- [ ] **Web Player Match:** CLI can play against web users
- [ ] **Real-Time Sync:** CLI/Web gameplay is synchronized
- [ ] **Move Controls:** CLI has intuitive controls (arrow keys, etc.)
- [ ] **Match Creation:** CLI users can join/create matches
- [ ] **Match Invites:** CLI users can invite web players
- [ ] **Game Updates:** CLI receives real-time game updates
- [ ] **Documentation:** CLI usage clearly documented

---

## Part 5: Bonus Evaluation

**IMPORTANT:** Bonus is ONLY evaluated if mandatory part is **PERFECT**

### Bonus Eligibility
- [ ] Mandatory part is 100% complete
- [ ] Mandatory part has NO errors
- [ ] Game works without issues
- [ ] All security requirements met
- [ ] No crashes or unhandled errors

### Extra Modules (Bonus)
For each extra module beyond 7 required:

#### Extra Module: _________________________ (Major/Minor)
- [ ] Functions properly
- [ ] Team understands implementation
- [ ] Team can explain why chosen
- [ ] No visible errors
- [ ] Comprehensive explanation provided
- [ ] Points: _____ (5 for minor, 10 for major)

#### Extra Module: _________________________ (Major/Minor)
- [ ] Functions properly
- [ ] Team understands implementation
- [ ] Team can explain why chosen
- [ ] No visible errors
- [ ] Comprehensive explanation provided
- [ ] Points: _____ (5 for minor, 10 for major)

---

## Part 6: Final Evaluation Summary

### Code Modifications Test
- [ ] *Optional:* Team able to perform live code modification
- [ ] *Optional:* Modification completed within reasonable time
- [ ] *Optional:* Team understands code to modify successfully

### Final Rating
Select ONE:

- [ ] **OK** - Outstanding project, all requirements met
- [ ] **Empty Work** - Repository is empty or no meaningful work
- [ ] **Incomplete Work** - Mandatory part not fully completed
- [ ] **Cheat** - Malicious code, plagiarism, or unauthorized help
- [ ] **Crash** - Application crashes or doesn't run
- [ ] **Incomplete Group** - Some group members didn't contribute
- [ ] **Forbidden Function** - Used prohibited libraries/tools
- [ ] **Can't Support/Explain Code** - Team cannot explain code they wrote

### Evaluator Notes
```
[Space for additional notes, observations, or special cases]




```

### Defense Date: _________________ | Evaluator: _________________

### Total Score: _______ / 100 (Mandatory: ___/100 + Bonus: ___/100)

---

## Appendix: Module Scoring Guide

| Type | Points |
|------|--------|
| Mandatory Part (Perfect) | 100 |
| Each Major Module | 2 |
| Each Minor Module | 1 |
| Extra Major Module | 10 |
| Extra Minor Module | 5 |

**To reach 100%:** 7 Major Modules (2×7 = 14 points minimum on mandatory part)

---

## Reference Documents
- **transc.pdf** - Main comprehensive subject document (Version 18.0)
- **subject.md** - Abbreviated summary version
- **eval.md** - Official evaluation sheet

**Last Updated:** From transc.pdf Version 18.0
