import type { Move, Player } from "./types";
import type Store from "./store";

export default class View {
  $: Record<string, Element> = {};
  $$: Record<string, NodeListOf<Element>> = {};

  constructor() {
    /**
     * Preselect all the elements we will need
     */

    // Single elements
    this.$.menu = this.#qs('[data-id="menu"]');
    this.$.menuBtn = this.#qs('[data-id="menu-button"]');
    this.$.menuItems = this.#qs('[data-id="menu-items"]');
    this.$.resetBtn = this.#qs('[data-id="reset-btn"]');
    this.$.newRoundBtn = this.#qs('[data-id="new-round-btn"]');
    this.$.modal = this.#qs('[data-id="modal"]');
    this.$.modalText = this.#qs('[data-id="modal-text"]');
    this.$.modalBtn = this.#qs('[data-id="modal-button"]');
    this.$.turn = this.#qs('[data-id="turn"]');
    this.$.p1Wins = this.#qs('[data-id="player1-stats"]');
    this.$.p2Wins = this.#qs('[data-id="player2-stats"]');
    this.$.ties = this.#qs('[data-id="ties"]');
    this.$.grid = this.#qs('[data-id="grid"]');

    // Element lists
    this.$$.squares = this.#qsAll('[data-id="square"]');

    // UI-only event listeners
    this.$.menuBtn.addEventListener("click", (event) => {
      this.#toggleMenu();
    });
  }

  render(game: Store["game"], stats: Store["stats"]) {
    const { playersWithStats, ties } = stats;
    const {
      moves,
      currentPlayer,
      status: { isComplete, winner },
    } = game;

    this.#closeAll();
    this.#clearMoves();
    this.#updateScoreboard(
      playersWithStats[0].wins,
      playersWithStats[1].wins,
      ties
    );
    this.#initialiseMoves(moves);

    if (isComplete) {
      this.#openModal(winner ? `${winner.name} wins!` : "Its a tie!");
      return;
    }

    this.#setTurnIndicator(currentPlayer);
  }

  // Register all the Event Listeners
  bindGameResetEvent(handler: EventListener) {
    this.$.resetBtn.addEventListener("click", handler);
    this.$.modalBtn.addEventListener("click", handler);
  }

  bindNewRoundEvent(handler: EventListener) {
    this.$.newRoundBtn.addEventListener("click", handler);
  }

  bindPlayerMoveEvent(handler: (el: Element) => void) {
    this.#delegate(this.$.grid, "[data-id='square']", "click", handler);
  }

  // DOM helper methods

  #updateScoreboard(p1Wins: number, p2Wins: number, ties: number) {
    this.$.p1Wins.textContent = `${p1Wins} wins`;
    this.$.p2Wins.textContent = `${p2Wins} wins`;
    this.$.ties.textContent = `${ties} ties`;
  }
  #openModal(message: string) {
    this.$.modal.classList.remove("hidden");
    this.$.modalText.textContent = message;
  }

  #closeModal() {
    this.$.modal.classList.add("hidden");
  }

  #closeMenu() {
    this.$.menuItems.classList.add("hidden");
    this.$.menuBtn.classList.remove("border");

    const icon = this.#qs("i", this.$.menuBtn);

    icon.classList.add("fa-chevron-down");
    icon.classList.remove("fa-chevron-up");
  }

  #closeAll() {
    this.#closeModal();
    this.#closeMenu();
  }

  #clearMoves() {
    this.$$.squares.forEach((square) => {
      square.replaceChildren();
    });
  }

  // Save moves to state storage
  #initialiseMoves(moves: Move[]) {
    this.$$.squares.forEach((square) => {
      const existingMove = moves.find((move) => move.squareId === +square.id);
      if (existingMove) {
        this.#handlePlayerMove(square, existingMove.player);
      }
    });
  }

  #toggleMenu() {
    this.$.menuItems.classList.toggle("hidden");
    this.$.menuBtn.classList.toggle("border");
    const icon = this.#qs("i", this.$.menuBtn);
    icon.classList.toggle("fa-chevron-down");
    icon.classList.toggle("fa-chevron-up");
  }

  // Handle Player Move
  #handlePlayerMove(squareEl: Element, player: Player) {
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", player.iconClass, player.colourClass);
    squareEl.replaceChildren(icon);
  }

  // Player = 1 | 2
  #setTurnIndicator(player: Player) {
    const icon = document.createElement("i");
    const label = document.createElement("p");

    icon.classList.add("fa-solid", player.colourClass, player.iconClass);
    label.classList.add(player.colourClass);

    label.innerText = `${player.name}, you're up!`;

    this.$.turn.replaceChildren(icon, label);
  }

  // qs and qsAll are safe selectors that guarentee that the elements selected exist in the DOM
  #qs(selector: string, parent?: Element) {
    const el = parent
      ? parent.querySelector(selector)
      : document.querySelector(selector);

    if (!el) {
      throw new Error("Could not find elements");
    }
    return el;
  }

  #qsAll(selector: string) {
    const elList = document.querySelectorAll(selector);
    if (!elList) {
      throw new Error("Could not find elements");
    }
    return elList;
  }

  // Delegate to derive which square was clicked
  #delegate(
    el: Element,
    selector: string,
    eventKey: string,
    handler: (el: Element) => void
  ) {
    el.addEventListener(eventKey, (event) => {
      if (!(event.target instanceof Element)) {
        throw new Error("Event target not found");
      }

      if (event.target.matches(selector)) {
        handler(event.target);
      }
    });
  }
}
