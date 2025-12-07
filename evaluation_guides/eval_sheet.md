# ft_transcendence - Interactive Evaluation Checklist

**Version:** 18.0 | **Last Updated:** Based on transc.pdf, subject.md, and eval.md

This is a comprehensive interactive checklist for evaluating the ft_transcendence project. All requirements are extracted from the three official documents. 

**How to use:**
- Check off items as you verify them: `- [ ]` → `- [x]`
- Click `[↓ How to verify]` links to jump to detailed verification steps
- Use `Ctrl+Shift+V` in VS Code for clickable links in preview mode

---

## Part 1: Preliminary Setup & General Instructions

### Repository & Deployment
- [ ] Git repository is clean - cloned in an empty folder (`git clone`) [↓ How to verify](#repo-clone)
- [ ] No malicious aliases or code tricks present [↓ How to verify](#malicious-check)
- [ ] `.env` file contains all credentials/API keys (NOT committed to Git) [↓ How to verify](#env-file)
- [ ] `docker-compose.yaml` (or equivalent) exists at root [↓ How to verify](#docker-compose)
- [ ] Docker builds without errors: `docker-compose up --build` [↓ How to verify](#docker-build)
- [ ] Docker launches successfully with single command line [↓ How to verify](#docker-launch)
- [ ] Website is accessible after Docker launch [↓ How to verify](#website-access)

### Code Quality & Libraries
- [ ] No libraries/tools provide an "immediate complete solution" for entire features [↓ How to verify](#prohibited-libs)
- [ ] All direct instructions about third-party libraries (can/must/can't) are followed [↓ How to verify](#library-rules)
- [ ] Use of small libraries for simple subcomponents is justified [↓ How to verify](#library-justified)
- [ ] Team can explain ANY non-explicitly approved library usage [↓ How to verify](#library-explain)
- [ ] No segfaults or unexpected terminations during defense [↓ How to verify](#no-segfaults)
- [ ] No unhandled errors or warnings in browser console [↓ How to verify](#console-errors)

### Memory & Performance
- [ ] No memory leaks detected (use: `leaks`, `valgrind`, or `e_fence`) [↓ How to verify](#memory-leaks)
- [ ] Application runs without crashes on unexpected usage [↓ How to verify](#crash-test)
- [ ] Performance is acceptable (no hangs, freezes, or delays) [↓ How to verify](#performance)

---

## Part 2: Mandatory Part - Technical Requirements

### Technology Stack (Default/Mandatory Constraints)
- [ ] **Frontend:** TypeScript is base code [↓ How to verify](#tech-typescript)
- [ ] **Backend:** Pure PHP (unless Framework/Web module overrides) [↓ How to verify](#tech-php)
- [ ] **Database:** SQLite (if database used) [↓ How to verify](#tech-sqlite)
- [ ] **Containerization:** Docker with single-command launch [↓ How to verify](#tech-docker)
- [ ] **Architecture:** Single Page Application (SPA) [↓ How to verify](#tech-spa)
- [ ] **Browser Compatibility:** Latest stable Firefox version [↓ How to verify](#tech-firefox)
- [ ] Back/Forward browser buttons work correctly in SPA [↓ How to verify](#tech-browser-nav)

### Website Accessibility & Registration
- [ ] Website is fully available and accessible [↓ How to verify](#web-accessible)
- [ ] Registration/Subscribe system works [↓ How to verify](#web-register)
- [ ] Users can register with username/credentials [↓ How to verify](#web-credentials)
- [ ] Registered users can log in [↓ How to verify](#web-login)
- [ ] Login persists session correctly [↓ How to verify](#web-session)
- [ ] No 500 errors during normal usage [↓ How to verify](#web-no-errors)

### Security (MANDATORY - Stop if Missing)
- [ ] **HTTPS/TLS:** Website uses HTTPS/TLS encryption [↓ How to verify](#sec-https)
- [ ] **WebSocket:** WebSocket connections use WSS (secure) [↓ How to verify](#sec-wss)
- [ ] **Password Hashing:** Database passwords are hashed (never plaintext) [↓ How to verify](#sec-password-hash)
- [ ] **SQL Injection:** Server-side protection against SQL injection [↓ How to verify](#sec-sql-injection)
- [ ] **XSS Protection:** Server-side sanitization/validation against XSS [↓ How to verify](#sec-xss)
- [ ] **Form Validation:** Server-side validation for all forms and user input [↓ How to verify](#sec-form-validation)
- [ ] **Input Sanitization:** All user inputs are sanitized [↓ How to verify](#sec-input-sanitization)
- [ ] **SSL Certificates:** Valid certificates (not self-signed or expired) [↓ How to verify](#sec-ssl-cert)
- [ ] **Credentials:** No API keys/secrets committed to Git [↓ How to verify](#sec-no-secrets)
- [ ] **Environment Variables:** Sensitive data in `.env` file only [↓ How to verify](#sec-env-vars)

### The Game - Pong (Core Mandatory)
- [ ] **Game is playable:** Live Pong game works locally [↓ How to verify](#game-playable)
- [ ] **Local 2-Player:** Two players can play on same keyboard [↓ How to verify](#game-2player)
- [ ] **Keyboard Control:** Each player uses specific keyboard section [↓ How to verify](#game-keyboard)
- [ ] **Paddle Speed:** All players have identical paddle speed [↓ How to verify](#game-paddle-speed)
- [ ] **AI Speed:** If AI module included, AI moves at same speed as players [↓ How to verify](#game-ai-speed)
- [ ] **Pong Rules:** Game adheres to original Pong rules (paddle, ball, scoring) [↓ How to verify](#game-rules)
- [ ] **Game Controls:** Controls are intuitive or clearly explained [↓ How to verify](#game-controls)
- [ ] **Game End:** End-game state handled (screen displays result or proper exit) [↓ How to verify](#game-end)
- [ ] **Real-Time:** Multiplayer gameplay is real-time [↓ How to verify](#game-realtime)

### Tournament & Matchmaking System
- [ ] **Tournament System:** Tournament system available [↓ How to verify](#tourney-system)
- [ ] **Multiple Players:** Multiple players can participate [↓ How to verify](#tourney-multiplayer)
- [ ] **Turn-Based:** Players take turns playing against each other [↓ How to verify](#tourney-turns)
- [ ] **Clear Display:** Shows who is playing whom and order of play [↓ How to verify](#tourney-display)
- [ ] **Matchmaking:** System organizes matchmaking of participants [↓ How to verify](#tourney-matchmaking)
- [ ] **Match Announcements:** System announces the next match [↓ How to verify](#tourney-announce)

### Registration in Tournament
- [ ] **Alias Input:** Players input alias at tournament start [↓ How to verify](#tourney-alias)
- [ ] **Alias Reset:** Aliases reset when new tournament begins [↓ How to verify](#tourney-reset)
- [ ] **No Persistent Accounts:** Default requires only alias input (no account creation) [↓ How to verify](#tourney-no-accounts)
  - *Can be modified by Standard User Management module*

### Error Handling - Lags & Disconnects
- [ ] **Unexpected Disconnections:** Handled gracefully (no crash) [↓ How to verify](#error-disconnect)
- [ ] **Lag Handling:** Lags do not cause crashes or unplayable state [↓ How to verify](#error-lag)
- [ ] **Game Stability:** Site/Game does not crash on disconnects [↓ How to verify](#error-stability)
- [ ] *(Optional)* Reconnection features implemented [↓ How to verify](#error-reconnect)
- [ ] *(Optional)* Pause/resume functionality implemented [↓ How to verify](#error-pause)

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
- [ ] Uses **Fastify** with **Node.js** [↓ How to verify](#mod-v11-fastify)
- [ ] Fastify server starts without errors [↓ How to verify](#mod-v11-server)
- [ ] API endpoints respond correctly [↓ How to verify](#mod-v11-api)
- [ ] Request/response handling works [↓ How to verify](#mod-v11-reqres)
- [ ] WebSocket connections established via Fastify [↓ How to verify](#mod-v11-websocket)

#### V.1.2 Frontend Framework [MINOR]
- [ ] Uses **Tailwind CSS** [↓ How to verify](#mod-v12-tailwind)
- [ ] TypeScript is used for styling/UI logic [↓ How to verify](#mod-v12-typescript)
- [ ] UI is responsive and clean [↓ How to verify](#mod-v12-responsive)
- [ ] CSS compiles without errors [↓ How to verify](#mod-v12-compile)
- [ ] No CSS conflicts or broken styling [↓ How to verify](#mod-v12-no-conflicts)

#### V.1.3 Database Module [MINOR]
- [ ] Uses **SQLite** [↓ How to verify](#mod-v13-sqlite)
- [ ] Database file created and persists [↓ How to verify](#mod-v13-persist)
- [ ] Queries execute correctly [↓ How to verify](#mod-v13-queries)
- [ ] Data is properly stored and retrieved [↓ How to verify](#mod-v13-data)
- [ ] No database connection errors [↓ How to verify](#mod-v13-no-errors)

#### V.1.4 Blockchain Module [MAJOR]
- [ ] Uses **Avalanche** blockchain [↓ How to verify](#mod-v14-avalanche)
- [ ] **Solidity** smart contracts implemented [↓ How to verify](#mod-v14-solidity)
- [ ] Tournament scores stored on blockchain [↓ How to verify](#mod-v14-scores)
- [ ] Smart contracts deploy successfully [↓ How to verify](#mod-v14-deploy)
- [ ] (Optional) Uses testnet for development [↓ How to verify](#mod-v14-testnet)
- [ ] Blockchain integration is tested [↓ How to verify](#mod-v14-tested)

---

### V.3 User Management Module

#### V.3.1 Standard User Management [MAJOR]
- [ ] **Registration/Login:** Secure subscribe and login system [↓ How to verify](#mod-v31-reg-login)
- [ ] **Avatars:** Users can upload/set avatars [↓ How to verify](#mod-v31-avatars)
- [ ] **Friend Lists:** Users can add/remove friends [↓ How to verify](#mod-v31-friends)
- [ ] **Online Status:** Shows who is online/offline [↓ How to verify](#mod-v31-online)
- [ ] **Player Stats:** Displays wins/losses statistics [↓ How to verify](#mod-v31-stats)
- [ ] **Match History:** Shows history of past matches [↓ How to verify](#mod-v31-history)
- [ ] **User Profiles:** Profiles display all user information [↓ How to verify](#mod-v31-profiles)

#### V.3.2 Remote Authentication [MAJOR]
- [ ] **OAuth 2.0:** Implemented for external services [↓ How to verify](#mod-v32-oauth)
- [ ] **OAuth Providers:** At least one provider (Google, GitHub, etc.) [↓ How to verify](#mod-v32-provider)
- [ ] **Secure Token Handling:** OAuth tokens handled securely [↓ How to verify](#mod-v32-tokens)
- [ ] **User Data:** Fetches correct user data from OAuth [↓ How to verify](#mod-v32-userdata)
- [ ] **Session Management:** OAuth session persists correctly [↓ How to verify](#mod-v32-session)
- [ ] **Fallback:** Fallback to standard login if OAuth fails [↓ How to verify](#mod-v32-fallback)

---

### V.4 Gameplay & User Experience Module

#### V.4.1 Remote Players [MAJOR]
- [ ] **Two Players, Separate Computers:** Remote players can play together [↓ How to verify](#mod-v41-remote)
- [ ] **Real-Time Synchronization:** Ball/paddle sync between players [↓ How to verify](#mod-v41-sync)
- [ ] **Lag Handling:** Lag doesn't break gameplay [↓ How to verify](#mod-v41-lag)
- [ ] **Disconnect Handling:** Disconnects are handled gracefully [↓ How to verify](#mod-v41-disconnect)
- [ ] **Player Identification:** Clear indication of who is who [↓ How to verify](#mod-v41-identity)
- [ ] **Network Communication:** Uses WebSocket or equivalent for real-time [↓ How to verify](#mod-v41-network)

#### V.4.2 Multiplayer (>2 Players) [MAJOR]
- [ ] **Supports >2 Players:** Game works with 3+ players [↓ How to verify](#mod-v42-3players)
- [ ] **Game Logic:** Scoring/rules adapt to multiple players [↓ How to verify](#mod-v42-logic)
- [ ] **Square Board:** Board layout accommodates multiple paddles [↓ How to verify](#mod-v42-board)
- [ ] **Player Turns:** Clear turn order or simultaneous play [↓ How to verify](#mod-v42-turns)
- [ ] **Win Condition:** Clear victory conditions for multiplayer [↓ How to verify](#mod-v42-win)

#### V.4.3 New Game (Non-Pong) [MAJOR]
- [ ] **Second Game Implemented:** Another game besides Pong [↓ How to verify](#mod-v43-newgame)
- [ ] **Game Rules:** Rules clearly defined and implemented [↓ How to verify](#mod-v43-rules)
- [ ] **Game State:** Game state tracked correctly [↓ How to verify](#mod-v43-state)
- [ ] **Match History:** History recorded for the new game [↓ How to verify](#mod-v43-history)
- [ ] **Matchmaking:** Matchmaking system works for new game [↓ How to verify](#mod-v43-matchmaking)
- [ ] **UI Integration:** New game accessible from main interface [↓ How to verify](#mod-v43-ui)

#### V.4.4 Game Customization [MINOR]
- [ ] **Power-ups:** Implemented and functional (if chosen) [↓ How to verify](#mod-v44-powerups)
- [ ] **Attacks:** Game attacks work as designed (if chosen) [↓ How to verify](#mod-v44-attacks)
- [ ] **Different Maps:** Multiple maps available (if chosen) [↓ How to verify](#mod-v44-maps)
- [ ] **Customization Menu:** UI for selecting customization options [↓ How to verify](#mod-v44-menu)
- [ ] **Balance:** Game remains balanced with customizations [↓ How to verify](#mod-v44-balance)

#### V.4.5 Live Chat [MAJOR]
- [ ] **Direct Messages:** Users can send direct messages [↓ How to verify](#mod-v45-dm)
- [ ] **Message History:** Chat history is maintained [↓ How to verify](#mod-v45-history)
- [ ] **User Blocking:** Users can block other users [↓ How to verify](#mod-v45-blocking)
- [ ] **Blocked User Behavior:** Blocked users cannot message or see blocker [↓ How to verify](#mod-v45-blocked-behavior)
- [ ] **Game Invites:** Users can invite others to games via chat [↓ How to verify](#mod-v45-invites)
- [ ] **Tournament Notifications:** Chat shows tournament-related notifications [↓ How to verify](#mod-v45-tournament)
- [ ] **Real-Time Delivery:** Messages deliver in real-time [↓ How to verify](#mod-v45-realtime)
- [ ] **Online Indicators:** Chat shows user online status [↓ How to verify](#mod-v45-online)

---

### V.5 AI-Algo Module

#### V.5.1 AI Opponent [MAJOR]
- [ ] **AI Implementation:** AI opponent functional [↓ How to verify](#mod-v51-ai-impl)
- [ ] **Keyboard Simulation:** AI simulates actual keyboard input [↓ How to verify](#mod-v51-keyboard)
- [ ] **Update Frequency:** AI view/decisions refresh ~once per second [↓ How to verify](#mod-v51-frequency)
- [ ] **Speed Constraint:** AI moves at same speed as regular players [↓ How to verify](#mod-v51-speed)
- [ ] **AI Logic:** AI makes intelligent moves (not random) [↓ How to verify](#mod-v51-logic)
- [ ] **A* Prohibition:** A* algorithm is NOT used [↓ How to verify](#mod-v51-no-astar)
- [ ] **Difficulty:** AI provides challenge to players [↓ How to verify](#mod-v51-difficulty)
- [ ] **Play Testing:** AI is tested against human players [↓ How to verify](#mod-v51-tested)

#### V.5.2 Dashboards [MINOR]
- [ ] **User Statistics Dashboard:** Visual stats for users [↓ How to verify](#mod-v52-user-stats)
- [ ] **Game Session Dashboard:** Stats for game sessions [↓ How to verify](#mod-v52-game-stats)
- [ ] **Charts/Graphs:** Data visualized in charts or graphs [↓ How to verify](#mod-v52-charts)
- [ ] **Real-Time Updates:** Dashboards update in real-time [↓ How to verify](#mod-v52-realtime)
- [ ] **Data Accuracy:** Statistics are correct and calculated properly [↓ How to verify](#mod-v52-accuracy)
- [ ] **Multiple Views:** Different dashboard views available [↓ How to verify](#mod-v52-views)
- [ ] **Responsive Design:** Dashboards work on all screen sizes [↓ How to verify](#mod-v52-responsive)

---

### V.6 Cybersecurity Module

#### V.6.1 WAF & Vault [MAJOR]
- [ ] **Web Application Firewall:** ModSecurity or similar WAF implemented [↓ How to verify](#mod-v61-waf)
- [ ] **WAF Rules:** Effective security rules configured [↓ How to verify](#mod-v61-rules)
- [ ] **Vault Integration:** **HashiCorp Vault** used for secrets [↓ How to verify](#mod-v61-vault)
- [ ] **Secret Management:** Sensitive data stored in Vault [↓ How to verify](#mod-v61-secrets)
- [ ] **Rotation:** Secrets can be rotated [↓ How to verify](#mod-v61-rotation)
- [ ] **Authentication:** Vault authentication configured [↓ How to verify](#mod-v61-auth)
- [ ] **Encryption:** Secrets encrypted in transit and at rest [↓ How to verify](#mod-v61-encryption)

#### V.6.2 GDPR Compliance [MINOR]
- [ ] **Data Anonymization:** User data can be anonymized [↓ How to verify](#mod-v62-anonymize)
- [ ] **Local Data Storage:** Option to store data locally (not externally) [↓ How to verify](#mod-v62-local)
- [ ] **Account Deletion:** Users can request account deletion [↓ How to verify](#mod-v62-deletion)
- [ ] **Data Export:** Users can export their data [↓ How to verify](#mod-v62-export)
- [ ] **Privacy Policy:** Privacy policy is documented [↓ How to verify](#mod-v62-policy)
- [ ] **Consent:** User consent collected for data usage [↓ How to verify](#mod-v62-consent)
- [ ] **Right to Forget:** Data deleted upon request [↓ How to verify](#mod-v62-forget)

#### V.6.3 2FA & JWT [MAJOR]
- [ ] **Two-Factor Authentication:** 2FA enabled [↓ How to verify](#mod-v63-2fa)
- [ ] **2FA Method:** SMS/App/Email 2FA working [↓ How to verify](#mod-v63-method)
- [ ] **Recovery Codes:** Backup codes provided for 2FA [↓ How to verify](#mod-v63-recovery)
- [ ] **JWT Implementation:** JSON Web Tokens used for sessions [↓ How to verify](#mod-v63-jwt)
- [ ] **JWT Signing:** JWTs properly signed with secret [↓ How to verify](#mod-v63-signing)
- [ ] **JWT Validation:** Tokens validated on server [↓ How to verify](#mod-v63-validation)
- [ ] **Token Expiry:** Tokens expire after set time [↓ How to verify](#mod-v63-expiry)
- [ ] **Token Refresh:** Refresh tokens work correctly [↓ How to verify](#mod-v63-refresh)

---

### V.7 DevOps Module

#### V.7.1 Infrastructure (ELK Stack) [MAJOR]
- [ ] **Elasticsearch:** Deployed and running [↓ How to verify](#mod-v71-elasticsearch)
- [ ] **Logstash:** Parses and ships logs [↓ How to verify](#mod-v71-logstash)
- [ ] **Kibana:** Log visualization/dashboard functional [↓ How to verify](#mod-v71-kibana)
- [ ] **Log Collection:** All application logs collected [↓ How to verify](#mod-v71-collection)
- [ ] **Log Storage:** Logs stored in Elasticsearch [↓ How to verify](#mod-v71-storage)
- [ ] **Log Queries:** Can search/filter logs in Kibana [↓ How to verify](#mod-v71-queries)
- [ ] **Log Retention:** Log retention policy configured [↓ How to verify](#mod-v71-retention)
- [ ] **Monitoring:** ELK stack monitors application health [↓ How to verify](#mod-v71-monitoring)

#### V.7.2 Monitoring [MINOR]
- [ ] **Prometheus:** Prometheus deployed [↓ How to verify](#mod-v72-prometheus)
- [ ] **Metrics Collection:** Application metrics collected [↓ How to verify](#mod-v72-metrics)
- [ ] **Grafana:** Grafana dashboards display metrics [↓ How to verify](#mod-v72-grafana)
- [ ] **Dashboard Visualization:** Metrics visualized effectively [↓ How to verify](#mod-v72-visualization)
- [ ] **Alerts:** Alerts configured for critical metrics [↓ How to verify](#mod-v72-alerts)
- [ ] **CPU/Memory:** System metrics tracked [↓ How to verify](#mod-v72-system)
- [ ] **Uptime:** Service uptime monitored [↓ How to verify](#mod-v72-uptime)

#### V.7.3 Microservices Architecture [MAJOR]
- [ ] **Loosely Coupled:** Services are independent [↓ How to verify](#mod-v73-coupled)
- [ ] **Service Discovery:** Services can discover each other [↓ How to verify](#mod-v73-discovery)
- [ ] **Communication:** Inter-service communication works [↓ How to verify](#mod-v73-communication)
- [ ] **Scalability:** Services can scale independently [↓ How to verify](#mod-v73-scalability)
- [ ] **Data Isolation:** Each service has isolated data [↓ How to verify](#mod-v73-data)
- [ ] **API Gateway:** API gateway routes requests correctly [↓ How to verify](#mod-v73-gateway)
- [ ] **Containerization:** Each service in separate container [↓ How to verify](#mod-v73-containers)
- [ ] **Orchestration:** Service orchestration/management in place [↓ How to verify](#mod-v73-orchestration)

---

### V.8 Graphics Module

#### V.8.1 3D Graphics [MAJOR]
- [ ] **Babylon.js:** Used for 3D rendering [↓ How to verify](#mod-v81-babylonjs)
- [ ] **3D Pong:** Pong game rendered in 3D [↓ How to verify](#mod-v81-3d-pong)
- [ ] **Advanced Visuals:** Uses advanced 3D techniques [↓ How to verify](#mod-v81-visuals)
- [ ] **Lighting:** 3D lighting implemented [↓ How to verify](#mod-v81-lighting)
- [ ] **Textures:** 3D textures/materials applied [↓ How to verify](#mod-v81-textures)
- [ ] **Camera:** 3D camera controls functional [↓ How to verify](#mod-v81-camera)
- [ ] **Performance:** 3D rendering performs smoothly [↓ How to verify](#mod-v81-performance)
- [ ] **Cross-Browser:** 3D works across browsers [↓ How to verify](#mod-v81-browser)

---

### V.9 Accessibility Module

#### V.9.1 Responsive Design [MINOR]
- [ ] **Desktop:** Works on desktop screens [↓ How to verify](#mod-v91-desktop)
- [ ] **Mobile:** Works on mobile devices [↓ How to verify](#mod-v91-mobile)
- [ ] **Tablet:** Works on tablet devices [↓ How to verify](#mod-v91-tablet)
- [ ] **Responsive Breakpoints:** CSS breakpoints configured [↓ How to verify](#mod-v91-breakpoints)
- [ ] **Touch Input:** Mobile touch input works [↓ How to verify](#mod-v91-touch)
- [ ] **Layout:** Layout adapts to screen size [↓ How to verify](#mod-v91-layout)
- [ ] **Images:** Images scale responsively [↓ How to verify](#mod-v91-images)

#### V.9.2 Browser Compatibility [MINOR]
- [ ] **Firefox:** Latest stable Firefox supported [↓ How to verify](#mod-v92-firefox)
- [ ] **Second Browser:** One additional browser supported [↓ How to verify](#mod-v92-second)
  - [ ] Chrome/Chromium
  - [ ] Safari
  - [ ] Edge
  - [ ] Other: _______________
- [ ] **Compatibility Testing:** Tested on multiple browsers [↓ How to verify](#mod-v92-testing)
- [ ] **Fallbacks:** Polyfills/fallbacks for older features [↓ How to verify](#mod-v92-fallbacks)

#### V.9.3 Multi-Language Support [MINOR]
- [ ] **Language Switcher:** UI to switch languages [↓ How to verify](#mod-v93-switcher)
- [ ] **3+ Languages:** At least 3 languages supported [↓ How to verify](#mod-v93-languages)
  - [ ] Language 1: _______________
  - [ ] Language 2: _______________
  - [ ] Language 3: _______________
- [ ] **Translation:** All text properly translated [↓ How to verify](#mod-v93-translation)
- [ ] **Persistence:** Language preference saved [↓ How to verify](#mod-v93-persistence)
- [ ] **RTL Support:** Right-to-left languages supported (if used) [↓ How to verify](#mod-v93-rtl)

#### V.9.4 Visually Impaired Support [MINOR]
- [ ] **Screen Reader:** Screen reader compatible [↓ How to verify](#mod-v94-screen-reader)
- [ ] **Alt Text:** All images have descriptive alt text [↓ How to verify](#mod-v94-alt-text)
- [ ] **ARIA Labels:** Form inputs have proper ARIA labels [↓ How to verify](#mod-v94-aria)
- [ ] **High Contrast:** High-contrast mode available [↓ How to verify](#mod-v94-contrast)
- [ ] **Text Sizing:** Users can adjust text size [↓ How to verify](#mod-v94-text-size)
- [ ] **Keyboard Navigation:** Full keyboard navigation possible [↓ How to verify](#mod-v94-keyboard)
- [ ] **Focus Indicators:** Visual focus indicators present [↓ How to verify](#mod-v94-focus)
- [ ] **Color Contrast:** Text meets WCAG contrast standards [↓ How to verify](#mod-v94-wcag)

#### V.9.5 Server-Side Rendering (SSR) [MINOR]
- [ ] **SSR Implemented:** Server-side rendering functional [↓ How to verify](#mod-v95-ssr)
- [ ] **Initial Load:** Page renders on server first [↓ How to verify](#mod-v95-initial)
- [ ] **SEO:** Pages are SEO-friendly [↓ How to verify](#mod-v95-seo)
- [ ] **Performance:** Page load time improved [↓ How to verify](#mod-v95-performance)
- [ ] **Hydration:** Client-side hydration works [↓ How to verify](#mod-v95-hydration)
- [ ] **Meta Tags:** Meta tags properly rendered on server [↓ How to verify](#mod-v95-meta)
- [ ] **Dynamic Routes:** Dynamic routes rendered on server [↓ How to verify](#mod-v95-routes)

---

### V.10 Server-Side Pong Module

#### V.10.1 Server-Side Logic + API [MAJOR]
- [ ] **Server-Side Game Logic:** Pong logic runs on server [↓ How to verify](#mod-v101-logic)
- [ ] **Ball Movement:** Server calculates ball physics [↓ How to verify](#mod-v101-ball)
- [ ] **Scoring:** Server handles scoring [↓ How to verify](#mod-v101-scoring)
- [ ] **Player Interactions:** Server processes player inputs [↓ How to verify](#mod-v101-interactions)
- [ ] **API Endpoints:** API allows game initialization [↓ How to verify](#mod-v101-endpoints)
- [ ] **Game Control API:** Players can control game via API [↓ How to verify](#mod-v101-control)
- [ ] **Game State API:** API returns game state [↓ How to verify](#mod-v101-state)
- [ ] **Client Synchronization:** Clients sync with server state [↓ How to verify](#mod-v101-sync)
- [ ] **Validation:** Server validates all inputs [↓ How to verify](#mod-v101-validation)
- [ ] **Real-Time Updates:** WebSocket sends game updates [↓ How to verify](#mod-v101-realtime)

#### V.10.2 CLI Gameplay [MAJOR]
- [ ] **CLI Application:** Command-line Pong application created [↓ How to verify](#mod-v102-cli)
- [ ] **API Connection:** CLI connects to web API [↓ How to verify](#mod-v102-connection)
- [ ] **Authentication:** CLI users can log in [↓ How to verify](#mod-v102-auth)
- [ ] **Gameplay:** CLI users can play Pong via CLI [↓ How to verify](#mod-v102-gameplay)
- [ ] **Web Player Match:** CLI can play against web users [↓ How to verify](#mod-v102-web-match)
- [ ] **Real-Time Sync:** CLI/Web gameplay is synchronized [↓ How to verify](#mod-v102-sync)
- [ ] **Move Controls:** CLI has intuitive controls (arrow keys, etc.) [↓ How to verify](#mod-v102-controls)
- [ ] **Match Creation:** CLI users can join/create matches [↓ How to verify](#mod-v102-match-create)
- [ ] **Match Invites:** CLI users can invite web players [↓ How to verify](#mod-v102-invites)
- [ ] **Game Updates:** CLI receives real-time game updates [↓ How to verify](#mod-v102-updates)
- [ ] **Documentation:** CLI usage clearly documented [↓ How to verify](#mod-v102-docs)

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

---
---

# DETAILED VERIFICATION STEPS

**Navigation:** Click any `[↓ How to verify]` link from the checklist above to jump to detailed steps.
**Return:** Click `[↑ Back to checklist]` to return to the checklist.

---

## Part 1: Preliminary Setup & General Instructions - Verification Details

<a id="repo-clone"></a>
### ✓ Git Repository Clone

**What to check:** Clean Git repository cloned in empty folder

**How to verify:**
```bash
cd ~/evaluation_test
git clone <repository_url> project
cd project
ls -la .git
git log --oneline | head -10
```

**Pass criteria:**
- Repository clones without errors
- `.git` folder exists
- Commit history visible
- No clone warnings

**Fail criteria:**
- Clone fails
- Corrupted repository
- Missing .git folder

[↑ Back to checklist](#part-1-preliminary-setup--general-instructions)

---

<a id="malicious-check"></a>
### ✓ No Malicious Code

**What to check:** No suspicious aliases, hidden commands, or malicious scripts

**How to verify:**
```bash
cat Makefile                           # Check build commands
grep -r "eval(" . --include="*.js" --include="*.ts"  # Dangerous eval
cat docker-compose.yml                 # Check volume mounts
grep -r "rm -rf" . --include="*.sh"   # Destructive commands
cat .git/config                        # Check git hooks
```

**Pass criteria:**
- No suspicious eval() usage
- No destructive commands in Makefile
- Docker volumes mount only project directories
- No malicious git hooks

**Red flags:**
- `eval()` with user input
- `rm -rf /` or similar
- Suspicious volume mounts (`:rw` to system directories)
- Hidden cryptocurrency miners

**Ask team:**
- "Walk me through your build process"
- "Any custom scripts I should know about?"

[↑ Back to checklist](#part-1-preliminary-setup--general-instructions)

---

<a id="env-file"></a>
### ✓ .env File Exists (Not in Git)

**What to check:** Credentials in .env, NOT committed to Git

**How to verify:**
```bash
ls -la .env                              # Must exist
cat .env                                 # View contents
cat .gitignore | grep ".env"            # Should be ignored
git log --all --full-history -- .env    # Should return nothing
git status                               # .env should not be tracked
```

**Pass criteria:**
- `.env` file exists
- Contains: DB credentials, API keys, OAuth secrets, JWT secret
- `.env` in `.gitignore`
- Never committed to Git (empty git log)

**Fail criteria:**
- No .env file
- Secrets hardcoded in source files
- .env committed to Git history
- .env not in .gitignore

[↑ Back to checklist](#part-1-preliminary-setup--general-instructions)

---

<a id="docker-compose"></a>
### ✓ docker-compose.yml Exists

**What to check:** docker-compose file at project root

**How to verify:**
```bash
ls -la docker-compose.yml
cat docker-compose.yml
```

**Pass criteria:**
- File exists at root
- Valid YAML syntax
- Services defined (backend, frontend, database, etc.)
- Port mappings present
- Volume mappings present
- Networks configured

**Example structure:**
```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
  db:
    image: postgres:latest
```

[↑ Back to checklist](#part-1-preliminary-setup--general-instructions)

---

<a id="docker-build"></a>
### ✓ Docker Builds Without Errors

**What to check:** Docker build completes successfully

**How to verify:**
```bash
# Build all services
docker-compose up --build

# Watch for errors in output
# Should see: "Building..." → "Successfully built"
```

**Pass criteria:**
- Build completes without errors
- No "ERROR" messages in output
- All services build successfully
- Images created

**Red flags:**
- Build fails
- Missing dependencies
- Connection timeouts
- Permission errors

[↑ Back to checklist](#part-1-preliminary-setup--general-instructions)

---

<a id="docker-launch"></a>
### ✓ Docker Launches Successfully

**What to check:** All containers start with single command

**How to verify:**
```bash
# Start containers
docker-compose up -d

# Check all containers running
docker ps

# Check logs for errors
docker-compose logs | grep -i error
```

**Pass criteria:**
- All containers show "Up" status
- No containers restarting repeatedly
- Services accessible on expected ports
- Logs show no critical errors

[↑ Back to checklist](#part-1-preliminary-setup--general-instructions)

---

<a id="website-access"></a>
### ✓ Website Accessible

**What to check:** Can access website in browser

**How to verify:**
1. Start containers: `docker-compose up`
2. Open browser: `https://localhost` or specified port
3. Wait for page load
4. Check browser console (F12) for errors

**Pass criteria:**
- Page loads in browser
- No 404 errors
- Assets load (CSS, JS, images)
- No CORS errors in console

**Fail criteria:**
- Connection refused
- 502 Bad Gateway
- Blank page
- Assets fail to load

[↑ Back to checklist](#part-1-preliminary-setup--general-instructions)

---

<a id="prohibited-libs"></a>
### ✓ No Prohibited Libraries

**What to check:** No libraries that provide complete feature solutions

**How to verify:**
```bash
cat backend/package.json | grep dependencies
cat frontend/package.json | grep dependencies
```

**Ask team:**
- "Why did you use [library X]?"
- "What does this library do?"
- "Could you implement without it?"

**Pass criteria:**
- Small utility libraries OK (lodash, date-fns, etc.)
- Large frameworks match chosen modules (Fastify, Tailwind)
- Team can justify ALL library choices
- No "complete solution" libraries for core features

**Red flags:**
- Using a complete Pong game library
- Pre-built tournament systems
- Complete auth systems (unless OAuth module)

[↑ Back to checklist](#part-1-preliminary-setup--general-instructions)

---

<a id="library-rules"></a>
### ✓ Library Rules Followed

**What to check:** All library instructions from subject followed

**Pass criteria:**
- Allowed libraries used correctly
- Prohibited libraries NOT used
- Team can justify each dependency

[↑ Back to checklist](#part-1-preliminary-setup--general-instructions)

---

<a id="library-justified"></a>
### ✓ Small Libraries Justified

**What to check:** Small utility libraries are reasonable

**Ask team:**
- "What does [library] do?"
- "Could you have written this yourself?"
- "Why did you choose this library?"

**Pass criteria:**
- Libraries are small utilities (lodash, moment, etc.)
- Not replacing core functionality
- Team understands what libraries do

[↑ Back to checklist](#part-1-preliminary-setup--general-instructions)

---

<a id="library-explain"></a>
### ✓ Team Can Explain Libraries

**What to check:** Team understands all dependencies

**Ask about random libraries:**
- Pick 3-5 libraries from package.json
- Ask "What does [X] do in your project?"
- Ask "Show me where you use [X]"

**Pass criteria:**
- Team knows what each library does
- Can show usage in code
- Can explain why it's needed

[↑ Back to checklist](#part-1-preliminary-setup--general-instructions)

---

<a id="no-segfaults"></a>
### ✓ No Segfaults/Crashes

**What to check:** Application doesn't crash unexpectedly

**How to verify:**
- Use the application normally
- Try edge cases (empty inputs, spam clicks, etc.)
- Application should stay running

**Pass criteria:**
- No crashes during normal use
- No terminal errors
- Docker containers stay running

[↑ Back to checklist](#part-1-preliminary-setup--general-instructions)

---

<a id="console-errors"></a>
### ✓ No Console Errors

**What to check:** Browser console clean during normal usage

**How to verify:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate through website
4. Play a game
5. Use all features

**Pass criteria:**
- No unhandled errors (red text)
- Warnings acceptable if minor
- No failed network requests
- No undefined variables

**Acceptable warnings:**
- Dev mode warnings
- Browser extension warnings
- Deprecation notices (if minor)

**Fail criteria:**
- Uncaught exceptions
- 404 errors for assets
- CORS errors
- Failed API requests

[↑ Back to checklist](#part-1-preliminary-setup--general-instructions)

---

<a id="memory-leaks"></a>
### ✓ No Memory Leaks

**What to check:** Memory usage stays stable

**How to verify:**

**Browser:**
1. Open DevTools → Performance/Memory tab
2. Take heap snapshot
3. Use website for 5-10 minutes
4. Take another snapshot
5. Compare memory usage

**Backend:**
```bash
docker stats                    # Watch container memory
# Use site, then check again
docker stats
```

**Pass criteria:**
- Memory usage grows slowly or stays stable
- No exponential growth
- Containers don't OOM (Out of Memory)

**Fail criteria:**
- Memory doubles every minute
- Container crashes with OOM
- Browser tab crashes

[↑ Back to checklist](#part-1-preliminary-setup--general-instructions)

---

<a id="crash-test"></a>
### ✓ Crash Testing

**What to check:** App handles unexpected usage without crashing

**Test error scenarios:**
1. Invalid inputs (empty forms, special characters)
2. Network disconnections
3. Rapid clicking/spamming actions
4. Browser back button during game
5. Refresh page during game
6. Multiple simultaneous games

**Pass criteria:**
- Application stays running
- Error messages displayed to user
- Can recover from errors
- Logs errors appropriately
- No white screen of death

**Fail criteria:**
- Application crashes
- Server goes down
- Must restart containers
- Data loss on errors

[↑ Back to checklist](#part-1-preliminary-setup--general-instructions)

---

<a id="performance"></a>
### ✓ Performance Acceptable

**What to check:** No hangs, freezes, or excessive delays

**How to verify:**
1. Navigate between pages - should be instant
2. Start a game - should load < 2 seconds
3. Play game - should be smooth (30+ fps)
4. Send chat messages - should appear instantly
5. Load user profiles - should load < 1 second

**Pass criteria:**
- Page transitions < 500ms
- Game loads < 2 seconds
- Gameplay smooth (no stuttering)
- API responses < 1 second
- No UI freezes

**Fail criteria:**
- Pages take > 3 seconds to load
- Game stutters or lags
- UI freezes during operations
- Timeout errors

[↑ Back to checklist](#part-1-preliminary-setup--general-instructions)

---

## Part 2: Mandatory Part - Technical Requirements - Verification Details

**⚠️ WARNING: If ANY security check fails, stop evaluation immediately. Project fails.**

### Technology Stack Verification

<a id="tech-typescript"></a>
### ✓ Frontend TypeScript

**What to check:** TypeScript is used as base code for frontend

**How to verify:**
```bash
# Check for TypeScript files
ls frontend/src/*.ts frontend/src/**/*.ts

# Check tsconfig.json exists
cat frontend/tsconfig.json

# Check package.json for TypeScript
cat frontend/package.json | grep typescript
```

**Pass criteria:**
- TypeScript files present (`.ts` extensions)
- `tsconfig.json` configured
- TypeScript compiler in dependencies
- No pure `.js` files (except config/build)

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="tech-php"></a>
### ✓ Backend Pure PHP

**What to check:** Backend uses pure PHP (unless Framework/Web module overrides)

**How to verify:**
```bash
# Check for PHP files
ls backend/*.php backend/**/*.php

# Check if using PHP frameworks
cat backend/composer.json 2>/dev/null

# Ask team what backend they're using
```

**Pass criteria:**
- PHP files present (`.php` extensions)
- Pure PHP without frameworks (unless module chosen)
- If Framework module: Fastify/Node.js allowed

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="tech-sqlite"></a>
### ✓ Database SQLite

**What to check:** SQLite database used (if database needed)

**How to verify:**
```bash
# Look for SQLite database file
find . -name "*.db" -o -name "*.sqlite" -o -name "*.sqlite3"

# Check code for SQLite usage
grep -r "sqlite" backend/ --include="*.php" --include="*.ts" --include="*.js"
```

**Pass criteria:**
- SQLite database file exists
- Code references SQLite
- No other databases (MySQL, PostgreSQL) unless module

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="tech-docker"></a>
### ✓ Docker Single-Command Launch

**What to check:** Application launches with single Docker command

**How to verify:**
```bash
# Should work with one command
docker-compose up --build

# Or simpler
docker-compose up
```

**Pass criteria:**
- Single command launches everything
- No manual setup steps required
- All services start automatically

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="tech-spa"></a>
### ✓ Single Page Application (SPA)

**What to check:** Website is a Single Page Application

**How to verify:**
- Navigate through website
- Watch URL bar - should use # fragments or history API
- Page should NOT fully reload when navigating

**Ask team:**
- "Is this an SPA?"
- "How do you handle routing?"

**Pass criteria:**
- No full page reloads on navigation
- JavaScript handles routing
- Single HTML entry point

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="tech-firefox"></a>
### ✓ Browser Compatibility - Firefox

**What to check:** Works on latest stable Firefox

**How to verify:**
- Open Firefox browser
- Navigate to website
- Test all features

**Pass criteria:**
- Site loads correctly in Firefox
- All features work
- No browser-specific errors

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="tech-browser-nav"></a>
### ✓ Browser Back/Forward Buttons Work

**What to check:** Back/Forward navigation works in SPA

**How to verify:**
- Navigate through site (click several pages)
- Click browser Back button
- Click browser Forward button
- Should navigate correctly through history

**Pass criteria:**
- Back button goes to previous page
- Forward button goes forward
- URL updates correctly
- No broken states

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

### Website Accessibility & Registration Verification

<a id="web-accessible"></a>
### ✓ Website Fully Available

**What to check:** Website loads and is accessible

**How to verify:**
- Open browser, navigate to URL
- Should see homepage or login page
- All assets load (images, CSS, JS)

**Pass criteria:**
- Site loads without errors
- All resources accessible
- No 404 errors for assets

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="web-register"></a>
### ✓ Registration System Works

**What to check:** Users can register/subscribe

**How to verify:**
- Find registration/sign-up form
- Fill out with test data
- Submit registration
- Should see success message or redirect

**Pass criteria:**
- Registration form exists
- Form submits successfully
- User account created
- Can log in after registration

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="web-credentials"></a>
### ✓ Register with Username/Credentials

**What to check:** Registration requires username and credentials

**How to verify:**
- Registration form should have:
  - Username field
  - Password field
  - (Optional) Email field
- Try registering without required fields (should fail)

**Pass criteria:**
- Form requires username
- Form requires password
- Validation works

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="web-login"></a>
### ✓ Users Can Log In

**What to check:** Registered users can log in

**How to verify:**
- Use previously registered account
- Enter username and password
- Click login/sign in
- Should be authenticated

**Pass criteria:**
- Login form works
- Correct credentials accepted
- Incorrect credentials rejected
- Redirected after successful login

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="web-session"></a>
### ✓ Login Session Persists

**What to check:** Session persists after login

**How to verify:**
- Log in
- Navigate to different pages
- Refresh browser (F5)
- Should stay logged in

**Pass criteria:**
- Session persists across page navigation
- Session persists across refresh
- Session stored (cookies/localStorage/JWT)

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="web-no-errors"></a>
### ✓ No 500 Errors

**What to check:** No server errors during normal usage

**How to verify:**
- Use site normally
- Register, login, play game
- Check browser console (F12)
- Check browser Network tab

**Pass criteria:**
- No 500 Internal Server Error
- No 502/503/504 errors
- Server responds correctly

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

### Security Verification (MANDATORY - STOP IF MISSING)

<a id="sec-https"></a>
### ✓ HTTPS/TLS Encryption

**What to check:** Website uses HTTPS encryption

**How to verify:**

**Browser:**
1. Open website in browser
2. Check URL bar - should show `https://` with padlock icon
3. Click padlock → View certificate
4. Verify certificate is valid (not self-signed for production)

**Command line:**
```bash
curl -I https://localhost
# Should not show SSL errors
openssl s_client -connect localhost:443
# Should show certificate details
```

**Pass criteria:**
- URL uses `https://`
- Valid SSL/TLS certificate
- No browser security warnings
- Certificate not expired

**Fail criteria:**
- Uses `http://` without redirect to HTTPS
- Self-signed certificate in production
- Certificate expired
- SSL errors

**CRITICAL:** This is MANDATORY. Missing HTTPS is automatic fail.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="sec-wss"></a>
### ✓ WebSocket Security (WSS)

**What to check:** WebSocket connections are encrypted (WSS not WS)

**How to verify:**

**Browser DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. Start a game or chat
5. Check WebSocket connection URL

**Pass criteria:**
- WebSocket URL: `wss://` (not `ws://`)
- Connection shows in Network tab
- No security warnings

**Check in code:**
```bash
grep -r "ws://" frontend/src/
# Should return nothing or only comments
grep -r "wss://" frontend/src/
# Should find WebSocket connections
```

**Fail criteria:**
- Uses `ws://` (unencrypted)
- Mixed content warnings
- Connection not encrypted

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="sec-password-hash"></a>
### ✓ Password Hashing

**What to check:** Passwords are hashed, never plaintext

**How to verify:**
```bash
# Check database for passwords (if you can access)
# Passwords should be hashed strings, not readable text

# Ask team:
```

**Ask team:**
- "Show me how you store passwords"
- "What hashing algorithm do you use?" (bcrypt, Argon2, etc.)
- "Can you see passwords in the database?"

**Pass criteria:**
- Passwords hashed with bcrypt/Argon2/PBKDF2
- NOT stored in plaintext
- Team can explain hashing process

**CRITICAL:** Plaintext passwords = automatic fail

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="sec-sql-injection"></a>
### ✓ SQL Injection Protection

**What to check:** Server validates and escapes SQL queries

**How to verify:**

**Manual testing:**
1. Go to login page
2. Try username: `admin' OR '1'='1`
3. Try password: `' OR '1'='1' --`
4. Should NOT log in successfully

**More tests:**
```
Username: '; DROP TABLE users; --
Username: admin'--
Password: ' OR 1=1--
Search: '; DELETE FROM games; --
```

**Code inspection:**
```bash
# Check for parameterized queries (GOOD)
grep -r "?" backend/src/ | grep -i "query\|execute"
grep -r "\$1" backend/src/ | grep -i "query"

# Check for string concatenation (BAD)
grep -r "query.*+.*req\." backend/src/
grep -r "'.*\+.*params" backend/src/
```

**Pass criteria:**
- SQL injection attempts fail
- Error messages don't reveal database structure
- Code uses parameterized queries/prepared statements
- No string concatenation in SQL queries

**Example GOOD code:**
```javascript
db.query("SELECT * FROM users WHERE username = ?", [username])
```

**Example BAD code:**
```javascript
db.query("SELECT * FROM users WHERE username = '" + username + "'")
```

**Fail criteria:**
- SQL injection succeeds
- Can access other users' data
- Can modify database
- Error reveals database structure

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="sec-xss"></a>
### ✓ XSS Protection

**What to check:** User input is sanitized, scripts don't execute

**How to verify:**

**Manual testing:**
1. Go to profile edit or chat
2. Try entering: `<script>alert('XSS')</script>`
3. Try: `<img src=x onerror=alert('XSS')>`
4. Try: `<svg onload=alert('XSS')>`
5. Save and view - scripts should NOT execute

**More payloads:**
```html
<iframe src="javascript:alert('XSS')">
<body onload=alert('XSS')>
<input onfocus=alert('XSS') autofocus>
javascript:alert('XSS')
```

**Code inspection:**
```bash
# Check for input sanitization (GOOD)
grep -r "sanitize\|escape\|DOMPurify" backend/src/
grep -r "textContent\|innerText" frontend/src/

# Check for dangerous innerHTML (BAD if unsanitized)
grep -r "innerHTML.*req\.\|innerHTML.*input" frontend/src/
```

**Pass criteria:**
- XSS attempts display as text (not execute)
- Scripts are escaped: `&lt;script&gt;`
- User input sanitized server-side
- DOM methods use `textContent` not `innerHTML`

**Fail criteria:**
- Alert boxes appear
- Scripts execute
- Can inject malicious code
- innerHTML used with user input

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="sec-form-validation"></a>
### ✓ Server-Side Form Validation

**What to check:** All forms validated on server side

**How to verify:**
**Test:**
- Bypass client-side validation (F12 → Edit HTML)
- Submit invalid data directly
- Server should reject invalid data

**Ask team:**
- "Where do you validate forms?"
- "What happens if someone bypasses client-side validation?"

**Pass criteria:**
- Server validates all inputs
- Invalid data rejected
- NOT relying only on client-side validation

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="sec-input-sanitization"></a>
### ✓ Input Sanitization

**What to check:** All user inputs are sanitized

**Ask team:**
- "How do you sanitize user inputs?"
- "Show me the sanitization code"

**Pass criteria:**
- Inputs sanitized before storage
- Inputs sanitized before display
- Malicious content removed

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="sec-ssl-cert"></a>
### ✓ Valid SSL Certificates

**What to check:** SSL certificates are valid

**How to verify:**
- Click padlock in browser
- View certificate details
- Check expiration date
- Check issuer

**Pass criteria:**
- Certificate not expired
- For production: Valid CA-signed certificate
- For local/dev: Self-signed acceptable
- No certificate errors

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="sec-no-secrets"></a>
### ✓ No Secrets in Git

**What to check:** No API keys or secrets committed to Git

**How to verify:**
```bash
# Check Git history for secrets
git log --all --full-history --source -- .env

# Search for common secret patterns
grep -r "API_KEY\|SECRET\|PASSWORD" .git/

# Check if .env is in Git
git ls-files | grep .env
```

**Pass criteria:**
- No `.env` file in Git history
- No hardcoded API keys in code
- Secrets only in `.env` (gitignored)

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="sec-env-vars"></a>
### ✓ Sensitive Data in .env Only

**What to check:** Sensitive data stored in `.env` file

**How to verify:**
```bash
# Check .env exists
ls -la .env

# Check .env contains secrets
cat .env | grep -i "KEY\|SECRET\|PASSWORD"

# Verify .env NOT in Git
git ls-files | grep .env
```

**Pass criteria:**
- `.env` file exists
- Contains sensitive data
- NOT tracked by Git
- In `.gitignore`

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)


### The Game - Pong Verification

<a id="game-playable"></a>
### ✓ Game is Playable Locally

**What to check:** Live Pong game works locally.

**How to verify:**
- Launch app, start a match.
- Ensure ball serves, bounces, scores update.
- Play through several points.

**Pass criteria:**
- Game starts and runs without errors.
- Scoring increments properly.
- No freezes during play.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="game-2player"></a>
### ✓ Local 2-Player Keyboard

**What to check:** Two players can play on the same keyboard.

**How to verify:**
- Player1 and Player2 keys documented on-screen or in help.
- Each player can move their paddle simultaneously.

**Pass criteria:**
- Both paddles respond independently.
- No key conflicts blocking simultaneous input.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="game-keyboard"></a>
### ✓ Keyboard Control Mapping

**What to check:** Each player uses a distinct keyboard section.

**How to verify:**
- Inspect controls screen or code mapping.
- Press both players' keys together; verify independent movement.

**Pass criteria:**
- Distinct key sets per player.
- Simultaneous presses work (no ghosting issues for chosen keys).

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="game-paddle-speed"></a>
### ✓ Equal Paddle Speed

**What to check:** All players have identical paddle speed.

**How to verify:**
- Observe paddle movement; compare left vs right speed visually.
- If configurable, ensure default speeds are equal.

**Pass criteria:**
- No speed advantage between players.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="game-ai-speed"></a>
### ✓ AI Speed Matches Players

**What to check:** AI (if present) moves at same speed as humans.

**How to verify:**
- Play vs AI; compare paddle travel speed to human paddle.
- Review AI config for speed cap.

**Pass criteria:**
- AI paddle speed not faster than player paddles.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="game-rules"></a>
### ✓ Pong Rules Respected

**What to check:** Classic Pong rules: paddles, ball bounce, scoring.

**How to verify:**
- Ball bounces off paddles and walls correctly.
- Points awarded when ball passes a paddle.

**Pass criteria:**
- Correct scoring and reset after each point.
- No illegal physics glitches.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="game-controls"></a>
### ✓ Controls Explained or Intuitive

**What to check:** Controls are clear.

**How to verify:**
- Look for on-screen hints/help page.
- Ask team to point to control documentation.

**Pass criteria:**
- Player can discover controls without confusion.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="game-end"></a>
### ✓ End-Game State Handled

**What to check:** Game ends cleanly and shows result.

**How to verify:**
- Play to match end; observe winner display or proper exit.

**Pass criteria:**
- Winner/score shown; game can restart or exit without crash.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="game-realtime"></a>
### ✓ Real-Time Multiplayer

**What to check:** Multiplayer gameplay is real-time.

**How to verify:**
- Observe no noticeable input lag between action and movement.
- For network play (if present) ensure low latency updates.

**Pass criteria:**
- Ball/paddles update immediately for both players.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

### Tournament & Matchmaking Verification

<a id="tourney-system"></a>
### ✓ Tournament System Available

**What to check:** Tournament mode exists.

**How to verify:**
- Navigate to tournament UI; create a tournament.

**Pass criteria:**
- Can start a tournament flow without errors.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="tourney-multiplayer"></a>
### ✓ Multiple Players Supported

**What to check:** Multiple players can participate.

**How to verify:**
- Add several players/aliases; system accepts them.

**Pass criteria:**
- More than two players can be registered for tournament.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="tourney-turns"></a>
### ✓ Turn-Based Scheduling

**What to check:** Players take turns per schedule.

**How to verify:**
- Inspect bracket/queue shows next match and order.

**Pass criteria:**
- Clear sequence of matches; no overlaps unless intended.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="tourney-display"></a>
### ✓ Clear Display of Matches

**What to check:** UI shows who plays whom and order.

**How to verify:**
- View tournament bracket/queue page.

**Pass criteria:**
- Opponents and order visible and understandable.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="tourney-matchmaking"></a>
### ✓ Matchmaking Works

**What to check:** System automatically organizes matches

**How to verify:**
1. Add players to tournament
2. System should automatically:
   - Create bracket
   - Pair players
   - Schedule match order
   - Handle byes if needed
   - Advance winners

**Pass criteria:**
- No manual bracket creation needed
- System pairs players fairly
- Bracket generated automatically
- Winners advance automatically
- Logical pairing (1v8, 2v7, etc.)

**Fail criteria:**
- Manual pairing required
- Random unfair pairings
- Bracket errors
- Winners don't advance
- System can't handle odd numbers

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="tourney-announce"></a>
### ✓ Match Announcements

**What to check:** Next match is announced.

**How to verify:**
- Observe UI/chat/notification for “next match” info.

**Pass criteria:**
- Players informed of upcoming match pairing.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

### Registration in Tournament Verification

<a id="tourney-alias"></a>
### ✓ Alias Input at Start

**What to check:** Players input alias for tournament.

**How to verify:**
- Start tournament; prompted for alias per player.

**Pass criteria:**
- Alias required and stored for bracket display.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="tourney-reset"></a>
### ✓ Alias Reset on New Tournament

**What to check:** Aliases reset when starting new tournament.

**How to verify:**
- Finish/exit tournament; start a new one; ensure prior aliases cleared.

**Pass criteria:**
- Fresh alias entry required each new tournament (unless module overrides).

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="tourney-no-accounts"></a>
### ✓ No Persistent Accounts by Default

**What to check:** Default flow only needs alias (unless module changes).

**How to verify:**
- Start tournament without logging in; can still enter alias and play.

**Pass criteria:**
- Account creation not required for default tournament mode.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

### Error Handling - Lags & Disconnects Verification

<a id="error-disconnect"></a>
### ✓ Unexpected Disconnections Handled

**What to check:** Game/site survives disconnects gracefully.

**How to verify:**
- Simulate disconnect (disable network briefly); observe behavior.

**Pass criteria:**
- No crash; user gets clear message or reconnection flow.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="error-lag"></a>
### ✓ Lag Handling

**What to check:** Lags do not break gameplay.

**How to verify:**
- Introduce latency (if possible) or observe under load; ensure game remains playable.

**Pass criteria:**
- Game tolerates lag without freezing or desync catastrophes.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="error-stability"></a>
### ✓ Game Stability on Disconnects

**What to check:** Site/game does not crash on disconnect events.

**How to verify:**
- Drop connection mid-game; ensure app keeps running or exits gracefully.

**Pass criteria:**
- No uncaught exceptions; recover or show error without crash.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="error-reconnect"></a>
### ✓ Reconnection Features (Optional)

**What to check:** If implemented, reconnection works.

**How to verify:**
- After disconnect, reconnect network; attempt to rejoin match.

**Pass criteria:**
- User can resume or is guided clearly; if not implemented, mark as optional.

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)

---

<a id="error-pause"></a>
### ✓ Pause/Resume (Optional)

**What to check:** If implemented, pause/resume works.

**How to verify:**
- Use pause control; resume; ensure state persists.

**Pass criteria:**
- Game pauses and resumes without corruption (optional feature).

[↑ Back to checklist](#part-2-mandatory-part---technical-requirements)


<a id="part-4-specific-modules-details"></a>
## Part 4: Specific Modules - Verification Details

### V.1 Web Module

<a id="mod-v11-fastify"></a>
### ✓ Fastify + Node.js
- Check backend uses Fastify/Node entrypoint.
- Run `npm run start` (backend) and confirm Fastify boots without errors.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v11-server"></a>
### ✓ Fastify Server Starts
- Start server; ensure listening on expected port; no crash/restart.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v11-api"></a>
### ✓ API Endpoints Respond
- Call sample endpoints (health/login/profile) and expect 2xx/4xx with JSON.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v11-reqres"></a>
### ✓ Request/Response Handling
- Send valid/invalid payloads; server validates and returns proper codes.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v11-websocket"></a>
### ✓ WebSocket via Fastify
- Connect WebSocket; verify handshake succeeds; messages delivered both ways.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v12-tailwind"></a>
### ✓ Tailwind CSS Used
- Inspect frontend `tailwind.config.js` and generated CSS; Tailwind classes present.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v12-typescript"></a>
### ✓ TS for Styling/UI Logic
- Components written in TypeScript; no JS-only styling hacks.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v12-responsive"></a>
### ✓ Responsive UI
- Resize browser; layout adapts across breakpoints.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v12-compile"></a>
### ✓ CSS Compiles Cleanly
- Run `npm run build` (frontend); no Tailwind/postcss errors.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v12-no-conflicts"></a>
### ✓ No CSS Conflicts
- Visual scan: no overlapping/ broken styles; inspect for collision-free class usage.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v13-sqlite"></a>
### ✓ SQLite Used
- Check DB file (*.sqlite/db); inspect config uses SQLite driver.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v13-persist"></a>
### ✓ DB Persists
- Restart app; data remains; DB file persists on disk.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v13-queries"></a>
### ✓ Queries Execute
- Run CRUD path; ensure inserts/reads succeed without errors.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v13-data"></a>
### ✓ Data Stored/Retrieved
- Create sample record; fetch it; values match.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v13-no-errors"></a>
### ✓ No DB Connection Errors
- Observe logs; no connection/refused errors during typical use.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v14-avalanche"></a>
### ✓ Avalanche Blockchain
- Config/SDK points to Avalanche (testnet ok); endpoints reachable.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v14-solidity"></a>
### ✓ Solidity Contracts Implemented
- Review contract files; compile/deploy succeeds.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v14-scores"></a>
### ✓ Scores Stored On-Chain
- Play/report tournament; scores written via contract tx; verify on explorer/local node.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v14-deploy"></a>
### ✓ Contracts Deploy Successfully
- Deployment script runs without revert; contract address recorded.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v14-testnet"></a>
### ✓ Testnet Usage (Optional)
- If using testnet, confirm network config and faucet-funded account.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v14-tested"></a>
### ✓ Blockchain Integration Tested
- Demonstrate read/write round-trip; show tx hashes.

[↑ Back to checklist](#part-4-specific-modules-details)

### V.3 User Management Module

<a id="mod-v31-reg-login"></a>
### ✓ Secure Registration/Login
- Register and log in user; passwords hashed; flows work.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v31-avatars"></a>
### ✓ Avatars Upload/Set
- Upload avatar; appears in profile; default shown when absent.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v31-friends"></a>
### ✓ Friend Lists
- Add/remove friend; list updates; persisted.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v31-online"></a>
### ✓ Online Status
- Presence indicator updates when user connects/disconnects.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v31-stats"></a>
### ✓ Player Stats
- Wins/losses shown and updated after matches.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v31-history"></a>
### ✓ Match History
- Past matches listed with date/opponent/result.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v31-profiles"></a>
### ✓ User Profiles Complete
- Profile shows avatar, alias, stats, friends/links.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v32-oauth"></a>
### ✓ OAuth 2.0 Implemented
- Start OAuth login; redirect flow completes; token received.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v32-provider"></a>
### ✓ Provider Configured
- At least one provider (Google/GitHub/etc.) configured and working.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v32-tokens"></a>
### ✓ Secure Token Handling
- Tokens stored server-side securely; no leaks in logs/front-end.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v32-userdata"></a>
### ✓ Correct User Data Fetch
- After OAuth, user data matches provider profile (name/email/id).

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v32-session"></a>
### ✓ OAuth Session Persists
- Refresh page; session remains; tokens validated/renewed as needed.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v32-fallback"></a>
### ✓ Fallback to Standard Login
- If OAuth fails/denied, user can still log in via standard form.

[↑ Back to checklist](#part-4-specific-modules-details)

### V.4 Gameplay & UX Module

<a id="mod-v41-remote"></a>
### ✓ Remote Players
- Two players on separate machines can join same game and play.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v41-sync"></a>
### ✓ Real-Time Sync
- Ball/paddle states sync between clients with minimal delay.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v41-lag"></a>
### ✓ Lag Handling
- Under latency, game remains playable (no severe desync/crash).

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v41-disconnect"></a>
### ✓ Disconnect Handling
- If player drops, game handles gracefully (pause/AI/forfeit message).

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v41-identity"></a>
### ✓ Player Identification
- UI clearly labels which paddle belongs to which player.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v41-network"></a>
### ✓ Real-Time Transport
- Uses WebSocket or equivalent; messages delivered reliably/in-order.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v42-3players"></a>
### ✓ >2 Players Supported
- Start a game with 3+ players; all can control simultaneously.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v42-logic"></a>
### ✓ Multiplayer Game Logic
- Scoring/rules adapt to N players; no broken win conditions.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v42-board"></a>
### ✓ Board Layout Fits Players
- Board (e.g., square) accommodates extra paddles without overlap.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v42-turns"></a>
### ✓ Turn Order or Simultaneous Play
- If turn-based, order is clear; if simultaneous, collisions/rules work.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v42-win"></a>
### ✓ Clear Win Condition
- Game ends with clear winner logic for multi-player scenario.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v43-newgame"></a>
### ✓ Second Game Implemented
- Access non-Pong game; it runs without errors.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v43-rules"></a>
### ✓ New Game Rules Defined
- Rules documented in UI/help; gameplay matches rules.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v43-state"></a>
### ✓ Game State Tracked
- State (score/progress) stored and restored correctly during play.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v43-history"></a>
### ✓ Match History for New Game
- Matches recorded with opponents/time/result.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v43-matchmaking"></a>
### ✓ Matchmaking Works for New Game
- Can queue/join matches for the second game; pairing succeeds.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v43-ui"></a>
### ✓ UI Integration for New Game
- New game selectable from main UI; navigation works.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v44-powerups"></a>
### ✓ Power-Ups (if chosen)
- Power-ups appear and function as intended; no crashes.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v44-attacks"></a>
### ✓ Attacks (if chosen)
- Attack mechanics work; balanced impact.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v44-maps"></a>
### ✓ Different Maps (if chosen)
- Multiple maps selectable; render/layout correctly.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v44-menu"></a>
### ✓ Customization Menu
- UI to choose custom options; selections apply in-game.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v44-balance"></a>
### ✓ Balanced Gameplay
- Custom options do not break fairness; playtest for imbalance.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v45-dm"></a>
### ✓ Direct Messages
- Send/receive DM between users in real time.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v45-history"></a>
### ✓ Message History
- Prior messages load when opening chat; persists after reload.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v45-blocking"></a>
### ✓ User Blocking
- Block action hides future messages and prevents contact.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v45-blocked-behavior"></a>
### ✓ Blocked User Behavior
- Blocked users cannot message or view blocker; verify UI/state.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v45-invites"></a>
### ✓ Game Invites via Chat
- Send invite from chat; recipient can accept and join game.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v45-tournament"></a>
### ✓ Tournament Notifications in Chat
- Chat surfaces next-match/announcement messages.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v45-realtime"></a>
### ✓ Real-Time Delivery
- Messages appear instantly without refresh.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v45-online"></a>
### ✓ Online Indicators in Chat
- Presence badges show accurate online/offline status.

[↑ Back to checklist](#part-4-specific-modules-details)

### V.5 AI-Algo Module

<a id="mod-v51-ai-impl"></a>
### ✓ AI Opponent Implemented
- AI paddle moves and plays; not static.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v51-keyboard"></a>
### ✓ AI Simulates Keyboard Input
- Implementation simulates key events (or equivalent) not teleporting paddles.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v51-frequency"></a>
### ✓ 1s View/Decision Interval
- AI updates roughly once per second; confirm timing logic.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v51-speed"></a>
### ✓ AI Speed Same as Players
- AI paddle speed capped to player speed.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v51-logic"></a>
### ✓ AI Logic Makes Sense
- AI predicts bounces; not random; can occasionally win.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v51-no-astar"></a>
### ✓ No A* Used
- Confirm code avoids A* pathfinding; explain chosen algorithm.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v51-difficulty"></a>
### ✓ Challenging Difficulty
- Play vs AI; feels competitive, not trivial or impossible.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v51-tested"></a>
### ✓ AI Playtested
- Demo AI vs human; show stable behavior over several rallies.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v52-user-stats"></a>
### ✓ User Stats Dashboard
- Dashboard shows per-user metrics; values update with play.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v52-game-stats"></a>
### ✓ Game Session Dashboard
- Session metrics (scores, duration) displayed.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v52-charts"></a>
### ✓ Charts/Graphs Render
- Visual charts load without errors; data correct.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v52-realtime"></a>
### ✓ Real-Time Updates
- Dashboards update live during play or on refresh interval.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v52-accuracy"></a>
### ✓ Data Accuracy
- Cross-check counts vs actual matches; no off-by-one.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v52-views"></a>
### ✓ Multiple Views Available
- Different dashboard views/filters work.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v52-responsive"></a>
### ✓ Responsive Dashboards
- Dashboards usable on various screen sizes.

[↑ Back to checklist](#part-4-specific-modules-details)

### V.6 Cybersecurity Module

<a id="mod-v61-waf"></a>
### ✓ WAF/ModSecurity Enabled
- Confirm WAF running; test blocked request signature.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v61-rules"></a>
### ✓ Effective WAF Rules
- Ruleset loaded; basic attack payloads blocked (SQLi/XSS patterns).

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v61-vault"></a>
### ✓ HashiCorp Vault Integrated
- Vault server reachable; app reads secrets from Vault.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v61-secrets"></a>
### ✓ Secrets Stored Securely
- Secrets reside in Vault paths; not in code or Git.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v61-rotation"></a>
### ✓ Secret Rotation Possible
- Demonstrate updating secret in Vault and app picking new value.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v61-auth"></a>
### ✓ Vault Authentication Configured
- App authenticates to Vault (token/approle); no hardcoded root tokens.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v61-encryption"></a>
### ✓ Encryption In Transit/At Rest
- TLS to Vault; Vault storage encrypted; verify configs.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v62-anonymize"></a>
### ✓ Data Anonymization
- Provide anonymize flow; after request, personal data scrubbed/pseudonymized.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v62-local"></a>
### ✓ Local Data Storage Option
- Setting allows storing data locally (not external); show config.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v62-deletion"></a>
### ✓ Account Deletion
- Request deletion removes personal data; account inaccessible afterward.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v62-export"></a>
### ✓ Data Export
- User can download/export their data in readable format.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v62-policy"></a>
### ✓ Privacy Policy Documented
- Privacy policy page exists; accessible from UI.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v62-consent"></a>
### ✓ User Consent Collected
- Consent prompts for data usage; stored with timestamp/version.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v62-forget"></a>
### ✓ Right to Forget
- Erasure request honored; data deleted/irreversible.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v63-2fa"></a>
### ✓ Two-Factor Authentication
- Enable 2FA for an account; login requires second factor.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v63-method"></a>
### ✓ 2FA Method Works
- SMS/app/email codes delivered and accepted.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v63-recovery"></a>
### ✓ Recovery Codes Provided
- User receives backup codes; codes function once each.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v63-jwt"></a>
### ✓ JWT Implemented
- Auth uses signed JWTs; inspect token payload/headers.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v63-signing"></a>
### ✓ JWT Signing Correct
- Tokens signed with secret/private key; signature validates.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v63-validation"></a>
### ✓ JWT Validation Enforced
- Protected endpoints reject missing/invalid/expired tokens.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v63-expiry"></a>
### ✓ Token Expiry Set
- Tokens include reasonable expiration; expired tokens fail gracefully.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v63-refresh"></a>
### ✓ Refresh Tokens Work
- Refresh flow issues new access token securely; revokes on logout if implemented.

[↑ Back to checklist](#part-4-specific-modules-details)

### V.7 DevOps Module

<a id="mod-v71-elasticsearch"></a>
### ✓ Elasticsearch Running
- Service up; indexes exist; health status green/yellow acceptable.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v71-logstash"></a>
### ✓ Logstash Parses/Ships Logs
- Pipeline config present; logs flow into Elasticsearch.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v71-kibana"></a>
### ✓ Kibana Dashboard Functional
- Kibana reachable; can view indexes/dashboards.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v71-collection"></a>
### ✓ Log Collection Complete
- App logs are ingested; no major sources missing.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v71-storage"></a>
### ✓ Logs Stored in ES
- Logs searchable in Elasticsearch with timestamps/fields.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v71-queries"></a>
### ✓ Log Queries Work
- Run Kibana query/filter; results accurate.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v71-retention"></a>
### ✓ Log Retention Policy
- Retention configured (ILM/curator); confirm policy duration.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v71-monitoring"></a>
### ✓ Monitoring via ELK
- Dashboards/alerts for app health or error rates configured.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v72-prometheus"></a>
### ✓ Prometheus Deployed
- Prometheus endpoint reachable; targets up.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v72-metrics"></a>
### ✓ Metrics Collected
- /metrics exposes app/system metrics; scraped successfully.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v72-grafana"></a>
### ✓ Grafana Dashboards
- Grafana reachable; dashboards display data from Prometheus.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v72-visualization"></a>
### ✓ Metrics Visualized
- Charts show CPU/mem/requests; no broken panels.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v72-alerts"></a>
### ✓ Alerts Configured
- Alert rules exist (e.g., high latency/error rate); test firing if possible.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v72-system"></a>
### ✓ System Metrics Tracked
- CPU/memory tracked for key services; verify values update.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v72-uptime"></a>
### ✓ Uptime Monitored
- Uptime probe/checks in place; downtime would alert.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v73-coupled"></a>
### ✓ Services Loosely Coupled
- Services independent; minimal shared state/tight coupling.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v73-discovery"></a>
### ✓ Service Discovery
- Discovery mechanism (DNS/env/service registry) resolves service endpoints.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v73-communication"></a>
### ✓ Inter-Service Communication
- REST/queue/gRPC calls succeed between services.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v73-scalability"></a>
### ✓ Scalable Independently
- Can scale services separately (config or container replicas).

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v73-data"></a>
### ✓ Data Isolation
- Each service has its own datastore/schema; no unintended coupling.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v73-gateway"></a>
### ✓ API Gateway Routes Correctly
- Gateway forwards requests to proper services; paths map correctly.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v73-containers"></a>
### ✓ Containerized Services
- Each service runs in its own container/image; compose/k8s manifests present.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v73-orchestration"></a>
### ✓ Orchestration in Place
- Orchestrator (docker-compose/k8s) can start/stop all services reliably.

[↑ Back to checklist](#part-4-specific-modules-details)

### V.8 Graphics Module

<a id="mod-v81-babylonjs"></a>
### ✓ Babylon.js Used
- Code imports/uses Babylon.js for rendering.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v81-3d-pong"></a>
### ✓ 3D Pong Renders
- Launch 3D mode; paddles/ball render in 3D scene.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v81-visuals"></a>
### ✓ Advanced 3D Visuals
- Effects/materials/shaders present beyond bare-bones.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v81-lighting"></a>
### ✓ Lighting Implemented
- Scene has lights; objects lit/shadowed correctly.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v81-textures"></a>
### ✓ Textures/Materials Applied
- Surfaces textured; no missing/blank materials.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v81-camera"></a>
### ✓ Camera Controls Work
- Camera can move/orbit; controls responsive.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v81-performance"></a>
### ✓ 3D Performance Acceptable
- Frame rate smooth on test hardware; no major jank.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v81-browser"></a>
### ✓ Cross-Browser 3D
- 3D mode works in target browsers (at least Firefox + one more if applicable).

[↑ Back to checklist](#part-4-specific-modules-details)

### V.9 Accessibility Module

<a id="mod-v91-desktop"></a>
### ✓ Desktop Layout
- Desktop view renders correctly; no overflow.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v91-mobile"></a>
### ✓ Mobile Layout
- Mobile breakpoint tested; controls usable via touch.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v91-tablet"></a>
### ✓ Tablet Layout
- Tablet-sized viewport renders correctly.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v91-breakpoints"></a>
### ✓ Breakpoints Configured
- CSS breakpoints defined; elements reposition at expected widths.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v91-touch"></a>
### ✓ Touch Input Works
- Touch interactions (buttons/controls/game) respond properly.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v91-layout"></a>
### ✓ Adaptive Layout
- Content reflows without overlap at all sizes.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v91-images"></a>
### ✓ Responsive Images
- Images scale/resize appropriately; use srcset/responsive sizing if needed.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v92-firefox"></a>
### ✓ Firefox Support
- Test in latest Firefox; all features work.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v92-second"></a>
### ✓ Second Browser Support
- Test in chosen second browser (Chrome/Safari/Edge); confirm functionality.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v92-testing"></a>
### ✓ Cross-Browser Testing Done
- Document test results for supported browsers.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v92-fallbacks"></a>
### ✓ Fallbacks/Polyfills
- Older feature fallbacks/polyfills enabled where needed.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v93-switcher"></a>
### ✓ Language Switcher
- UI control switches languages; strings change accordingly.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v93-languages"></a>
### ✓ 3+ Languages Supported
- At least three languages available and selectable.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v93-translation"></a>
### ✓ Text Translated
- Core UI/content translated; no leftover source language strings.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v93-persistence"></a>
### ✓ Language Persistence
- Preference saved (cookie/localStorage/server) and restored on reload.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v93-rtl"></a>
### ✓ RTL Support (if used)
- RTL languages render correctly with direction set.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v94-screen-reader"></a>
### ✓ Screen Reader Support
- Run screen reader; UI elements announced properly.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v94-alt-text"></a>
### ✓ Alt Text for Images
- Images have descriptive alt attributes.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v94-aria"></a>
### ✓ ARIA Labels
- Form inputs/controls have appropriate aria-label/aria-labelledby.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v94-contrast"></a>
### ✓ High Contrast Option
- High-contrast mode available and functional.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v94-text-size"></a>
### ✓ Adjustable Text Size
- Users can increase/decrease text size; layout holds.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v94-keyboard"></a>
### ✓ Keyboard Navigation
- Tab through UI; focus order logical; actions via keyboard.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v94-focus"></a>
### ✓ Focus Indicators
- Visible focus rings on interactive elements.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v94-wcag"></a>
### ✓ Color Contrast Meets WCAG
- Contrast checks pass (e.g., 4.5:1 for text).

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v95-ssr"></a>
### ✓ SSR Implemented
- Pages render server-side; view page source shows rendered HTML.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v95-initial"></a>
### ✓ Initial Render from Server
- First paint includes content without JS; no blank flash.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v95-seo"></a>
### ✓ SEO-Friendly
- Meta tags/content present in server-rendered HTML.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v95-performance"></a>
### ✓ Performance Improved
- Measure load time/LCP improved vs CSR; no regressions.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v95-hydration"></a>
### ✓ Hydration Works
- Client JS hydrates without errors; interactions functional after load.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v95-meta"></a>
### ✓ Meta Tags Rendered Server-Side
- Title/description/og tags present in server response.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v95-routes"></a>
### ✓ Dynamic Routes SSR'd
- Dynamic pages pre-rendered on server; navigate directly works.

[↑ Back to checklist](#part-4-specific-modules-details)

### V.10 Server-Side Pong Module

<a id="mod-v101-logic"></a>
### ✓ Server-Side Game Logic
- Logic runs server-side; server authoritative for state.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v101-ball"></a>
### ✓ Ball Physics on Server
- Ball movement computed server-side; clients mirror state.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v101-scoring"></a>
### ✓ Server Scoring
- Server updates score; clients display received score.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v101-interactions"></a>
### ✓ Player Input Processed Server-Side
- Client sends inputs; server applies and broadcasts updates.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v101-endpoints"></a>
### ✓ API for Game Init
- API endpoint initializes matches; returns tokens/ids.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v101-control"></a>
### ✓ Game Control API
- Endpoints allow join/start/pause or similar controls.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v101-state"></a>
### ✓ Game State API
- Endpoint/WS provides current state snapshot.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v101-sync"></a>
### ✓ Clients Sync to Server State
- Clients stay in sync; reconcile state from server updates.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v101-validation"></a>
### ✓ Input Validation Server-Side
- Server validates inputs; ignores invalid/cheat attempts.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v101-realtime"></a>
### ✓ Real-Time Updates via WS
- WebSocket pushes updates promptly; low latency observed.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v102-cli"></a>
### ✓ CLI Application Exists
- Run CLI; see prompts/usage; it starts without errors.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v102-connection"></a>
### ✓ CLI Connects to API
- CLI contacts API endpoints; receives responses.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v102-auth"></a>
### ✓ CLI Authentication Works
- Login via CLI succeeds; tokens/sessions established.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v102-gameplay"></a>
### ✓ CLI Gameplay Functional
- Play Pong via CLI controls; ball/paddles respond.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v102-web-match"></a>
### ✓ CLI vs Web Users
- CLI user can join match against web player; sync ok.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v102-sync"></a>
### ✓ Real-Time Sync CLI/Web
- Movements/states consistent between CLI and web clients.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v102-controls"></a>
### ✓ CLI Controls Intuitive
- Controls documented; arrow/WASD/etc. work.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v102-match-create"></a>
### ✓ CLI Match Creation/Join
- CLI can create or join matches successfully.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v102-invites"></a>
### ✓ CLI Match Invites
- CLI can send/receive invites with web players.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v102-updates"></a>
### ✓ Real-Time Game Updates in CLI
- Score/state updates stream to CLI during play.

[↑ Back to checklist](#part-4-specific-modules-details)

<a id="mod-v102-docs"></a>
### ✓ CLI Documentation
- README/help text explains CLI usage and commands.

[↑ Back to checklist](#part-4-specific-modules-details)

