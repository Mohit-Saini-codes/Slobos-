/**
 * ui.js — User Interface & DOM Controller
 *
 * Programming Concept: Single Responsibility Principle (UI Layer)
 * This module is solely responsible for reading and writing to the HTML DOM:
 * displaying screens, opening modals, rendering logs, and updating visual indicators.
 * It contains zero case-solving business logic, keeping concerns cleanly separated.
 */

const UI = {
  // Active filter for evidence category
  currentCategoryFilter: "all",

  // DOM node references
  elements: {
    screens: document.querySelectorAll(".screen"),
    liveClock: document.getElementById("live-system-time"),
    toastContainer: document.getElementById("toast-container"),
    btnResume: document.getElementById("btn-resume-game"),
    resumeSubtext: document.getElementById("resume-subtext"),
    
    // Briefing
    briefingCaseId: document.getElementById("briefing-case-id"),
    briefingTitle: document.getElementById("briefing-title"),
    briefingTarget: document.getElementById("briefing-target"),
    briefingSummary: document.getElementById("briefing-summary"),
    briefingObjectives: document.getElementById("briefing-objectives"),
    briefingPreviewList: document.getElementById("briefing-evidence-preview"),

    // Dashboard Stats
    dashCaseTitle: document.getElementById("dash-case-title"),
    dashEvidenceCount: document.getElementById("dash-evidence-count"),
    dashCluesCount: document.getElementById("dash-clues-count"),
    dashProgressPercent: document.getElementById("dash-progress-percent"),
    dashProgressFill: document.getElementById("dash-progress-fill"),
    evidenceGrid: document.getElementById("evidence-grid"),
    cluesList: document.getElementById("clues-list"),
    notebookBadge: document.getElementById("notebook-count-badge"),

    // Filter counts
    countAll: document.getElementById("count-all"),
    countLogs: document.getElementById("count-logs"),
    countEmail: document.getElementById("count-email"),
    countNetwork: document.getElementById("count-network"),
    countSystem: document.getElementById("count-system"),

    // Deduction
    suspectOptions: document.getElementById("suspect-options-group"),
    vectorOptions: document.getElementById("vector-options-group"),
    evidenceOptions: document.getElementById("evidence-options-group"),

    // Results
    resultsVerdictBanner: document.getElementById("results-verdict-banner"),
    verdictIcon: document.getElementById("verdict-icon"),
    verdictStatusTag: document.getElementById("verdict-status-tag"),
    verdictTitle: document.getElementById("verdict-title"),
    verdictScore: document.getElementById("verdict-score"),
    resultsDebriefText: document.getElementById("results-debrief-text"),
    resultsEducationList: document.getElementById("results-education-list"),
    reviewSuspect: document.getElementById("review-suspect"),
    reviewVector: document.getElementById("review-vector"),
    reviewEvidence: document.getElementById("review-evidence"),

    // Evidence Modal
    modalEvidence: document.getElementById("modal-evidence"),
    modalEvidenceCategory: document.getElementById("modal-evidence-category"),
    modalEvidenceTitle: document.getElementById("modal-evidence-title"),
    modalEvidenceMetadata: document.getElementById("modal-evidence-metadata"),
    modalEvidenceDesc: document.getElementById("modal-evidence-desc"),
    modalEvidenceContent: document.getElementById("modal-evidence-content"),
    modalClueBanner: document.getElementById("modal-clue-banner"),
    modalClueTitle: document.getElementById("modal-clue-title"),
    modalClueDesc: document.getElementById("modal-clue-desc"),
    btnExtractClue: document.getElementById("btn-extract-clue"),

    // About Modal
    modalAbout: document.getElementById("modal-about")
  },

  /**
   * Switch the visible screen by removing `.active` from all screens
   * and adding it to the target screen element.
   * @param {string} screenId
   */
  showScreen(screenId) {
    const targetScreen = document.getElementById(screenId);
    if (!targetScreen) {
      console.error(`Target screen #${screenId} not found in DOM.`);
      return;
    }

    document.querySelectorAll(".screen").forEach(screen => {
      screen.classList.remove("active");
    });

    targetScreen.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  /**
   * Open a dialog modal with backdrop.
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  },

  /**
   * Close a dialog modal.
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  },

  /**
   * Display a floating toast notification.
   */
  showToast(title, message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const iconMap = {
      clue: "💡",
      info: "ℹ",
      warn: "⚠️"
    };

    toast.innerHTML = `
      <div class="toast-icon">${iconMap[type] || "ℹ"}</div>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    this.elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  },

  /**
   * Start a live UTC clock in the top SOC header.
   */
  startClock() {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, "0");
      const minutes = String(now.getUTCMinutes()).padStart(2, "0");
      const seconds = String(now.getUTCSeconds()).padStart(2, "0");
      if (this.elements.liveClock) {
        this.elements.liveClock.textContent = `${hours}:${minutes}:${seconds} UTC`;
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  },

  /**
   * Update the resume button on the main menu.
   */
  updateResumeButton(hasSave, caseTitle = "") {
    if (!this.elements.btnResume) return;

    if (hasSave) {
      this.elements.btnResume.removeAttribute("disabled");
      this.elements.resumeSubtext.textContent = `Continue: ${caseTitle || "Saved Investigation"}`;
    } else {
      this.elements.btnResume.setAttribute("disabled", "true");
      this.elements.resumeSubtext.textContent = "No saved case found";
    }
  },

  /**
   * Render Case Briefing Screen.
   * @param {Object} caseData
   */
  renderBriefing(caseData) {
    this.elements.briefingCaseId.textContent = caseData.badge;
    this.elements.briefingTitle.textContent = caseData.title;
    this.elements.briefingTarget.textContent = `Target Organization: ${caseData.targetOrg}`;
    this.elements.briefingSummary.textContent = caseData.summary;

    // Objectives list
    this.elements.briefingObjectives.innerHTML = caseData.objectives
      .map(obj => `<li>${obj}</li>`)
      .join("");

    // Preview list
    this.elements.briefingPreviewList.innerHTML = caseData.evidence
      .slice(0, 4)
      .map(ev => `
        <div class="preview-item">
          <span class="preview-type">${ev.category.toUpperCase()}</span>
          <span>${ev.title}</span>
        </div>
      `)
      .join("");
  },

  /**
   * Render the complete Investigation Dashboard.
   * @param {Object} caseData
   * @param {Object} gameState
   */
  renderDashboard(caseData, gameState) {
    if (!caseData) return;

    // 1. Update stats bar
    this.elements.dashCaseTitle.textContent = `${caseData.badge} — ${caseData.title}`;
    
    const totalEvidence = caseData.evidence.length;
    const viewedCount = gameState.viewedEvidenceIds.length;
    this.elements.dashEvidenceCount.textContent = `${viewedCount} / ${totalEvidence}`;

    const totalClues = caseData.evidence.filter(e => e.clue).length;
    const discoveredCluesCount = gameState.discoveredClueIds.length;
    this.elements.dashCluesCount.textContent = `${discoveredCluesCount} / ${totalClues}`;

    const progress = GameEngine.getProgressPercentage();
    this.elements.dashProgressPercent.textContent = `${progress}%`;
    this.elements.dashProgressFill.style.width = `${progress}%`;

    // 2. Update category counts
    const categoryCounts = { logs: 0, email: 0, network: 0, system: 0 };
    caseData.evidence.forEach(ev => {
      if (categoryCounts[ev.category] !== undefined) {
        categoryCounts[ev.category]++;
      }
    });

    if (this.elements.countAll) this.elements.countAll.textContent = totalEvidence;
    if (this.elements.countLogs) this.elements.countLogs.textContent = categoryCounts.logs;
    if (this.elements.countEmail) this.elements.countEmail.textContent = categoryCounts.email;
    if (this.elements.countNetwork) this.elements.countNetwork.textContent = categoryCounts.network;
    if (this.elements.countSystem) this.elements.countSystem.textContent = categoryCounts.system;

    // 3. Render filtered evidence cards
    this.renderEvidenceGrid(caseData.evidence, gameState);

    // 4. Render notebook clues
    this.renderNotebookClues(caseData, gameState.discoveredClueIds);
  },

  /**
   * Render evidence cards according to current category filter.
   */
  renderEvidenceGrid(evidenceList, gameState) {
    const filtered = this.currentCategoryFilter === "all"
      ? evidenceList
      : evidenceList.filter(e => e.category === this.currentCategoryFilter);

    this.elements.evidenceGrid.innerHTML = "";

    filtered.forEach(ev => {
      const isInspected = gameState.viewedEvidenceIds.includes(ev.id);
      const hasClue = Boolean(ev.clue);
      const isClueFound = hasClue && gameState.discoveredClueIds.includes(ev.clue.id);

      const card = document.createElement("article");
      card.className = `evidence-card ${isInspected ? "inspected" : ""} ${isClueFound ? "clue-discovered" : ""}`;
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.dataset.evidenceId = ev.id;

      card.innerHTML = `
        <div class="card-top-row">
          <span class="tag tag-case">${ev.category.toUpperCase()}</span>
          <span class="card-status-badge">
            <span class="status-dot"></span>
            <span>${isClueFound ? "Finding Logged" : isInspected ? "Inspected" : "Unopened"}</span>
          </span>
        </div>
        <h4 class="card-title">${ev.title}</h4>
        <p class="card-desc">${ev.summary}</p>
        <div class="card-footer">
          <span>SRC: ${ev.source}</span>
          <span>${ev.format.toUpperCase()}</span>
        </div>
      `;

      card.addEventListener("click", () => {
        App.handleOpenEvidence(ev.id);
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          App.handleOpenEvidence(ev.id);
        }
      });

      this.elements.evidenceGrid.appendChild(card);
    });
  },

  /**
   * Render discovered clues into the notebook sidebar.
   */
  renderNotebookClues(caseData, discoveredClueIds) {
    this.elements.notebookBadge.textContent = `${discoveredClueIds.length} Found`;

    if (discoveredClueIds.length === 0) {
      this.elements.cluesList.innerHTML = `
        <div class="empty-state">
          <p>No clues identified yet.</p>
          <small>Open an evidence file from the left to begin your forensic analysis.</small>
        </div>
      `;
      return;
    }

    // Collect clue details from case evidence
    const cluesMap = {};
    caseData.evidence.forEach(e => {
      if (e.clue) cluesMap[e.clue.id] = e.clue;
    });

    this.elements.cluesList.innerHTML = discoveredClueIds
      .map(id => {
        const clue = cluesMap[id];
        if (!clue) return "";
        return `
          <div class="clue-item">
            <div class="clue-item-header">
              <span class="clue-item-icon">✓</span>
              <h5 class="clue-item-title">${clue.title}</h5>
            </div>
            <p class="clue-item-desc">${clue.description}</p>
            <span class="clue-connection-tag">LEAD #${clue.category.toUpperCase()}</span>
          </div>
        `;
      })
      .join("");
  },

  /**
   * Render the Evidence Inspector modal.
   * @param {Object} ev - Evidence object
   * @param {boolean} isClueDiscovered - Whether the associated clue is already logged
   */
  renderEvidenceModal(ev, isClueDiscovered) {
    this.elements.modalEvidenceCategory.textContent = ev.category.toUpperCase();
    this.elements.modalEvidenceTitle.textContent = ev.title;

    // Metadata bar
    this.elements.modalEvidenceMetadata.innerHTML = `
      <div class="meta-field">
        <span class="meta-key">SOURCE:</span>
        <span class="meta-val">${ev.source}</span>
      </div>
      <div class="meta-field">
        <span class="meta-key">FORMAT:</span>
        <span class="meta-val">${ev.format.toUpperCase()}</span>
      </div>
      <div class="meta-field">
        <span class="meta-key">TIMESTAMP:</span>
        <span class="meta-val">${ev.timestamp}</span>
      </div>
    `;

    this.elements.modalEvidenceDesc.textContent = ev.summary;

    // Format content with forensic syntax highlighting
    this.elements.modalEvidenceContent.innerHTML = this.highlightContent(ev.content, ev.format);

    // Clue action banner
    if (ev.clue) {
      this.elements.modalClueBanner.style.display = "flex";
      this.elements.modalClueTitle.textContent = ev.clue.title;
      this.elements.modalClueDesc.textContent = ev.clue.description;

      if (isClueDiscovered) {
        this.elements.modalClueBanner.classList.add("extracted");
        this.elements.btnExtractClue.innerHTML = "<span>✓ Finding Recorded</span>";
        this.elements.btnExtractClue.setAttribute("disabled", "true");
      } else {
        this.elements.modalClueBanner.classList.remove("extracted");
        this.elements.btnExtractClue.innerHTML = "<span>Log Finding to Notebook</span>";
        this.elements.btnExtractClue.removeAttribute("disabled");
      }

      this.elements.btnExtractClue.onclick = () => {
        App.handleExtractClue(ev.clue.id);
      };
    } else {
      this.elements.modalClueBanner.style.display = "none";
    }

    this.openModal("modal-evidence");
  },

  /**
   * Apply lightweight forensic syntax highlighting to log text.
   */
  highlightContent(rawText, format) {
    // Escape HTML first to prevent injection
    let text = rawText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Highlight Timestamps
    text = text.replace(/(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}(\.\d+)?|OCT\s\d{2}\s\d{2}:\d{2}:\d{2})/g, '<span class="hl-time">$1</span>');

    // Highlight IP addresses and subnets
    text = text.replace(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?)\b/g, '<span class="hl-ip">$1</span>');

    // Highlight user handles
    text = text.replace(/(user='([^']+)'|user=([a-z_]+))/gi, '<span class="hl-user">$1</span>');

    // Highlight status alerts
    text = text.replace(/(ACCEPTED|SUCCESS|CLOSED)/g, '<span class="hl-status-ok">$1</span>');
    text = text.replace(/(FAILED|INVALID|ALERT|UNREAD|WARNING)/g, '<span class="hl-status-alert">$1</span>');

    return text;
  },

  /**
   * Populate Deduction Board with options from the case data.
   */
  renderDeductionBoard(caseData, currentTheory) {
    // 1. Suspects
    this.elements.suspectOptions.innerHTML = caseData.suspects
      .map(s => `
        <label class="deduction-option">
          <input type="radio" name="suspect" value="${s.id}" ${currentTheory.suspectId === s.id ? "checked" : ""}>
          <div class="option-box">
            <span class="option-label">${s.name}</span>
            <span class="option-subtext">${s.role}</span>
          </div>
        </label>
      `)
      .join("");

    // 2. Vectors
    this.elements.vectorOptions.innerHTML = caseData.vectors
      .map(v => `
        <label class="deduction-option">
          <input type="radio" name="vector" value="${v.id}" ${currentTheory.vectorId === v.id ? "checked" : ""}>
          <div class="option-box">
            <span class="option-label">${v.name}</span>
            <span class="option-subtext">${v.desc}</span>
          </div>
        </label>
      `)
      .join("");

    // 3. Evidence
    this.elements.evidenceOptions.innerHTML = caseData.evidence
      .map(e => `
        <label class="deduction-option">
          <input type="radio" name="evidence" value="${e.id}" ${currentTheory.evidenceId === e.id ? "checked" : ""}>
          <div class="option-box">
            <span class="option-label">[${e.category.toUpperCase()}] ${e.title}</span>
            <span class="option-subtext">Source: ${e.source}</span>
          </div>
        </label>
      `)
      .join("");
  },

  /**
   * Render Results & Debrief screen after evaluation.
   */
  renderResults(report, theory, caseData) {
    // Verdict Banner
    if (report.solved) {
      this.elements.resultsVerdictBanner.className = "results-verdict-banner solved";
      this.elements.verdictIcon.textContent = "✓";
      this.elements.verdictStatusTag.textContent = "CASE SOLVED // ACCURATE RECONSTRUCTION";
      this.elements.verdictTitle.textContent = "Forensic Assessment: Accurate Deduction";
    } else {
      this.elements.resultsVerdictBanner.className = "results-verdict-banner failed";
      this.elements.verdictIcon.textContent = "✕";
      this.elements.verdictStatusTag.textContent = "INCOMPLETE OR INACCURATE DEDUCTION";
      this.elements.verdictTitle.textContent = "Forensic Assessment: Theory Disputed";
    }

    this.elements.verdictScore.textContent = `${report.score}%`;

    // Narrative & Lessons
    this.elements.resultsDebriefText.innerHTML = `
      <p><strong>Case Summary:</strong> ${report.explanation}</p>
    `;

    this.elements.resultsEducationList.innerHTML = report.takeaways
      .map(item => `<li>${item}</li>`)
      .join("");

    // Theory review sidebar
    const suspect = caseData.suspects.find(s => s.id === theory.suspectId);
    const vector = caseData.vectors.find(v => v.id === theory.vectorId);
    const ev = caseData.evidence.find(e => e.id === theory.evidenceId);

    this.elements.reviewSuspect.innerHTML = `
      ${suspect ? suspect.name : "None selected"} 
      <small style="color:${report.isSuspectCorrect ? 'var(--emerald-success)' : 'var(--rose-danger)'}">
        (${report.isSuspectCorrect ? '✓ Correct' : '✕ Incorrect'})
      </small>
    `;

    this.elements.reviewVector.innerHTML = `
      ${vector ? vector.name : "None selected"} 
      <small style="color:${report.isVectorCorrect ? 'var(--emerald-success)' : 'var(--rose-danger)'}">
        (${report.isVectorCorrect ? '✓ Correct' : '✕ Incorrect'})
      </small>
    `;

    this.elements.reviewEvidence.innerHTML = `
      ${ev ? ev.title : "None selected"} 
      <small style="color:${report.isEvidenceCorrect ? 'var(--emerald-success)' : 'var(--rose-danger)'}">
        (${report.isEvidenceCorrect ? '✓ Correct' : '✕ Incorrect'})
      </small>
    `;
  }
};
