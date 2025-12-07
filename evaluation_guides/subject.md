# ft_transcendence Subject (Version 18.0)

## 1. Overview & Objectives
**Project Context:**
[cite_start]This project involves undertaking tasks you have never done before to develop adaptation and problem-solving skills[cite: 3, 16]. [cite_start]You will create a website for a Pong contest[cite: 84].
* [cite_start]**The Surprise:** You will face unknown technologies intentionally[cite: 17].
* [cite_start]**Modules System:** The project consists of a mandatory part and a list of modules[cite: 19]. [cite_start]To achieve 100% completion, you need **7 Major Modules**[cite: 178]. [cite_start](Note: 1 Major Module = 2 Minor Modules [cite: 188]).

---

## 2. AI Instructions
* [cite_start]**Usage:** Use AI to reduce repetitive tasks, but critically assess results[cite: 38, 42].
* **Constraints:**
    * [cite_start]Do not copy-paste code you cannot explain[cite: 71, 72].
    * [cite_start]Reflect on problems before prompting[cite: 49].
    * [cite_start]Always validate AI output with peers[cite: 51].

---

## 3. Mandatory Part (Minimal Requirements)
*If you choose specific modules, they may override these defaults.*

### Technical Stack
* [cite_start]**Backend:** Pure PHP (No frameworks allowed in mandatory part)[cite: 106].
* [cite_start]**Frontend:** TypeScript (Base code)[cite: 109].
* [cite_start]**Database:** If used, must follow Database module constraints (SQLite)[cite: 108, 249].
* **Containerization:** Docker required. [cite_start]Must launch with a single command (e.g., `docker-compose up`)[cite: 115].
* **Architecture:** Single Page Application (SPA). [cite_start]Back/Forward buttons must work[cite: 111].
* [cite_start]**Browser:** Compatible with the latest Firefox[cite: 112].

### The Game (Pong)
* [cite_start]**Core:** Real-time multiplayer Pong[cite: 87].
* [cite_start]**Controls:** Two players on one keyboard (unless Remote module is selected)[cite: 129].
* [cite_start]**Tournament:** Implementation of a tournament system with matchmaking[cite: 130, 138].
* [cite_start]**Identity:** Users input an alias for the tournament (unless User Mgmt module is selected)[cite: 133].

### Security (Mandatory)
* [cite_start]**Passwords:** Hashed[cite: 162].
* [cite_start]**Protection:** SQL Injection and XSS protection[cite: 163].
* [cite_start]**HTTPS:** Mandatory for all connections (including WSS)[cite: 164].
* [cite_start]**Validation:** Server-side validation for forms/inputs[cite: 165].
* [cite_start]**Credentials:** API keys/Env variables must be in a `.env` file (not committed to Git)[cite: 172].

---

## 4. Modules
*Reminder: 7 Major Modules required for 100%.*

### V.1 Web
* [cite_start]**[Major] Backend Framework:** Use **Fastify** with **Node.js**[cite: 239].
* [cite_start]**[Minor] Frontend Framework:** Use **Tailwind CSS** + TypeScript[cite: 244].
* [cite_start]**[Minor] Database:** Use **SQLite** for all DB instances[cite: 249].
* [cite_start]**[Major] Blockchain:** Store tournament scores on the **Avalanche** blockchain using **Solidity** smart contracts (Testing environment allowed)[cite: 253, 258].

### V.3 User Management
* **[Major] Standard User Management:**
    * [cite_start]Secure subscribe/login[cite: 273, 274].
    * [cite_start]Avatars, Friend lists, Online status[cite: 277, 278].
    * [cite_start]Stats (Wins/Losses) and Match History[cite: 279, 280].
* [cite_start]**[Major] Remote Authentication:** Implement **OAuth 2.0** (Google, GitHub, etc.)[cite: 283, 288].

### V.4 Gameplay & UX
* [cite_start]**[Major] Remote Players:** Two players on separate computers playing the same game[cite: 304]. [cite_start]Handle lag/disconnects[cite: 306].
* [cite_start]**[Major] Multiplayer:** Game for >2 players (e.g., 4 players on a square board)[cite: 307, 312].
* [cite_start]**[Major] New Game:** Add a second, distinct game (not Pong) with history and matchmaking[cite: 314].
* [cite_start]**[Minor] Game Customization:** Power-ups, attacks, or different maps[cite: 329].
* [cite_start]**[Major] Live Chat:** Direct messages, blocking users, game invites, tournament notifications[cite: 335, 339].

### V.5 AI-Algo
* **[Major] AI Opponent:**
    * [cite_start]Simulate keyboard input[cite: 352].
    * [cite_start]AI view refreshes only once per second[cite: 353].
    * [cite_start]**Constraint:** A* algorithm is **prohibited**[cite: 350].
* [cite_start]**[Minor] Dashboards:** Visual stats for users and game sessions (charts/graphs)[cite: 361, 370].

### V.6 Cybersecurity
* **[Major] WAF & Vault:**
    * [cite_start]Implement Web Application Firewall / ModSecurity[cite: 382].
    * [cite_start]Use **HashiCorp Vault** for secrets management[cite: 386].
* [cite_start]**[Minor] GDPR Compliance:** Anonymization, local data management, Account Deletion[cite: 388].
* [cite_start]**[Major] 2FA & JWT:** Implement Two-Factor Authentication (SMS/App/Email) and JSON Web Tokens[cite: 407, 410].

### V.7 DevOps
* [cite_start]**[Major] Infrastructure (ELK):** Elasticsearch, Logstash, Kibana for log management[cite: 422].
* [cite_start]**[Minor] Monitoring:** Prometheus and Grafana for system metrics[cite: 431].
* [cite_start]**[Major] Microservices:** Backend architected as loosely-coupled microservices[cite: 444].

### V.8 Graphics
* [cite_start]**[Major] 3D Techniques:** Use **Babylon.js** for advanced 3D visuals[cite: 460].

### V.9 Accessibility
* [cite_start]**[Minor] Support all devices:** Responsive design (Desktop/Mobile/Tablet)[cite: 474].
* [cite_start]**[Minor] Browser Compatibility:** Add support for one additional browser (beyond Firefox)[cite: 480].
* [cite_start]**[Minor] Multi-language:** Support at least 3 languages with a switcher[cite: 488, 491].
* [cite_start]**[Minor] Visually Impaired:** Screen reader support, Alt text, High-contrast, Text sizing[cite: 501].
* [cite_start]**[Minor] Server-Side Rendering (SSR):** Integrate SSR for performance/SEO[cite: 510].

### V.10 Server-Side Pong
* **[Major] Server-Side Logic + API:** Move Pong logic to server. [cite_start]API allows game initialization and control[cite: 522].
* [cite_start]**[Major] CLI Gameplay:** Create a CLI application that connects via API to play against Web users[cite: 531].

---

## 5. Bonus Part
* [cite_start]**Condition:** Mandatory part must be **PERFECT** to evaluate bonus[cite: 554].
* **Scoring:** 5 points per extra Minor module; [cite_start]10 points per extra Major module[cite: 551, 552].

---

## 6. General Rules & Evaluation
* [cite_start]**Libraries:** Libraries providing an "immediate complete solution" are prohibited[cite: 93]. [cite_start]Small libraries for subcomponents are allowed but must be justified[cite: 95].
* [cite_start]**Submission:** Only work inside the Git repository is evaluated[cite: 560].
* [cite_start]**Modification:** You may be asked to perform a "live" code modification during defense to prove understanding[cite: 568].