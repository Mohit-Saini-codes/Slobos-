/**
 * data.js — Cases, Evidence & Clue Data Definitions
 *
 * Programming Concept: Separation of Data from Logic
 * Game content is defined as pure JavaScript data structures (POJOs - Plain Old JavaScript Objects).
 * By keeping content here, game designers can edit cases or add Case #002 without touching
 * any game engine or UI rendering code.
 */

const CASES = {
  "case-001": {
    id: "case-001",
    title: "The Midnight Login",
    badge: "CASE #001",
    priority: "HIGH",
    difficulty: "Beginner",
    targetOrg: "Oakwood College of Technology",
    incidentTime: "2026-10-04 02:37:12 UTC",
    summary: "At 02:37 UTC, the automated SOC alert system triggered on the primary grading and records database. An active authenticated session altered academic standings during closed hours. You are tasked with analyzing the preserved server artifacts.",
    objectives: [
      "Determine which user account was utilized for unauthorized access.",
      "Identify the intrusion vector used to bypass authentication controls.",
      "Gather forensic evidence proving the perpetrator's identity."
    ],
    // Suspect profiles for deduction
    suspects: [
      {
        id: "suspect-reed",
        name: "Dr. Evelyn Reed",
        role: "Department Chair & Senior Professor",
        desc: "Authorized administrator. Claims she was asleep at the time of the incident."
      },
      {
        id: "suspect-vance",
        name: "Marcus Vance",
        role: "Graduate Teaching Assistant (TA)",
        desc: "Assigned grading permissions. Known to work late on student coursework submissions."
      },
      {
        id: "suspect-cole",
        name: "Tyler Cole",
        role: "Undergraduate CS Student",
        desc: "Facing academic probation. Recently received a failing grade in Algorithms 301."
      }
    ],
    // Attack vectors for deduction
    vectors: [
      {
        id: "vector-phishing",
        name: "Credential Harvesting (Phishing Email)",
        desc: "Lured user into submitting plaintext credentials to a counterfeit portal."
      },
      {
        id: "vector-stolen-session",
        name: "Compromised Active Session Cookie",
        desc: "Hijacked an ongoing authenticated session from an unsecured network connection."
      },
      {
        id: "vector-shared-creds",
        name: "Plaintext Credential Exposure",
        desc: "Credentials leaked in unencrypted communication or misconfigured public storage."
      },
      {
        id: "vector-sql-injection",
        name: "Database SQL Injection Bypass",
        desc: "Direct injection of malicious SQL queries bypassing username/password logic."
      }
    ],
    // Solution Key (Evaluated on theory submission)
    solution: {
      suspectId: "suspect-cole",
      vectorId: "vector-shared-creds",
      evidenceId: "ev-003",
      explanation: "Undergraduate student Tyler Cole discovered Graduate TA Marcus Vance's cleartext credentials accidentally pasted into a public campus IT support ticket. Tyler used these credentials from his dorm room subnet (198.51.100.44) at 02:37 to bump his failing Algorithms grade.",
      educationalTakeaways: [
        "Never share or paste passwords or API keys into public ticketing systems or email.",
        "Implement Multi-Factor Authentication (MFA) to prevent unauthorized logins even when credentials leak.",
        "Monitor anomaly alerts for off-hours logins originating from unapproved IP subnets."
      ]
    },
    // Evidence list will be populated in detail in Phase 3
    evidence: [
      {
        id: "ev-001",
        title: "Radius Authentication Logs",
        category: "logs",
        source: "auth-srv-01.oakwood.edu",
        format: "syslog",
        timestamp: "2026-10-04 02:37:12 UTC",
        summary: "Authentication attempts recorded on the faculty portal during the incident window.",
        content: `OCT 04 02:31:02 auth-srv-01 sshd[10901]: Failed password for invalid user admin from 203.0.113.19 port 44321
OCT 04 02:35:18 auth-srv-01 web-auth[10915]: Login attempt: user='m_vance' source_ip='198.51.100.44'
OCT 04 02:37:12 auth-srv-01 web-auth[10928]: ACCEPTED password for 'm_vance' from '198.51.100.44' (Session: #SES-9821)
OCT 04 02:38:05 auth-srv-01 grade-app[10935]: POST /api/grades/update user='m_vance' course='CS-301' student_id='STU-9402'`,
        clue: {
          id: "clue-login-ip",
          title: "Anomalous Login Origin",
          description: "TA Marcus Vance's account was accessed from IP 198.51.100.44 at 02:37, not the faculty network.",
          category: "logs"
        }
      },
      {
        id: "ev-002",
        title: "Campus Subnet IP Allocation Map",
        category: "network",
        source: "net-admin.oakwood.edu",
        format: "json",
        timestamp: "2026-10-01 00:00:00 UTC",
        summary: "Official IP range allocations for the university campus infrastructure.",
        content: `SUBNET ALLOCATION TABLE:
------------------------------------------------------------
10.14.0.0/16       :: Faculty & Staff Private Offices
10.20.0.0/16       :: Graduate Research Computer Labs
198.51.100.0/24    :: Undergraduate On-Campus Residence Halls (Dorms)
192.0.2.0/24       :: Public Guest Wi-Fi (Throttled)`,
        clue: {
          id: "clue-dorm-subnet",
          title: "Dormitory Subnet Identified",
          description: "IP range 198.51.100.0/24 is assigned to Undergraduate Residence Halls, not faculty offices.",
          category: "network"
        }
      },
      {
        id: "ev-003",
        title: "IT Support Helpdesk Ticket #8841",
        category: "email",
        source: "helpdesk.oakwood.edu",
        format: "ticket",
        timestamp: "2026-10-03 14:15:00 UTC",
        summary: "Public support ticket regarding portal password reset issues.",
        content: `TICKET #8841 [STATUS: CLOSED - PUBLIC VISIBILITY]
Submitter: Marcus Vance <m_vance@oakwood.edu>
Subject: Trouble connecting to grade database from Linux VM

Description:
"Hi Helpdesk, I keep getting a TLS handshake error when connecting my grading script.
I tried running: curl -u m_vance:OakWoodFall26! https://grading.oakwood.edu/api
Can someone verify if port 443 is open for my script?"

Helpdesk Response (14:30):
"Marcus, please do NOT paste your password into public ticket descriptions! Closing ticket. Reset your password immediately."`,
        clue: {
          id: "clue-plaintext-leak",
          title: "Credentials Leaked in Public Ticket",
          description: "TA Marcus Vance accidentally posted his plain password 'OakWoodFall26!' in a public helpdesk ticket.",
          category: "email"
        }
      },
      {
        id: "ev-004",
        title: "Database Modification Audit Trail",
        category: "system",
        source: "db-audit-daemon",
        format: "sql-audit",
        timestamp: "2026-10-04 02:38:05 UTC",
        summary: "Row-level database query logs showing the exact records altered during the session.",
        content: `QUERY LOG [TRANSACTION #TX-44019]
TIMESTAMP: 2026-10-04 02:38:05.112 UTC
DB_USER: grade_writer
CLIENT_IP: 198.51.100.44
STATEMENT:
  UPDATE student_grades 
  SET letter_grade = 'A-', numeric_score = 91.5 
  WHERE course_code = 'CS-301' AND student_id = 'STU-9402';
ROWS_AFFECTED: 1`,
        clue: {
          id: "clue-student-id",
          title: "Targeted Student Record STU-9402",
          description: "The midnight login modified the grade for student STU-9402 in CS-301 from an F to an A-.",
          category: "system"
        }
      },
      {
        id: "ev-005",
        title: "Student Roster: CS-301 Algorithms",
        category: "system",
        source: "registrar.oakwood.edu",
        format: "csv",
        timestamp: "2026-10-01 09:00:00 UTC",
        summary: "Enrollment list and student ID mapping for CS-301.",
        content: `STUDENT_ID,STUDENT_NAME,ENROLLMENT_STATUS,CURRENT_GRADE
STU-9108,Sophia Chen,Enrolled,A
STU-9214,Aiden Ross,Enrolled,B+
STU-9402,Tyler Cole,Enrolled,F (Academic Warning)
STU-9550,Emma Watson,Enrolled,B`,
        clue: {
          id: "clue-tyler-identity",
          title: "STU-9402 Belongs to Tyler Cole",
          description: "Student ID STU-9402 belongs to undergraduate Tyler Cole, who was on academic warning with an F.",
          category: "system"
        }
      },
      {
        id: "ev-006",
        title: "Marcus Vance Email Inbox (Filtered)",
        category: "email",
        source: "mail.oakwood.edu",
        format: "email",
        timestamp: "2026-10-03 23:45:00 UTC",
        summary: "Incoming messages in Marcus Vance's academic email account.",
        content: `FROM: security-alerts@oakwood.edu
TO: m_vance@oakwood.edu
DATE: Oct 03, 2026, 14:32 UTC
SUBJECT: Mandatory Password Reset Notice

"Marcus, our automated filter flagged a credential leak in Ticket #8841. You must reset your password within 24 hours."

[STATUS: UNREAD]
(Recipient had not opened or acted on this email prior to the 02:37 UTC incident)`,
        clue: {
          id: "clue-unreset-password",
          title: "Password Never Reset",
          description: "Marcus Vance did not read the security alert, meaning the leaked password remained active during the intrusion.",
          category: "email"
        }
      },
      {
        id: "ev-007",
        title: "Dr. Evelyn Reed Network Telemetry",
        category: "network",
        source: "netflow-sensor-04",
        format: "netflow",
        timestamp: "2026-10-04 02:30:00 UTC",
        summary: "Network traffic logs associated with Dr. Reed's workstation and VPN account.",
        content: `SESSION TABLE: USER 'e_reed'
------------------------------------------------------------
LAST_ACTIVE: 2026-10-03 18:22:10 UTC (Office Workstation 10.14.2.11)
VPN_SESSION: INACTIVE (No VPN tunnels opened in past 24 hours)
STATUS: No telemetry observed between 22:00 and 06:00 UTC.`,
        clue: {
          id: "clue-reed-cleared",
          title: "Dr. Reed Inactive",
          description: "Network telemetry confirms Dr. Reed had zero active sessions or VPN connections during the incident window.",
          category: "network"
        }
      },
      {
        id: "ev-008",
        title: "Residence Hall Switch Port Telemetry",
        category: "network",
        source: "sw-dorm-b3.oakwood.edu",
        format: "arp-table",
        timestamp: "2026-10-04 02:35:00 UTC",
        summary: "DHCP and MAC binding table for Dormitory Hall B, 3rd Floor.",
        content: `PORT  | IP_ADDRESS     | MAC_ADDRESS       | REGISTERED_DEVICE
Fa0/12| 198.51.100.44  | 00:1A:2B:3C:4D:5E | Dorm-Room-314-Laptop
Fa0/13| 198.51.100.45  | A4:83:E7:12:34:56 | Dorm-Room-315-Phone
NOTE: Dorm Room 314 is currently assigned to student Tyler Cole.`,
        clue: {
          id: "clue-mac-binding",
          title: "Source IP Traced to Room 314",
          description: "Physical network switch port logs directly tie IP 198.51.100.44 to Tyler Cole's assigned dorm room (314).",
          category: "network"
        }
      }
    ]
  }
};
