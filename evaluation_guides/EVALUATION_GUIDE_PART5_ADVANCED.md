# ft_transcendence - Detailed Evaluation Guide - PART 5: ADVANCED MODULES

**Version:** 18.0 | **Part 5 of 5**

This guide covers DevOps, Graphics, Accessibility, and Server-Side Pong modules.

---

## V.7 DEVOPS MODULES

### Infrastructure - ELK Stack [MAJOR - 2 points]

**Requirements:**
- Elasticsearch (log storage)
- Logstash (log processing)
- Kibana (visualization)

#### Verification Steps:

**1. Check Containers Running:**
```bash
docker-compose ps
```
Should see:
- elasticsearch
- logstash
- kibana

**2. Access Kibana:**
1. Open browser
2. Navigate to: `http://localhost:5601`
3. Kibana interface should load

**3. Check Elasticsearch:**
```bash
curl http://localhost:9200
```
Should return JSON with cluster info

**4. Verify Logs Collection:**
1. In Kibana, go to "Discover" or "Logs"
2. Select index pattern (e.g., `logs-*`)
3. Should see application logs
4. Filter by:
   - Service name
   - Log level (info, error, warn)
   - Timestamp

**5. Test Log Flow:**
1. Perform action on website (e.g., login, play game)
2. Check Kibana within 30 seconds
3. New logs should appear

**6. Check Logstash Pipeline:**
```bash
docker exec -it <logstash_container> cat /usr/share/logstash/pipeline/logstash.conf
```
Should show input, filter, output configuration

**7. Query Logs:**
In Kibana, try searches:
- `level: "error"` (show only errors)
- `service: "backend"` (backend logs)
- `message: "login"` (login-related logs)

**8. Check Index Management:**
1. In Kibana, go to Management → Index Management
2. Verify indices created
3. Check index size and document count

**Pass criteria:**
- [ ] All 3 services running
- [ ] Kibana accessible
- [ ] Elasticsearch stores logs
- [ ] Logstash processes logs
- [ ] Logs searchable in Kibana
- [ ] Real-time log collection works

---

### Monitoring - Prometheus & Grafana [MINOR - 1 point]

**Requirements:**
- Prometheus (metrics collection)
- Grafana (metrics visualization)

#### Verification Steps:

**1. Check Containers:**
```bash
docker-compose ps | grep -E "prometheus|grafana"
```

**2. Access Prometheus:**
1. Open browser
2. Navigate to: `http://localhost:9090`
3. Prometheus UI should load
4. Click "Status" → "Targets"
5. Verify targets are "UP"

**3. Query Metrics:**
In Prometheus:
1. Go to "Graph" tab
2. Try queries:
   - `up` (service availability)
   - `http_requests_total` (request count)
   - `node_cpu_seconds_total` (CPU usage)
3. Click "Execute"
4. Should see data

**4. Access Grafana:**
1. Navigate to: `http://localhost:3001`
2. Login (default: admin/admin)
3. Grafana dashboard should load

**5. Check Data Source:**
1. In Grafana, go to Configuration → Data Sources
2. Should see Prometheus configured
3. Click "Test" → Should show "Data source is working"

**6. View Dashboards:**
1. Go to Dashboards
2. Should see pre-configured dashboards:
   - System metrics
   - Application metrics
   - Request rates
3. Verify graphs show real data

**7. Test Real-Time Updates:**
1. Watch dashboard for 30 seconds
2. Metrics should update
3. Play a game on website
4. Check if request metrics increase

**8. Check Alerts (if configured):**
1. In Grafana, go to Alerting → Alert Rules
2. Verify alert rules exist (optional)

**Pass criteria:**
- [ ] Prometheus running
- [ ] Grafana running
- [ ] Prometheus collecting metrics
- [ ] Grafana connected to Prometheus
- [ ] Dashboards show real data
- [ ] Metrics update in real-time
- [ ] System health visible

---

### Microservices Architecture [MAJOR - 2 points]

**Requirements:**
- Backend split into loosely-coupled services
- Service independence
- Inter-service communication

#### Verification Steps:

**1. Check Service Separation:**
```bash
docker-compose ps
```
Should see multiple backend services:
- auth-service
- game-service
- user-service
- chat-service
- etc.

**2. Verify docker-compose.yml:**
```bash
cat docker-compose.yml
```
Look for multiple service definitions, each in separate container

**3. Check Service Independence:**
1. Stop one service:
   ```bash
   docker-compose stop auth-service
   ```
2. Test if other services still work
3. Verify graceful degradation

**4. Service Discovery:**
```bash
cat backend/auth-service/src/config.ts
```
Look for service URLs:
```typescript
USER_SERVICE_URL: 'http://user-service:3001'
GAME_SERVICE_URL: 'http://game-service:3002'
```

**5. Check API Gateway (if used):**
```bash
docker ps | grep gateway
```
Verify API gateway routes requests to services

**6. Inter-Service Communication:**
1. Trace a request flow:
   - User logs in → auth-service
   - Auth-service calls → user-service
   - User-service returns data → auth-service
   - Auth-service responds to client
2. Check logs to verify communication

**7. Database Isolation:**
```bash
ls backend/*/database/
```
Each service should have isolated data OR use separate DB schemas

**8. Test Service Scaling:**
```bash
docker-compose up --scale game-service=3
```
Verify multiple instances can run

**9. Check Service Contracts:**
Ask team:
- "Show me how services communicate"
- "What protocol? (REST? gRPC?)"
- "How do you handle service failures?"

**Pass criteria:**
- [ ] Multiple backend services
- [ ] Each service in separate container
- [ ] Services communicate via API
- [ ] Services independently deployable
- [ ] Data isolation between services
- [ ] Service discovery implemented
- [ ] Graceful failure handling
- [ ] Team explains architecture

---

## V.8 GRAPHICS MODULE

### 3D Techniques - Babylon.js [MAJOR - 2 points]

**Requirements:**
- Use Babylon.js for 3D rendering
- Advanced 3D visuals for Pong

#### Verification Steps:

**1. Check Package.json:**
```bash
cat frontend/package.json | grep babylon
```
Should show: `"@babylonjs/core"`

**2. Find 3D Game:**
1. Navigate main menu
2. Look for "3D Pong" or "3D Game" option
3. Launch 3D mode

**3. Verify 3D Rendering:**
1. Game should render in 3D
2. Observe:
   - 3D paddles (not flat)
   - 3D ball (sphere)
   - 3D playing field
   - Perspective camera view

**4. Check Camera Controls:**
1. Test if camera can:
   - Rotate around field OR
   - Follow ball OR
   - Switch views
2. Verify 3D perspective changes

**5. Test 3D Lighting:**
1. Observe lighting effects:
   - Shadows on paddles
   - Highlights on ball
   - Light sources visible
2. Should NOT be flat 2D

**6. Check Textures/Materials:**
1. Paddles should have materials (color, reflection)
2. Ball should have texture
3. Field should have surface material

**7. Performance Check:**
1. Play 3D game
2. Should run smoothly (30+ fps)
3. Check browser console for WebGL errors

**8. Code Review:**
```bash
cat frontend/src/views/GamePage3D.ts | head -50
```
Look for:
```typescript
import * as BABYLON from '@babylonjs/core';
const scene = new BABYLON.Scene(engine);
const camera = new BABYLON.ArcRotateCamera(...);
```

**9. Ask Team:**
- "Why did you choose Babylon.js over Three.js?"
- "What 3D techniques did you use?"
- "Show me the scene setup code"

**Pass criteria:**
- [ ] Babylon.js installed
- [ ] Game renders in 3D
- [ ] 3D camera implemented
- [ ] 3D lighting present
- [ ] Materials/textures applied
- [ ] Smooth performance
- [ ] Advanced 3D techniques used
- [ ] Team understands 3D concepts

---

## V.9 ACCESSIBILITY MODULES

### Responsive Design [MINOR - 1 point]

**Requirements:**
- Works on desktop, mobile, tablet

#### Verification Steps:

**1. Desktop Test:**
1. Open website in Firefox on desktop
2. Verify:
   - Layout looks good
   - All elements visible
   - No overflow/scrolling issues

**2. Mobile Test - Browser DevTools:**
1. Open Firefox DevTools (F12)
2. Click "Responsive Design Mode" (Ctrl+Shift+M)
3. Select device: iPhone 12
4. Test:
   - Layout adapts
   - Text readable
   - Buttons touchable (large enough)
   - Navigation accessible

**3. Tablet Test:**
1. In Responsive Design Mode
2. Select: iPad
3. Verify layout adapts

**4. Test Different Orientations:**
1. Switch portrait ↔ landscape
2. Layout should adjust

**5. Touch Input:**
1. In mobile view
2. Try tapping buttons
3. Verify touch targets large enough (min 44x44px)

**6. Test Game on Mobile:**
1. Load game in mobile view
2. Verify:
   - Touch controls available OR
   - On-screen buttons OR
   - Swipe controls
3. Game should be playable

**7. Check CSS:**
```bash
cat frontend/styles.css | grep "@media"
```
Should see media queries:
```css
@media (max-width: 768px) { ... }
@media (min-width: 1024px) { ... }
```

**Pass criteria:**
- [ ] Works on desktop (1920x1080)
- [ ] Works on mobile (375x667)
- [ ] Works on tablet (768x1024)
- [ ] Layout adapts responsively
- [ ] Touch controls work
- [ ] No horizontal scrolling
- [ ] Text readable on small screens

---

### Browser Compatibility [MINOR - 1 point]

**Requirements:**
- Firefox (mandatory)
- One additional browser

#### Verification Steps:

**1. Firefox Test:**
1. Open in Firefox
2. Verify everything works
3. Check version: Menu → Help → About
4. Must be latest stable

**2. Test Second Browser:**

**For Chrome/Chromium:**
1. Open in Chrome
2. Test all features:
   - Page loads
   - Game works
   - Forms submit
   - WebSocket connects
3. Check console for errors

**For Safari:**
1. Open in Safari
2. Test all features
3. Check for compatibility issues

**For Edge:**
1. Open in Edge
2. Test all features

**3. Check for Polyfills:**
```bash
cat frontend/package.json | grep -E "polyfill|core-js"
```

**4. Test Browser-Specific Features:**
1. WebRTC (if video chat)
2. WebGL (if 3D graphics)
3. WebSocket
4. Local Storage

**5. Check CSS Prefixes:**
```bash
grep -r "\-webkit-\|\-moz-" frontend/
```
Should see vendor prefixes for compatibility

**Pass criteria:**
- [ ] Works in Firefox
- [ ] Works in one other browser
- [ ] No major bugs in either
- [ ] Same functionality in both
- [ ] Polyfills used where needed

---

### Multi-Language Support [MINOR - 1 point]

**Requirements:**
- Support 3+ languages
- Language switcher

#### Verification Steps:

**1. Find Language Switcher:**
1. Open website
2. Look for language dropdown/selector
3. Usually in: header, footer, or settings

**2. Test Language Switch:**
1. Note current language (e.g., English)
2. Click language switcher
3. Select different language (e.g., French)
4. Verify:
   - Page content changes
   - Buttons translated
   - Menu items translated
   - Error messages translated

**3. Test All Languages:**
Required minimum 3:
- [ ] Language 1: ____________
- [ ] Language 2: ____________
- [ ] Language 3: ____________

Test each language displays correctly

**4. Check Translation Files:**
```bash
find frontend -name "*.json" | grep -E "lang|i18n|translation"
cat frontend/src/locales/en.json
cat frontend/src/locales/fr.json
```

**5. Test Persistence:**
1. Select language (e.g., Spanish)
2. Navigate to different page
3. Verify language stays Spanish
4. Refresh page
5. Should still be Spanish

**6. Check Code:**
```bash
cat frontend/src/languageService.ts
```
Look for translation service

**7. Test During Gameplay:**
1. Change language
2. Start game
3. Verify game UI translated (Score, Win/Loss messages)

**8. RTL Support (if applicable):**
If Arabic/Hebrew supported:
- Text should align right
- Layout should mirror

**Pass criteria:**
- [ ] Language switcher present
- [ ] 3+ languages supported
- [ ] All UI text translated
- [ ] Language preference persists
- [ ] No untranslated strings
- [ ] Game UI also translated

---

### Visually Impaired Support [MINOR - 1 point]

**Requirements:**
- Screen reader compatibility
- Alt text on images
- High contrast mode
- Text resizing
- Keyboard navigation

#### Verification Steps:

**1. Screen Reader Test:**

**Using NVDA/JAWS (Windows) or VoiceOver (Mac):**
1. Enable screen reader
2. Navigate website with Tab key
3. Verify:
   - Buttons announced
   - Links read aloud
   - Form labels read
   - Images described

**Alternative - Check HTML:**
```bash
curl -k https://localhost | grep -E "aria-|role="
```
Should see ARIA attributes

**2. Alt Text Check:**
1. View page source
2. Find all images:
   ```html
   <img src="avatar.jpg" alt="User profile picture">
   ```
3. Verify every `<img>` has `alt` attribute
4. Alt text should be descriptive

**3. Form Labels:**
```bash
curl -k https://localhost/login | grep -E "<label"
```
Every input should have associated label:
```html
<label for="username">Username</label>
<input id="username" type="text">
```

**4. High Contrast Mode:**
1. Look for "High Contrast" toggle in settings
2. Enable high contrast
3. Verify:
   - Background: dark (#000)
   - Text: bright (#FFF or #FFFF00)
   - Contrast ratio: >7:1

**5. Text Resizing:**
1. In browser: Ctrl + "+" (zoom in)
2. Increase to 200%
3. Verify:
   - Text enlarges
   - Layout doesn't break
   - No text cutoff
   - Still usable

**6. Keyboard Navigation:**
1. Unplug mouse
2. Use only keyboard:
   - Tab: next element
   - Shift+Tab: previous element
   - Enter: activate button/link
   - Arrow keys: select options
3. Test:
   - Can navigate entire site
   - Focus indicator visible
   - Can play game with keyboard
   - Can submit forms

**7. Focus Indicators:**
1. Press Tab to navigate
2. Each focused element should have:
   - Visible outline or border
   - Color change
   - Some visual indication

**8. Check CSS:**
```bash
cat frontend/styles.css | grep "focus"
```
Should have focus styles:
```css
button:focus {
  outline: 2px solid blue;
}
```

**9. Color Contrast:**
Use browser extension: "WAVE" or "axe DevTools"
1. Install extension
2. Run accessibility scan
3. Check contrast ratio
4. Fix any issues flagged

**Pass criteria:**
- [ ] Screen reader compatible
- [ ] All images have alt text
- [ ] Form labels present
- [ ] High contrast mode available
- [ ] Text can be resized
- [ ] Full keyboard navigation
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA (4.5:1)

---

### Server-Side Rendering (SSR) [MINOR - 1 point]

**Requirements:**
- Initial page render on server
- SEO optimization

#### Verification Steps:

**1. View Page Source:**
1. Open website in browser
2. Right-click → View Page Source
3. Check HTML:
   - Should contain actual content (not just `<div id="root"></div>`)
   - Meta tags present
   - Title tag filled

**Example SSR:**
```html
<html>
  <head>
    <title>ft_transcendence - Play Pong Online</title>
    <meta name="description" content="...">
  </head>
  <body>
    <h1>Welcome to ft_transcendence</h1>
    <!-- Pre-rendered content -->
  </body>
</html>
```

**Example CSR (Client-Side Render - NOT SSR):**
```html
<html>
  <body>
    <div id="root"></div>
    <script src="bundle.js"></script>
  </body>
</html>
```

**2. Disable JavaScript:**
1. In Firefox: about:config
2. Set `javascript.enabled` to false
3. Reload page
4. Verify:
   - Content visible (even without JS)
   - Basic HTML structure present

**3. Check Network Tab:**
1. Open DevTools → Network
2. Clear network log
3. Refresh page
4. Check first HTML response
5. Content should be in initial HTML (not loaded by JS)

**4. SEO Meta Tags:**
View source, verify presence:
```html
<meta name="description" content="...">
<meta name="keywords" content="...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
```

**5. Test with curl:**
```bash
curl -k https://localhost
```
HTML should contain readable content

**6. Check Framework:**
```bash
cat frontend/package.json | grep -E "next|nuxt|remix"
```
SSR frameworks: Next.js, Nuxt.js, Remix

**7. Performance Check:**
1. Open Lighthouse in DevTools
2. Run audit
3. Check "First Contentful Paint"
4. Should be fast (<1.5s)

**Pass criteria:**
- [ ] Initial HTML contains content
- [ ] Meta tags present for SEO
- [ ] Content visible without JavaScript
- [ ] Fast first paint
- [ ] SSR framework used
- [ ] Team can explain SSR benefits

---

## V.10 SERVER-SIDE PONG MODULE

### Server-Side Logic + API [MAJOR - 2 points]

**Requirements:**
- Pong logic runs on server
- API for game control
- Client displays game state

#### Verification Steps:

**1. Verify Game Logic on Server:**
```bash
cat backend/src/services/GameEngine.ts
# or
cat backend/game-service/src/pong.ts
```
Look for:
- Ball physics calculations
- Paddle collision detection
- Score tracking
All should be SERVER-SIDE

**2. Check Client Code:**
```bash
cat frontend/src/views/GamePage.ts
```
Client should:
- Send inputs (paddle moves)
- Receive game state
- Render received state
Client should NOT:
- Calculate ball position
- Detect collisions

**3. Test API Endpoints:**

**Initialize game:**
```bash
curl -X POST -k https://localhost/api/game/init \
  -H "Content-Type: application/json" \
  -d '{"player1": "Alice", "player2": "Bob"}'
```
Should return game ID

**Send player input:**
```bash
curl -X POST -k https://localhost/api/game/1/move \
  -H "Content-Type: application/json" \
  -d '{"player": 1, "direction": "up"}'
```

**Get game state:**
```bash
curl -k https://localhost/api/game/1/state
```
Should return:
```json
{
  "ball": {"x": 250, "y": 200},
  "paddle1": {"y": 150},
  "paddle2": {"y": 200},
  "score": {"player1": 3, "player2": 2}
}
```

**4. Test Real-Time Updates:**
1. Open two browser windows
2. Start game
3. Move paddle on Browser 1
4. Observe Browser 2:
   - Should see paddle move
   - Ball movement synced
5. Server sends updates via WebSocket

**5. Verify Server Authority:**
1. Open browser console
2. Try to cheat:
   ```javascript
   // Try to manipulate game state
   paddle1.y = 0;
   ball.x = 500;
   ```
3. Changes should NOT persist
4. Server state should override

**6. Check WebSocket:**
```bash
cat backend/src/websocket.ts
```
Look for game state broadcasts:
```typescript
io.emit('gameState', gameState);
```

**7. Test Validation:**
1. Try invalid move via API:
   ```bash
   curl -X POST -k https://localhost/api/game/1/move \
     -d '{"player": 1, "direction": "left"}'
   ```
2. Should be rejected (paddles only move up/down)

**Pass criteria:**
- [ ] Game logic runs on server
- [ ] API endpoints for game control
- [ ] Client receives game state
- [ ] Client renders state (doesn't calculate)
- [ ] Server validates all inputs
- [ ] Real-time updates via WebSocket
- [ ] Impossible to cheat from client

---

### CLI Gameplay [MAJOR - 2 points]

**Requirements:**
- Command-line Pong application
- Connects via API
- Can play against web users

#### Verification Steps:

**1. Find CLI Application:**
```bash
ls cli/
# or
ls pong-cli/
```

**2. Check CLI Code:**
```bash
cat cli/main.py
# or
cat cli/pong-cli.js
```

**3. Run CLI:**
```bash
cd cli
python3 pong-cli.py
# or
node pong-cli.js
```

**4. CLI Login:**
1. CLI should prompt: "Username:"
2. Enter test username
3. CLI should authenticate with API

**5. CLI Game Start:**
1. CLI shows menu:
   ```
   1. Find Match
   2. Challenge Player
   3. View Stats
   4. Exit
   ```
2. Select "Find Match"
3. CLI connects to matchmaking

**6. Test Cross-Platform Play:**
1. Web User: Open website, start matchmaking
2. CLI User: Run CLI, find match
3. Verify they match against each other

**7. CLI Controls:**
During game, CLI should show:
```
Score: You 3 - 2 Opponent

==========
|    O   |  <- Ball
|        |
==========

Controls: W (up) | S (down) | Q (quit)
```

**8. Test Controls:**
1. Press W → Paddle moves up
2. Press S → Paddle moves down
3. Verify updates in real-time

**9. Verify API Communication:**
```bash
# Run CLI with debug mode
DEBUG=true node pong-cli.js
```
Should show API calls:
```
POST /api/game/join
WS connected to wss://localhost/game
Received gameState: {ball: ..., paddle: ...}
```

**10. Check Documentation:**
```bash
cat cli/README.md
```
Should explain:
- How to install
- How to run
- How to play
- Controls

**11. Test Against Web Player:**
1. Browser: User A logged in, starts game
2. CLI: User B joins same game
3. Both play in real-time
4. Verify synchronization

**Pass criteria:**
- [ ] CLI application exists
- [ ] CLI authenticates via API
- [ ] Can join matches
- [ ] Can play against web users
- [ ] Real-time synchronization
- [ ] Controls work (keyboard input)
- [ ] Game state displays in terminal
- [ ] Documentation provided
- [ ] Team demonstrates CLI gameplay

---

## Final Module Summary Checklist

### DevOps:
- [ ] ELK Stack (Elasticsearch, Logstash, Kibana)
- [ ] Monitoring (Prometheus, Grafana)
- [ ] Microservices architecture

### Graphics:
- [ ] 3D Babylon.js implementation

### Accessibility:
- [ ] Responsive design (desktop/mobile/tablet)
- [ ] Browser compatibility (+1 browser)
- [ ] Multi-language (3+ languages)
- [ ] Visually impaired support
- [ ] Server-Side Rendering (SSR)

### Server-Side Pong:
- [ ] Server-side game logic + API
- [ ] CLI gameplay application

---

## Bonus Module Scoring

For modules beyond the required 7:

| Module Type | Points |
|-------------|--------|
| Major module | +10 |
| Minor module | +5 |

---

## Team Understanding Questions

For ANY module, evaluator should ask:

1. **"Why did you choose this module?"**
   - Should explain strategic choice

2. **"How does this module work?"**
   - Should explain architecture/flow

3. **"Show me the key code for this module"**
   - Should navigate to code confidently

4. **"What challenges did you face?"**
   - Should discuss technical problems solved

5. **"How did you test this?"**
   - Should explain testing methodology

---

## Evaluation Complete!

You have now verified all aspects of the ft_transcendence project.

**Final Steps:**
1. Calculate score (mandatory + modules)
2. Verify minimum 7 major modules for 100%
3. Count bonus modules
4. Complete evaluation form
5. Provide feedback to team

**Remember:**
- Security failure = automatic 0
- Mandatory part must be perfect for bonus
- Team must be able to explain all code
- Live code modification may be requested

---

**End of Part 5 - Evaluation Guide Complete**
