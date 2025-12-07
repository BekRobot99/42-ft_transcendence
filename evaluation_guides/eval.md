# ft_transcendence Evaluation Sheet

## Introduction
**Please comply with the following rules:**
- [cite_start]Remain polite, courteous, respectful, and constructive throughout the evaluation process. [cite: 12]
- [cite_start]Identify with the student/group and discuss any dysfunctions or problems identified. [cite: 13, 14]
- [cite_start]Keep an open mind; grading instructions may be interpreted differently. [cite: 15, 16]
- [cite_start]If you have not completed the assignment, read the entire subject prior to evaluation. [cite: 25, 26]

## Guidelines
- **Git Repository:** Only grade work in the official Git repository. [cite_start]Ensure `git clone` is used in an empty folder. [cite: 19, 21]
- [cite_start]**Malicious Code:** Check that no malicious aliases are used to fool the grading. [cite: 22]
- **Empty/Crash/Norm:** Use available flags for empty repos, crashes, or Norm errors (if applicable). [cite_start]The grade is 0 in these cases. [cite: 27, 28]
- [cite_start]**Defense:** No segfaults or unexpected terminations allowed during defense. [cite: 34]
- [cite_start]**Editing:** Do not edit files (except config files if necessary, with justification). [cite: 35]
- **Memory Leaks:** Verify absence of memory leaks (allocated heap memory must be freed). [cite_start]Tools like `leaks`, `valgrind`, or `e_fence` are allowed. [cite: 37, 39]

---

## Part 1: General Instructions

### Use of Libraries and Tools
- [ ] [cite_start]Team has NOT used libraries/tools that provide an immediate complete solution for a global feature. [cite: 46]
- [ ] [cite_start]Direct instructions regarding third-party libraries (can/must/can't) have been followed. [cite: 47]
- [ ] [cite_start]Usage of small libraries for simple/unique tasks is allowed. [cite: 48]
- [ ] [cite_start]Team can justify usage of any non-explicitly approved library. [cite: 49]

### Preliminary Tests
- [ ] Credentials/API keys/Env variables are set inside an `.env` file during evaluation. (Grade 0 if keys are committed to repo)[cite_start]. [cite: 54, 55]
- [ ] [cite_start]`docker-compose.yaml` (or equivalent) exists at root. [cite: 56]
- [ ] [cite_start]Container builds and runs (e.g., `docker-compose up --build`). [cite: 57]
- [ ] [cite_start]**Note:** Do not stop evaluation unless there is a crash, 500 error, or non-functional project scope. [cite: 58]

---

## Part 2: Mandatory Part

### Basic Checks
- [ ] [cite_start]The website is available. [cite: 62]
- [ ] [cite_start]Users can subscribe/register. [cite: 63]
- [ ] [cite_start]Registered users can log in. [cite: 64]
- [ ] The website is a **Single Page Application (SPA)**. [cite_start]"Back" and "Forward" browser buttons work correctly. [cite: 65]

### Security Concerns
- [ ] [cite_start]Website uses HTTPS/TLS. [cite: 76]
- [ ] [cite_start]Passwords in the database are hashed. [cite: 77]
- [ ] [cite_start]Server-side validation/sanitization is present for forms and user input. [cite: 78]
- [ ] [cite_start]**Stop evaluation if security measures are missing.** [cite: 80]

### The Game
- [ ] [cite_start]Game is playable locally on the same computer using the keyboard. [cite: 85]
- [ ] [cite_start]Each player utilizes a specific section of the keyboard. [cite: 86]
- [ ] [cite_start]Remote/Tournament play functions (as per specific module requirements). [cite: 87]
- [ ] [cite_start]Gameplay respects original Pong rules. [cite: 91]
- [ ] [cite_start]Controls are intuitive or explained. [cite: 92]
- [ ] [cite_start]End-game state is handled (screen displayed or page exit). [cite: 93]

### Lags & Disconnects
- [ ] [cite_start]Unexpected disconnections and lags are handled (Game/Site does not crash). [cite: 97]
- [ ] (Optional) [cite_start]Reconnection or pause features are implemented. [cite: 98]

---

## Part 3: Modules
*Note: Refer to the subject PDF for specific requirements per module. 1 Major Module = 2 Minor Modules.*

### Major Module 01
- [ ] [cite_start]Module functions properly without issues. [cite: 131]
- [ ] [cite_start]Team understands how it works and why it was chosen. [cite: 132]
- [ ] [cite_start]No visible errors. [cite: 133]
- [ ] [cite_start]Comprehensive explanation provided. [cite: 134]

### Module 02
- [ ] [cite_start]Module functions properly without issues. [cite: 145]
- [ ] [cite_start]Team understands how it works and why it was chosen. [cite: 146]
- [ ] [cite_start]No visible errors. [cite: 147]
- [ ] [cite_start]Comprehensive explanation provided. [cite: 148]

### Module 03
- [ ] [cite_start]Module functions properly without issues. [cite: 163]
- [ ] [cite_start]Team understands how it works and why it was chosen. [cite: 164]
- [ ] [cite_start]No visible errors. [cite: 165]
- [ ] [cite_start]Comprehensive explanation provided. [cite: 166]

### Module 04
- [ ] [cite_start]Module functions properly without issues. [cite: 177]
- [ ] [cite_start]Team understands how it works and why it was chosen. [cite: 178]
- [ ] [cite_start]No visible errors. [cite: 179]
- [ ] [cite_start]Comprehensive explanation provided. [cite: 180]

### Module 05
- [ ] [cite_start]Module functions properly without issues. [cite: 195]
- [ ] [cite_start]Team understands how it works and why it was chosen. [cite: 196]
- [ ] [cite_start]No visible errors. [cite: 197]
- [ ] [cite_start]Comprehensive explanation provided. [cite: 198]

### Module 06
- [ ] [cite_start]Module functions properly without issues. [cite: 209]
- [ ] [cite_start]Team understands how it works and why it was chosen. [cite: 210]
- [ ] [cite_start]No visible errors. [cite: 211]
- [ ] [cite_start]Comprehensive explanation provided. [cite: 212]

### Module 07
- [ ] [cite_start]Module functions properly without issues. [cite: 223]
- [ ] [cite_start]Team understands how it works and why it was chosen. [cite: 224]
- [ ] [cite_start]No visible errors. [cite: 225]
- [ ] [cite_start]Comprehensive explanation provided. [cite: 226]

---

## Part 4: Bonus
[cite_start]*Evaluate only if mandatory part is perfect and error management handles unexpected usage.* [cite: 235]

### Extra Module(s)
[cite_start]*Reminder: Major module = 2 points, Minor module = 1 point.* [cite: 242]
- [ ] [cite_start]Module functions properly without issues. [cite: 244]
- [ ] [cite_start]Team understands how it works and why it was chosen. [cite: 245]
- [ ] [cite_start]No visible errors. [cite: 246]
- [ ] [cite_start]Comprehensive explanation provided. [cite: 247]

---

## Final Ratings
[cite_start]**Check the flag corresponding to the defense:** [cite: 251]

- [ ] [cite_start]OK (Outstanding project) [cite: 253, 254]
- [ ] [cite_start]Empty work [cite: 255]
- [ ] [cite_start]Incomplete work [cite: 256]
- [ ] [cite_start]Cheat [cite: 257]
- [ ] [cite_start]Crash [cite: 258]
- [ ] [cite_start]Incomplete group / Concerning situation [cite: 259]
- [ ] [cite_start]Forbidden function [cite: 260]
- [ ] [cite_start]Can't support/explain code [cite: 262]