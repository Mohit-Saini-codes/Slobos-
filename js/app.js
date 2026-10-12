/**
 * app.js — Application Orchestrator & Event Controller
 *
 * Programming Concept: Controller / Application Orchestration
 * This script acts as the coordinator between the GameEngine (logic),
 * StorageManager (persistence), and UI (view). It registers all DOM events
 * and handles the lifecycle of the user session.
 */

const App = {
  activeEvidenceId: null,

  /**
   * Application Entry Point.
   */
  init() {
    // 1. Start live clock in top SOC bar
    UI.startClock();

    // 2. Check for existing saved investigation
    this.refreshResumeStatus();

    // 3. Register global DOM event listeners
    this.bindEvents();

    console.log("Cyber Detective Terminal v1.0 initialized.");
  },

  /**
   * Check if a saved session is present and update the UI accordingly.
   */
  refreshResumeStatus() {
    const hasSave = StorageManager.hasSavedGame();
    if (hasSave) {
      const savedState = StorageManager.loadGameState();
      const caseData = CASES[savedState.currentCaseId];
      UI.updateResumeButton(true, caseData ? caseData.title : "");
    } else {
      UI.updateResumeButton(false);
    }
  },

  /**
   * Bind all interactive click and submit listeners across screens.
   */
  bindEvents() {
    // --- Main Menu Navigation ---
    const btnNewGame = document.getElementById("btn-new-game");
    if (btnNewGame) {
      btnNewGame.addEventListener("click", () => {
        const caseData = CASES["case-001"];
        UI.renderBriefing(caseData);
        UI.showScreen("screen-briefing");
      });
    }

    const btnResumeGame = document.getElementById("btn-resume-game");
    if (btnResumeGame) {
      btnResumeGame.addEventListener("click", () => {
        if (GameEngine.resumeCase()) {
          const currentCase = GameEngine.getCurrentCase();
          UI.renderDashboard(currentCase, GameEngine.state);
          UI.showScreen("screen-dashboard");
          UI.showToast("Case Resumed", `Continuing investigation for ${currentCase.title}`, "info");
        } else {
          UI.showToast("Notice", "No valid saved case found to resume.", "warn");
          this.refreshResumeStatus();
        }
      });
    }

    // --- About / Protocol Modal ---
    const btnOpenAbout = document.getElementById("btn-open-about");
    if (btnOpenAbout) {
      btnOpenAbout.addEventListener("click", () => UI.openModal("modal-about"));
    }

    const btnCloseAbout = document.getElementById("btn-close-about");
    if (btnCloseAbout) {
      btnCloseAbout.addEventListener("click", () => UI.closeModal("modal-about"));
    }

    const btnAboutGotIt = document.getElementById("btn-about-got-it");
    if (btnAboutGotIt) {
      btnAboutGotIt.addEventListener("click", () => UI.closeModal("modal-about"));
    }

    // --- Briefing Actions ---
    const btnStartInvestigation = document.getElementById("btn-start-investigation");
    if (btnStartInvestigation) {
      btnStartInvestigation.addEventListener("click", () => {
        GameEngine.startNewCase("case-001");
        const currentCase = GameEngine.getCurrentCase();
        UI.renderDashboard(currentCase, GameEngine.state);
        UI.showScreen("screen-dashboard");
        UI.showToast("Station Active", "Target system logs loaded into workstation.", "info");
      });
    }

    const btnBackToMenu = document.getElementById("btn-back-to-menu");
    if (btnBackToMenu) {
      btnBackToMenu.addEventListener("click", () => {
        this.refreshResumeStatus();
        UI.showScreen("screen-menu");
      });
    }

    // --- Dashboard Actions ---
    const btnExitToMenu = document.getElementById("btn-exit-to-menu");
    if (btnExitToMenu) {
      btnExitToMenu.addEventListener("click", () => {
        this.refreshResumeStatus();
        UI.showScreen("screen-menu");
        UI.showToast("Progress Saved", "Investigation state saved to local station.", "info");
      });
    }

    const btnOpenDeduction = document.getElementById("btn-open-deduction");
    if (btnOpenDeduction) {
      btnOpenDeduction.addEventListener("click", () => {
        const currentCase = GameEngine.getCurrentCase();
        UI.renderDeductionBoard(currentCase, GameEngine.state.theory);
        UI.showScreen("screen-deduction");
      });
    }

    // --- Category Filter Tabs ---
    const filterTabsContainer = document.getElementById("evidence-filter-tabs");
    if (filterTabsContainer) {
      filterTabsContainer.addEventListener("click", (e) => {
        const tab = e.target.closest(".filter-tab");
        if (!tab) return;

        filterTabsContainer.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        UI.currentCategoryFilter = tab.dataset.category || "all";
        const currentCase = GameEngine.getCurrentCase();
        if (currentCase) {
          UI.renderEvidenceGrid(currentCase.evidence, GameEngine.state);
        }
      });
    }

    // --- Evidence Modal Controls ---
    const btnCloseEvidence = document.getElementById("btn-close-evidence");
    if (btnCloseEvidence) {
      btnCloseEvidence.addEventListener("click", () => UI.closeModal("modal-evidence"));
    }

    const btnModalCloseAction = document.getElementById("btn-modal-close-action");
    if (btnModalCloseAction) {
      btnModalCloseAction.addEventListener("click", () => UI.closeModal("modal-evidence"));
    }

    // --- Deduction Form Submission ---
    const btnBackFromDeduction = document.getElementById("btn-back-from-deduction");
    if (btnBackFromDeduction) {
      btnBackFromDeduction.addEventListener("click", () => {
        const currentCase = GameEngine.getCurrentCase();
        UI.renderDashboard(currentCase, GameEngine.state);
        UI.showScreen("screen-dashboard");
      });
    }

    const formDeduction = document.getElementById("form-deduction");
    if (formDeduction) {
      formDeduction.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSubmitTheory(formDeduction);
      });
    }

    // --- Results Screen Actions ---
    const btnReplayCase = document.getElementById("btn-replay-case");
    if (btnReplayCase) {
      btnReplayCase.addEventListener("click", () => {
        GameEngine.startNewCase("case-001");
        const currentCase = GameEngine.getCurrentCase();
        UI.renderDashboard(currentCase, GameEngine.state);
        UI.showScreen("screen-dashboard");
        UI.showToast("Investigation Reset", "Evidence files and logs reloaded.", "info");
      });
    }

    const btnResultsMenu = document.getElementById("btn-results-menu");
    if (btnResultsMenu) {
      btnResultsMenu.addEventListener("click", () => {
        this.refreshResumeStatus();
        UI.showScreen("screen-menu");
      });
    }

    // --- Global Keyboard Shortcuts ---
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        UI.closeModal("modal-evidence");
        UI.closeModal("modal-about");
      }
    });
  },

  /**
   * Handle user clicking on an evidence card to inspect it.
   * @param {string} evidenceId
   */
  handleOpenEvidence(evidenceId) {
    const currentCase = GameEngine.getCurrentCase();
    if (!currentCase) return;

    const ev = currentCase.evidence.find(item => item.id === evidenceId);
    if (!ev) return;

    this.activeEvidenceId = evidenceId;

    // Mark as inspected in state
    GameEngine.markEvidenceViewed(evidenceId);

    // Check if clue has already been recorded
    const isClueFound = ev.clue ? GameEngine.isClueDiscovered(ev.clue.id) : false;

    // Render modal
    UI.renderEvidenceModal(ev, isClueFound);

    // Refresh background dashboard stats
    UI.renderDashboard(currentCase, GameEngine.state);
  },

  /**
   * Handle user extracting a finding into the clue notebook.
   * @param {string} clueId
   */
  handleExtractClue(clueId) {
    const isNew = GameEngine.discoverClue(clueId);
    const currentCase = GameEngine.getCurrentCase();

    if (isNew) {
      UI.showToast("Finding Logged!", "Forensic evidence recorded in your notebook.", "clue");
    }

    // Update current modal state
    const currentEv = currentCase.evidence.find(item => item.id === this.activeEvidenceId);
    if (currentEv) {
      UI.renderEvidenceModal(currentEv, true);
    }

    // Update dashboard progress
    UI.renderDashboard(currentCase, GameEngine.state);
  },

  /**
   * Handle theory submission and evaluation.
   * @param {HTMLFormElement} form
   */
  handleSubmitTheory(form) {
    const formData = new FormData(form);
    const suspectId = formData.get("suspect");
    const vectorId = formData.get("vector");
    const evidenceId = formData.get("evidence");

    if (!suspectId || !vectorId || !evidenceId) {
      UI.showToast("Incomplete Theory", "Please select a Suspect, an Access Vector, and a Crucial Artifact.", "warn");
      return;
    }

    const theory = { suspectId, vectorId, evidenceId };
    const currentCase = GameEngine.getCurrentCase();

    const evaluation = GameEngine.evaluateDeduction(theory);
    if (evaluation) {
      UI.renderResults(evaluation, theory, currentCase);
      UI.showScreen("screen-results");
      
      if (evaluation.solved) {
        UI.showToast("Case Solved!", "Accurate deduction. Incident reconstruction confirmed.", "clue");
      } else {
        UI.showToast("Theory Incomplete", "Evidence did not fully support the conclusion.", "warn");
      }
    }
  }
};

// Bootstrap when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
