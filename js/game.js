/**
 * game.js — Core Game Logic & State Management
 *
 * Programming Concept: State Machine & Pure Business Logic
 * This module controls the state of the active investigation:
 * tracking which evidence files have been inspected, which clues have been extracted,
 * calculating investigation progress percentage, and evaluating deduction submissions.
 */

const GameEngine = {
  // Current in-memory session state
  state: {
    currentCaseId: null,
    viewedEvidenceIds: [],
    discoveredClueIds: [],
    theory: {
      suspectId: null,
      vectorId: null,
      evidenceId: null
    },
    status: "not-started" // 'not-started' | 'in-progress' | 'solved' | 'failed'
  },

  /**
   * Start a brand new investigation for a given case ID.
   * @param {string} caseId
   */
  startNewCase(caseId = "case-001") {
    if (!CASES[caseId]) {
      console.error(`Case ${caseId} does not exist in CASES database.`);
      return false;
    }

    this.state = {
      currentCaseId: caseId,
      viewedEvidenceIds: [],
      discoveredClueIds: [],
      theory: {
        suspectId: null,
        vectorId: null,
        evidenceId: null
      },
      status: "in-progress"
    };

    StorageManager.saveGameState(this.state);
    return true;
  },

  /**
   * Resume an existing case from localStorage if present.
   * @returns {boolean} True if successfully restored
   */
  resumeCase() {
    const saved = StorageManager.loadGameState();
    if (saved && saved.currentCaseId && CASES[saved.currentCaseId]) {
      this.state = saved;
      return true;
    }
    return false;
  },

  /**
   * Get the data definition of the currently active case.
   */
  getCurrentCase() {
    if (!this.state.currentCaseId) return null;
    return CASES[this.state.currentCaseId] || null;
  },

  /**
   * Mark an evidence item as inspected.
   * @param {string} evidenceId
   * @returns {boolean} True if state changed
   */
  markEvidenceViewed(evidenceId) {
    if (!this.state.viewedEvidenceIds.includes(evidenceId)) {
      this.state.viewedEvidenceIds.push(evidenceId);
      StorageManager.saveGameState(this.state);
      return true;
    }
    return false;
  },

  /**
   * Record a discovered clue into the investigation notebook.
   * @param {string} clueId
   * @returns {boolean} True if newly discovered
   */
  discoverClue(clueId) {
    if (!this.state.discoveredClueIds.includes(clueId)) {
      this.state.discoveredClueIds.push(clueId);
      StorageManager.saveGameState(this.state);
      return true;
    }
    return false;
  },

  /**
   * Check if a specific clue has already been recorded.
   * @param {string} clueId
   * @returns {boolean}
   */
  isClueDiscovered(clueId) {
    return this.state.discoveredClueIds.includes(clueId);
  },

  /**
   * Calculate investigation completion percentage based on evidence and clues.
   * Weight: 40% Evidence Inspected + 60% Clues Discovered.
   * @returns {number} Integer between 0 and 100
   */
  getProgressPercentage() {
    const currentCase = this.getCurrentCase();
    if (!currentCase) return 0;

    const totalEvidence = currentCase.evidence.length;
    const totalClues = currentCase.evidence.filter(e => e.clue).length;

    const viewedCount = this.state.viewedEvidenceIds.length;
    const clueCount = this.state.discoveredClueIds.length;

    const evidenceRatio = totalEvidence > 0 ? (viewedCount / totalEvidence) : 0;
    const clueRatio = totalClues > 0 ? (clueCount / totalClues) : 0;

    const combinedScore = (evidenceRatio * 40) + (clueRatio * 60);
    return Math.min(100, Math.round(combinedScore));
  },

  /**
   * Evaluate player's deduction theory against the case solution.
   * @param {Object} theory - { suspectId, vectorId, evidenceId }
   * @returns {Object} Evaluation report
   */
  evaluateDeduction(theory) {
    const currentCase = this.getCurrentCase();
    if (!currentCase) return null;

    const sol = currentCase.solution;
    const isSuspectCorrect = theory.suspectId === sol.suspectId;
    const isVectorCorrect = theory.vectorId === sol.vectorId;
    const isEvidenceCorrect = theory.evidenceId === sol.evidenceId;

    let score = 0;
    if (isSuspectCorrect) score += 40;
    if (isVectorCorrect) score += 35;
    if (isEvidenceCorrect) score += 25;

    const isFullySolved = (score === 100);

    // Save final status
    this.state.theory = theory;
    this.state.status = isFullySolved ? "solved" : "failed";
    StorageManager.saveGameState(this.state);

    return {
      solved: isFullySolved,
      score: score,
      isSuspectCorrect,
      isVectorCorrect,
      isEvidenceCorrect,
      solution: sol,
      explanation: sol.explanation,
      takeaways: sol.educationalTakeaways
    };
  }
};
