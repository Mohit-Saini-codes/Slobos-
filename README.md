# Cyber Detective // Incident Response Terminal

A modern, immersive browser-based digital forensics and incident response (DFIR) investigation simulation.

---

## 🔍 Overview

**Cyber Detective** puts you in the shoes of a Digital Forensics & Incident Response (DFIR) analyst stationed at an automated Security Operations Center (SOC) terminal. Your objective is to examine raw server artifacts, correlate timestamps, analyze network traffic, inspect emails, and deduce threat actors and attack vectors.

### Features
- **Interactive SOC Terminal UI**: Sleek, dark-mode cybersecurity workstation styling with live log clocks, breadcrumb navigation, and incident status monitors.
- **Evidence Inspection**: Deep dive into raw authentication logs, web server access records, packet capture excerpts (PCAP), and phishing artifacts.
- **Deduction & Hypothesis Engine**: Formulate conclusions by tagging suspects, entry points, and forensic evidence to solve each case.
- **Modular Data Architecture**: Built with vanilla JavaScript, cleanly decoupling incident data, state machine logic, and UI rendering.
- **Responsive & Lightweight**: Pure HTML5, CSS3, and modern JavaScript without heavy dependencies or build steps.

---

## 📁 Project Structure

```
Cyber Detective/
├── index.html        # Terminal interface and UI views
├── css/
│   └── style.css     # Cyberpunk / SOC dark theme styles
├── js/
│   ├── app.js        # Main initialization & routing logic
│   ├── data.js       # Case definitions, suspects, and artifact data
│   ├── game.js       # Game state management and scoring
│   ├── storage.js    # LocalStorage persistence for case progress
│   └── ui.js         # Interactive DOM rendering and notifications
└── README.md         # Project documentation
```

---

## 🚀 Getting Started

Simply open `index.html` in any modern web browser:

1. Clone this repository:
   ```bash
   git clone https://github.com/Mohit-Saini-codes/Slobos-.git
   ```
2. Open `index.html` in your favorite web browser (Chrome, Edge, Firefox, Safari):
   ```bash
   start index.html
   ```

---

## 🛡️ Disclaimer

All IP addresses, domain names, credentials, logs, and corporate entities depicted in this simulation are entirely fictional and designed for cybersecurity educational and entertainment purposes.
