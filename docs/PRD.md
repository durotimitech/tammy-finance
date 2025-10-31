# Product Requirements Document: Tammy Finance

**Author:** Timmy Mejabi
**Version:** 1.0
**Date:** October 31, 2025
**Status:** Done

## 1. Overview

Tammy Finance is a Software-as-a-Service (SaaS) web application specifically designed for individuals pursuing Financial Independence, Retire Early (FIRE). Unlike general-purpose budgeting or net worth trackers (like Mint's successors or Empower), Tammy Finance core purpose is to **connect every financial data point directly to the user's "time to freedom."**

The platform is built on a "privacy-first" premium model. It will not have ads or sell user data. Its value proposition is justified by providing automation, advanced scenario modeling, and proactive insights that help users not only _track_ their FIRE journey but _accelerate_ it.

## 2. Problem Statement

The FIRE community is currently underserved by a fragmented toolset.

- **The User Problem:** Individuals pursuing FIRE must cobble together multiple tools: a "messy spreadsheet" for FIRE projections, a separate app for budgeting (like YNAB), and another for investment tracking (like Empower). None of these tools talk to each other, and none are built from the ground up to answer the user's primary question: **"How does my spending today affect my retirement date tomorrow?"**
- **The Market Problem:** "Free" tools monetize by selling user data or aggressively upselling users to wealth management services, which misaligns incentives. Users are increasingly privacy-conscious and are willing to pay for a tool that serves _their_ interests exclusively.

## 3. Goals & Objectives

| Goal                             | Objective                                                                                                                                        |
| :------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| **User Goal**                    | Confidently answer "When can I retire?" and understand the levers that change this date in real-time.                                            |
| **Business Goal (Acquisition)**  | Become the "go-to" free FIRE calculator on the market by providing the best _manual_ dashboard, replacing spreadsheets.                          |
| **Business Goal (Monetization)** | Achieve a **3-5%** free-to-paid conversion rate by demonstrating indispensable value through automation and "what-if" modeling.                  |
| **Product Goal (Retention)**     | Achieve a < 5% monthly churn by becoming the single source of truth for the user's financial life, deeply integrated into their planning habits. |

## 4. Target Audience & User Personas

### Persona 1: "The Spreadsheet Optimizer" (Free Tier Target)

- **Who:** 25-40, tech-savvy, DIY-oriented.
- **Behavior:** Currently uses a complex Google Sheet to track their FIRE journey. They love to optimize and see the numbers.
- **Pain Point:** Their spreadsheet is manual, error-prone, hard to maintain, and not accessible on the go.
- **Goal:** A clean, dedicated, and free dashboard that does the calculations for them and visualizes their progress.

### Persona 2: "The Time-Poor Professional" (Premium Tier Target)

- **Who:** 30-45, high-earner (e.g., tech, medicine, finance), married or single.
- **Behavior:** Deeply interested in FIRE but has no time or patience for manual data entry.
- **Pain Point:** "I know I'm saving a lot, but I feel blind. I have no idea if I'm on track, and my free 'Empower' dashboard doesn't get my FIRE goals."
- **Goal:** A "set it and forget it" co-pilot that automatically tracks everything, shows them their "time to freedom," and provides high-level insights.

## 5. Functional Requirements (User Stories)

### Epic 1: Core App & Onboarding

- **Story:** As a new user, I want to create an account using an email and password or an OAuth provider (Google) so I can securely access the platform.
- **Story:** As a new user, I want to be guided through a simple 3-step setup wizard to establish my **core FIRE variables** (Current Age, Target Retirement Age, Current Invested Assets, Monthly Expenses) so I can see my main dashboard populate immediately.
- **Story:** As a user, I want to be able to enable Multi-Factor Authentication (MFA) to secure my financial data.

### Epic 2: The FIRE Dashboard (The "Why")

This is the user's homepage.

#### **Free (Manual) Tier:**

- **Story:** As a free user, I want to manually input my core vitals (Total Invested Assets, Avg. Monthly Savings, Avg. Monthly Expenses) on my dashboard.
- **Story:** As a free user, I want to see my key FIRE metrics calculated for me:
  - **FIRE Number:** `(Annual Expenses * 25)`
  - **FI Percentage:** `(Current Invested Assets / FIRE Number)`
  - **Savings Rate:** `(Monthly Savings / Monthly Income)`
- **Story:** As a free user, I want to see a simple "Path to FI" line chart that projects my net worth growth to my FIRE Number.
- **Story:** As a free user, I want a settings panel to adjust my global assumptions (Expected Investment Return %, Inflation %, Safe Withdrawal Rate %).

#### **Premium (Automated) Tier:**

- **Story:** As a premium user, I want all my dashboard vitals (Assets, Savings, Expenses) to be **populated automatically** from my synced accounts.
- **Story:** As a premium user, I want to access a "What-If" scenario lab to model the impact of:
  - "Increasing my savings by $X / month"
  - "Taking a 1-year sabbatical (0 savings)"
  - "A one-time event (e.g., inheritance, home purchase)"
  - "A market crash of X%"
- **Story:** As a premium user, I want to create and track **multiple FIRE goals** (e.g., "Lean FIRE," "Standard FIRE," "Fat FIRE") and see my projections for all three.
- **Story:** As a premium user, I want to see "Coaching Insight" cards on my dashboard (e.g., "Your savings rate has pulled your FIRE date forward by 3 months!").

### Epic 3: Net Worth (The "Engine")

#### **Free (Manual) Tier:**

- **Story:** As a free user, I want to manually create _unlimited_ asset and liability accounts (e.g., "Chase Checking," "401k," "Mortgage").
- **Story:** As a free user, I want to manually update the balance for each account.
- **Story:** As a free user, I want to receive a prompt (e.g., on the 1st of the month) to update my balances so I don't forget.
- **Story:** As a free user, I want to see a historical line chart of my net worth and a pie chart of my A/L breakdown.

#### **Premium (Automated) Tier:**

- **Story:** As a premium user, I want to securely connect all my financial accounts (banks, brokerages, credit cards, loans) via a 3rd-party aggregator (e.g., Plaid) so my balances update automatically.
- **Story:** As a premium user, I want to connect a real estate API (e.g., Zillow) to track my home's value automatically.
- **Story:** As a premium user, I want a dedicated module to track my employee stock (RSUs, ESPP) and their vesting schedules.

### Epic 4: Budget (The "Control Panel")

#### **Free (Manual) Tier:**

- **Story:** As a free user, I want a simple form to manually add transactions (Income or Expense) and assign them a category.
- **Story:** As a free user, I want to see a monthly summary of `Income vs. Expenses` to find my **Net Savings**.
- **Story:** As a free user, I want my calculated **Net Savings** to automatically populate the "Avg. Monthly Savings" field on my FIRE Dashboard, closing the feedback loop.

#### **Premium (Automated) Tier:**

- **Story:** As a premium user, I want all my transactions from my synced accounts to be automatically imported and categorized.
- **Story:** As a premium user, I want a "Subscription Hunter" tool that finds and lists all my recurring charges.
- **Story:** As a premium user, I want to see a cash flow analysis (e.g., Sankey diagram) showing where my money comes from and where it goes.
- **Story:** As a premium user, I want to receive alerts for unusual spending or if I'm trending over budget in a category that impacts my FIRE goal.

## 6. Tiered Feature Breakdown

| Feature             | Free (Manual) Tier                               | Premium (Auto) Tier                                       |
| :------------------ | :----------------------------------------------- | :-------------------------------------------------------- |
| **Primary Value**   | A great _calculator_ & _spreadsheet replacement_ | A time-saving _automated co-pilot_                        |
| **FIRE Calculator** | Simple, manual-entry projection                  | "Live" data, "What-If" scenarios, multiple goals          |
| **Net Worth**       | Manual account entry. Monthly update reminders.  | Auto-sync all accounts, crypto, and real estate.          |
| **Budgeting**       | Manual transaction entry.                        | Auto-import & categorize transactions.                    |
| **Insights**        | None. User must analyze their own data.          | Proactive coaching, alerts, and "money-finding" insights. |
| **The Pitch**       | "Calculate your FIRE date for free."             | "Reach your FIRE date _faster_."                          |

## 7. Non-Functional Requirements

- **Security:**
  - All user data must be encrypted at rest (AES-256) and in transit (TLS 1.2+).
  - We will **never** store user financial credentials. All aggregation will be handled by a secure, token-based 3rd-party (e.g., Plaid, Finicity).
  - MFA (TOTP) must be available to all users.
- **Privacy:**
  - The business model is subscription-only. We must have an iron-clad privacy policy stating we **will never sell or share user data** with advertisers or third parties.
- **Performance:**
  - Authenticated dashboard must load in `< 2 seconds`.
  - Backend account sync jobs must not block the user interface.
- **Usability:**
  - The V1 product will be a responsive web application (mobile-first design). The UI must be clean, uncluttered, and inspiring.

## 8. Out of Scope (V2 / Future)

The following features are explicitly **out of scope** for V1 to ensure a focused and rapid launch:

- Native iOS or Android applications (V1 is responsive web).
- Direct investment advice or portfolio recommendations (we are a _dashboard_, not an _advisor_).
- Tax planning, optimization, or tax-loss harvesting.
- Bill pay or money movement.
- Advanced DeFi/non-custodial crypto wallet tracking.
- Support for non-US banks or currencies.

## 9. Success Metrics

- **Acquisition (Free):** Weekly new user signups; % of users who complete onboarding.
- **Activation (Free):** % of users who log in more than 1x/week.
- **Conversion (Premium):** Free-to-Premium trial start rate; Trial-to-Paid conversion rate (Target: > 40%).
- **Retention (Premium):** Monthly Churn Rate (Target: < 5%).

## 10. Assumptions & Dependencies

- **Assumption:** The primary pain point of the "Spreadsheet Optimizer" (Persona 1) is the _manual data entry_, which will be a strong motivator to upgrade.
- **Assumption:** The "Time-Poor Professional" (Persona 2) will see immediate value in the Premium offering and will be less price-sensitive.
- **Dependency:** A robust and reliable integration with a financial data aggregator (Plaid, Finicity, etc.) is **critical** for the entire Premium tier. The cost of this API will be the primary COGS.
