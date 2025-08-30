// GAME HOMEPAGE
function createGameGreeting(): HTMLHeadingElement {
  const heading = document.createElement("h1");
  heading.textContent = "Welcome to Pong!";
  heading.className = "text-2xl font-bold text-center mb-6";
  return heading;
}

function handlePlayButtonClick(): void {
  alert("The Play button was clicked!");
}

function createGamePlayButton(): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = "Play";
  button.className =
    "w-full py-3 px-6 text-white bg-blue-600 rounded-lg text-xl hover:bg-blue-700 transition";

  button.addEventListener("click", handlePlayButtonClick);

  return button;
}
// end GAME HOMEPAGE

export function renderGamePage(): void {
  const gameContainer = document.getElementById("page-content");
  if (!gameContainer) {
    console.error("Could not find #page-content");
    return;
  }

  const gameWrapper = document.createElement("div");
  gameWrapper.className = "flex flex-col items-center justify-center gap-4";

  const greeting = createGameGreeting();
  const playButton = createGamePlayButton();

  gameWrapper.appendChild(greeting);
  gameWrapper.appendChild(playButton);
  gameContainer.appendChild(gameWrapper);
}

