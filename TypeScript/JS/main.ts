import View from "./view.js";
import Store from "./store.js";
import type { Player } from "./types";

// Define players of the game
const players: Player[] = [
  {
    id: 1,
    name: "Player 1",
    iconClass: "fa-x",
    colourClass: "turquoise",
  },
  {
    id: 2,
    name: "Player 2",
    iconClass: "fa-o",
    colourClass: "yellow",
  },
];

// Initialise App

function init() {
  const view = new View();
  const store = new Store("live-t3-storage-key", players);

  // Current tab state changes
  store.addEventListener("statechange", () => {
    view.render(store.game, store.stats);
  });

  // Different tab state changes
  window.addEventListener("storage", () => {
    view.render(store.game, store.stats);
  });

  // the First load of the document
  view.render(store.game, store.stats);

  view.bindGameResetEvent((event) => {
    store.reset();
  });

  view.bindNewRoundEvent((event) => {
    store.newRound();
  });

  view.bindPlayerMoveEvent((square) => {
    const existingMove = store.game.moves.find(
      (move) => move.squareId === +square.id
    );

    if (existingMove) {
      return;
    }

    // Advance to the next state by pushing a move to the moves array
    store.playerMove(+square.id);
  });
}

window.addEventListener("load", init);
