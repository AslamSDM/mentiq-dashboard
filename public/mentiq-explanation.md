Dashboards
Feature 1: Dashboards
Dashboards are the central control panel where founders, product managers, and success teams can see all the signals that matter for retention and churn. They pull in multiple streams of product, account, and financial data, and visualize them in one view.

Here’s the breakdown of each metric tracked, how it’s calculated, and what it reveals.

1. Location
   ● What it is: Geographical distribution of users/accounts.
   ● How we track it:
   ○ Captured via IP address or browser/device locale at login.
   ○ Stored in user profile metadata.
   ● Why it matters:
   ○ Certain markets may show higher retention or adoption.
   ○ Helps guide localization or region-specific churn strategies.
2. Device
   ● What it is: The type of device used (desktop, mobile, tablet, OS).
   ● How we track it:
   ○ Captured from browser agent string or SDK
   ● Why it matters:
   ○ Friction can be device-specific (e.g., mobile bugs leading to churn).
   ○ Optimizations can focus on devices with high churn.

3. Adoption Metrics
   ● What it is: How much of the product’s core features are being used.
   ● How we track it:
   ○ Define “Core Features” (e.g., Feature A, Feature B).
   ○ Adoption Rate (%) = (Users who engaged with a feature at least once ÷ Total active users) × 100
   ○ Track both individual feature adoption and % of users adopting all key features.
   ● Why it matters:
   ○ Lack of adoption = future churn.
   ○ Feature-specific drop-offs show where onboarding fails.

4. Engagement Metrics
   ● What it is: Frequency and depth of user interactions.
   ● Metrics + Formulas:
   ○ DAU (Daily Active Users): Count of unique users active in the last 24h.
   ○ WAU (Weekly Active Users): Count of unique users active in the last 7 days.
   ○ MAU (Monthly Active Users): Count of unique users active in the last 30 days.
   ○ Stickiness Ratio = DAU ÷ MAU → Measures habit strength (e.g., 0.3 = users log in 30% of days).
   ○ Session Frequency = Avg. number of sessions per user per day/week/month.
   ○ Session Length = Avg. duration (login → logout, or activity start → end).
   ● How we track it:
   ○ Event stream timestamps.
   ○ Sessionization logic (grouping events until inactivity >30 mins).
   ● Why it matters:
   ○ Drop in frequency/length = churn risk.
   ○ Stickiness is a direct measure of product-market fit.

5. Retention
   ● What it is: How many users stick around over time.
   ● Formulas:
   ○ Classic Retention (Day N) = (Users active on Day N ÷ Users who signed up on Day 0) × 100
   ○ Rolling Retention (Day N) = % of users active on or after Day N.
   ○ Cohort Retention: Group users by signup week/month → track retention curves.
   ● How we track it:
   ○ Cohort analysis engine (signup date + activity logs).
   ● Why it matters:
   ○ Reveals how sticky the product is beyond the honeymoon period.

6. Conversion
   ● What it is: Movement from free trial → paid, or lower-tier → higher-tier.
   ● Formulas:
   ○ Trial-to-Paid Conversion Rate = (Number of trial users converted to paid ÷ Total trial users) × 100
   ○ Upgrade Rate = (Number of accounts upgrading to higher tier ÷ Total accounts eligible) × 100
   ● How we track it:
   ○ Billing integrations (Stripe, Paddle, etc.) + signup metadata.
   ● Why it matters:
   ○ Weak conversion funnels = revenue leakage + churn risk.

7. Churn
   ● What it is: Rate at which users/customers cancel or stop engaging.
   ● Types:
   ○ Customer Churn Rate = (Customers lost in period ÷ Customers at start of period) × 100
   ○ Revenue Churn Rate (MRR Churn) = (MRR lost in period – MRR gained from upgrades) ÷ MRR at start of period × 100
   ● How we track it:
   ○ Billing system (for revenue churn).
   ○ Activity signals (for engagement churn).
   ● Why it matters:
   ○ This is the North Star metric for retention SaaS.

8. Revenue
   ● What it is: Money earned by account tiers, plans, and usage.
   ● Metrics:
   ○ MRR (Monthly Recurring Revenue) = Sum of all active subscriptions in a given month.
   ○ ARR (Annual Recurring Revenue) = MRR × 12.
   ○ ARPU (Avg. Revenue Per User) = Total MRR ÷ Active Paying Users.
   ○ Expansion Revenue = Upgrades + Add-ons.
   ● How we track it:
   ○ Pulled directly from billing integrations (Stripe, Recurly, etc.).
   ● Why it matters:
   ○ Connects churn → actual dollars lost.
   ○ Helps prioritize where to focus retention fixes.

User Health Score
Feature 2: User Health Score
The User Health Score is a composite score (0–100) that represents the overall likelihood of a user or account to stay, expand, or churn. Think of it as a credit score for retention. It distills multiple signals (engagement, adoption, sentiment, account context, etc.) into a single, easy-to-interpret number.

1. Core Inputs (Signals Feeding the Score)
   The health score combines four key dimensions:

A. Engagement
● Signals tracked:
○ DAU/WAU/MAU ratios (stickiness).
○ Session frequency (logins/week).
○ Session length (avg. duration).
● Scoring logic:
○ High engagement = +points.
○ Decline in DAU/WAU/MAU >30% over 2 weeks = –points.
○ Example metric weight: 30% of total health score.
B. Adoption
● Signals tracked:
○ % of core features used (e.g., 3 of 5 must-have features).
○ Time to First Key Action (activation event).
○ Depth of feature use (repeated use, not just one-time).
● Formula:
○ Adoption Rate = (Number of core features used by user ÷ Total core features defined) × 100
● Scoring logic:
○ ≥80% adoption = +25 points.
○ 50–80% adoption = +15 points.
○ <50% adoption = +0 to negative points.
○ Example metric weight: 25% of total score.

C. Churn Risk Signals
● Signals tracked:
○ Inactivity (e.g., no login for 14 days).
○ Rage clicks (multiple repeated clicks in <1s).
○ Drop-offs in onboarding or checkout flows.
○ Support signals: # of support tickets in last 30 days.
● Scoring logic:
○ Each risk signal subtracts points (–5 to –20 depending on severity).
○ Example: Rage click detected = –10 points.
○ Example metric weight: 30% of total score.

D. Account Context
● Signals tracked:
○ Plan tier (higher-tier customers are generally “stickier”).
○ Signup date (new users = unstable, long-term users = loyal).
○ Trial vs. Paid status.
● Scoring logic:
○ Paid customer on enterprise plan = +10 points.
○ New trial user (less than 7 days old) = neutral baseline (0).
○ Example metric weight: 15% of total score.

2. Composite Score Calculation
   Final health score is weighted across all categories:

Health Score (0–100) = (Engagement Score × 0.30) + (Adoption Score × 0.25) + (Churn Risk Score × 0.30) + (Account Context Score × 0.15)
Where:

● E = Normalized engagement score (0–100).
● A = Adoption score (0–100).
● C = Churn risk score (0–100).
● AC = Account context score (0–100).
Example:

● Engagement: 70
● Adoption: 60
● Churn risk: 50
● Account context: 80
Health Score (0–100) = (E × 0.30) + (A × 0.25) + (C × 0.30) + (AC × 0.15)

3. Score Ranges (Interpretation)
   ● 80–100 (Healthy) → Retained & potential expansion.
   ● 60–79 (At Risk) → Needs nurturing; watch closely.
   ● 40–59 (Critical) → High churn probability; intervention needed now.
   ● 0–39 (Churn Imminent) → Likely already disengaged.

4. How it Helps Founders
   ● Prioritization: Customer success can focus on low-score accounts.
   ● Forecasting: Leadership can project churn likelihood across cohorts.
   ● Targeting: Marketing can export “critical” accounts and send specialized promos.
   ● Simplicity: Instead of drowning in metrics, one score drives action.

5. Technical Build Needed
   ● Scoring Algorithm: Weighted formulas + ML refinement over time.
   ● Compute Service: Batch job (daily) + real-time triggers (login events, billing updates).
   ● API & UI:
   ○ Badge (Healthy, At Risk, Critical).
   ○ Sortable lists of users by score.
   ○ Export CSV or direct integration into CRM.

Path Analysis & Behavior
Feature 3: Path Analysis & Behavioral Cohorts
This feature answers two big questions:

1. “What paths do users take before they convert, upgrade, or churn?”
2. “What groups of users behave in similar ways, and what does that mean for retention?”
   It combines event-sequence analysis (Path Analysis) and segmentation logic (Behavioral Cohorts).

3. Path Analysis
   What it is
   A flow map that shows the step-by-step journey users take inside the product — from signup → onboarding → first key action → long-term retention OR → drop-off → churn.

Data Tracked
● Event streams: Every action is an event with timestamp + user ID.
○ Examples: “Signed Up”, “Clicked Feature A”, “Completed Onboarding Step 3”, “Cancelled Subscription”.
● Session metadata: Which events happen in the same visit.
● Conversion events: Trial-to-paid, upgrade.
● Drop-off events: Inactivity, abandoned flow, cancel event.
How it’s Calculated (Math / Logic)
● Events are ordered chronologically per user → then aggregated across all users.
● The algorithm builds top paths by frequency (e.g., “Signup → Skip Onboarding → Abandon”).
● Drop-off rates are percentages at each step: = (Users who left at Step N ÷ Users who reached Step N) × 100
● Conversion rates between steps are also tracked.
Why it Matters
● Reveals friction points (e.g., 60% abandon at “Invite Teammates” screen).
● Shows high-value paths (e.g., “Users who adopted Feature X in Week 1 = 3x retention”).
● Guides roadmap fixes by highlighting bottlenecks. 2. Behavioral Cohorts
What it is
Groups of users segmented by behavior, not demographics. Instead of “users in Canada”, we ask “users who adopted Feature A but never Feature B”.

Data Tracked
● Event conditions: “Used Feature X 3+ times”, “No login in 14 days”, “Cancelled subscription”.
● Time windows: First 7 days after signup, last 30 days, rolling activity.
● Account metadata: Plan tier, signup source, etc.
Cohort Logic (AND/OR Examples)
● AND condition: “Users who completed onboarding and upgraded within 14 days.”
● OR condition: “Users who engaged with Feature X or Feature Y.”
● Exclusions: “Exclude churned users from this segment.”
How it’s Calculated
● SQL-like query builder translates into filters on event logs.
● Cohorts are dynamic (update as users qualify/leave).
● Stored definitions allow re-use across dashboards and playbooks.
Why it Matters
● Helps compare retained vs. churned cohorts to find key differences.
● Enables targeted interventions (e.g., nudge users who haven’t touched Feature X by Week 2).
● Provides benchmarks: “Cohort A = 20% churn, Cohort B = 5% churn.” 3. How Path + Cohorts Work Together
● Path Analysis shows where users drop off.
● Cohorts group who drops off and what they did/didn’t do.
● Example:
○ Path: “Signup → Skipped Onboarding → Churned by Month 1.”
○ Cohort: “Users who skipped onboarding = 3x churn risk.”
○ → Intervention: Auto-email or in-app nudge to push onboarding completion. 4. Technical Build Needed
● Path Analysis Engine: Aggregates event sequences into flows.
● Cohort Builder: UI + logic for AND/OR/exclusions.
● Visualization Layer: Sankey diagrams for paths; segment tables for cohorts.
● Data Requirements:
○ Event streams with timestamps + feature IDs.
○ Conversion/drop-off flags.
○ User/account metadata.

Churn Risk & Signals
Feature 4: Churn Risk & Signals
This feature is essentially early warning radar. It monitors user behavior, adoption, and account signals to flag accounts most likely to churn before it happens.

1. Core Idea
   Instead of waiting for cancellations, Mentiq proactively surfaces users at risk using a combination of:

● Rules-based thresholds (clear red flags).
● Machine learning models (pattern recognition over time).
● Real-time alerts (email, Slack, dashboard notifications). 2. Signals Tracked
A. Engagement Decay
● Signals:
○ Last login date.
○ Drop in DAU/WAU/MAU ratios.
○ Decreasing session length or frequency.
● Calculation:
○ Define “inactive threshold” (e.g., no login >14 days).
○ Engagement Decay %= (Current activity in last 30 days ÷ Baseline activity in previous 30 days) × 100
○ If <70% → flag as risk.
B. Feature Abandonment
● Signals:
○ Users stop using a “must-have” feature they previously adopted.
○ Example: Feature X was used 5+ times in Month 1, now 0 times in Month 2.
● Calculation:
○ Abandonment Rate = (Number of paying users who stopped using a key feature ÷ Number of paying users who had previously adopted that feature) × 100
● Why it matters:
○ Losing key feature usage is one of the strongest churn predictors.
C. Frustration Signals
● Signals:
○ Rage clicks (multiple rapid clicks).
○ High error rates in workflows.
○ Frequent failed searches or retries.
● Tracking:
○ Frontend SDK captures UI interaction anomalies.
○ Error logs integrated with product analytics.
● Scoring:
○ Each frustration event subtracts from health score (e.g., –10 points).
D. Account Changes
● Signals:
○ Downgrade in plan tier.
○ Trial expiration without conversion.
○ Reduction in seat count (e.g., team shrinks from 10 → 4 users).
● Tracking:
○ Billing integrations (Stripe, Recurly, etc.).
○ Subscription metadata.
● Scoring:
○ Each downgrade event = flagged as churn-likely within 30 days. 3. Churn Risk Scoring Engine
Mentiq combines all signals into a risk score (similar to the Health Score but focused only on churn probability).

Example Formula:
Churn Risk Score = (Engagement Decay × 0.40) + (Feature Abandonment × 0.30) + (Frustration × 0.20) + (Account Changes × 0.10)
● Score outputs 0–100 (100 = highest churn risk).
● Thresholds:
○ 80–100 = Imminent Churn (alert immediately).
○ 60–79 = At Risk (customer success intervention needed).
○ <60 = Safe for now. 4. How it Helps Founders & Teams
● Customer Success: Proactive reach-outs instead of reactive saves.
● Product Team: See which features/products correlate with churn signals.
● Leadership: Trust-building → “We saw churn coming, and here’s what we did.” 5. Technical Build Needed
● Rules Framework: Admins can set thresholds (e.g., “flag user if inactive >10 days”).
● ML Models: Train on historical data (who churned vs. who didn’t).
● Alerting System:
○ Dashboard warnings.
○ Slack/email notifications.
○ API hooks for CRM updates.

Session Replay
Feature 5: Session Replay
Session Replay lets teams watch how users interact with the product in real time (or retroactively) by recording and reconstructing their sessions. Instead of guessing why someone churned, teams can literally see the experience through the user’s eyes.

1. What It Captures
   ● User interactions:
   ○ Clicks, taps, scrolls, text inputs, hovers.
   ● Page/Screen navigation:
   ○ Which pages they visited and in what order.
   ● DOM mutations:
   ○ Changes to the interface (e.g., error banners, form validation messages).
   ● Viewport context:
   ○ What portion of the page was visible to the user.
   ● Optional metadata:
   ○ Network requests, load times, console errors.
   Note on Privacy: Sensitive fields (passwords, payment details, personal info) are masked before capture to ensure compliance.

2. How It’s Tracked
   ● Frontend SDK records:
   ○ DOM snapshots at intervals.
   ○ Event diffs (instead of full page reloads, saves storage).
   ● Encoding & Storage:
   ○ Events are compressed and stored in object storage (e.g., S3).
   ○ Indexed by user ID + session timestamp.
   ● Replay Player:
   ○ UI timeline where teams can scrub through the session.
   ○ Event overlays (highlight clicks, errors, rage signals).
3. Key Metrics & Signals from Session Replays
   ● Drop-off points:
   ○ Where users quit flows (e.g., halfway through onboarding).
   ● Rage clicks:
   ○ Multiple rapid clicks on the same element.
   ● Rage Clicks = (Clicks on element within 1 second interval ÷ Total clicks) × 100
   ● Dead clicks:
   ○ Clicking elements that don’t respond.
   ● Error replays:
   ○ Capturing console/network errors during the session.
   ● Path confirmation:
   ○ Aligns with Path Analysis (Feature 3) by showing why a step failed.

4. Why It Matters for Churn Reduction
   ● UX Debugging: Engineers can replay bugs exactly as users experienced them.
   ● Friction Discovery: Product teams can see where onboarding breaks down.
   ● Churn Context: Customer success teams can review the final sessions of users before cancellation.
   ● Empathy Tool: Leadership can literally watch “what it felt like to churn.”
5. Example Use Cases
   ● A trial user rage clicks on the “Upgrade” button → sees no response → cancels.
   ● A paying user repeatedly encounters a login error → drops usage → churns within 30 days.
   ● An onboarding session where 80% of users stop at “Step 3” → product team fixes it → churn drops.
6. Technical Build Needed
   ● Capture SDK (browser + mobile): Collect DOM, events, viewport.
   ● Encoder Service: Compresses events to efficient replay format.
   ● Storage System: Object store (AWS S3) + indexing for fast retrieval.
   ● Replay Player UI: Timeline, event markers, speed controls.
   ● Masking Rules: Regex or field-based masking for sensitive data.

Automated Growth
Feature 6: Automated Growth Playbooks (Paying Users Only)
Automated Growth Playbooks transform Mentiq from a reporting tool into a decision engine. Instead of simply showing churn signals, it generates actionable recommendations for founders and customer success teams to reduce churn and grow revenue.

1. What It Is
   ● A recommendation engine that connects usage, churn signals, and revenue data to specific actions.
   ● Built on rules + AI, so every alert is paired with a suggested playbook.
   ● Recommendations surface directly in the dashboard (and optionally via Slack/email).
2. Inputs (Data Sources)
   ● Adoption Metrics: Which features are heavily used vs. skipped.
   ● Churn Signals: Drops in Health Score, engagement decay, rage clicks, downgrades.
   ● Cohorts: Behavioral groupings (e.g., “Power users of Feature A” vs. “Inactive accounts”).
   ● Revenue Data: Cancellations, downgrades, seat count reductions, MRR leakage.
3. Examples of Playbook Recommendations
   A. Onboarding for Paid Accounts
   ● Signal: 40% of new Pro accounts are not using Feature X after 30 days.
   ● Playbook: “Trigger in-app walkthrough for Feature X within the first week of subscription.”
   B. Preventing Downgrades
   ● Signal: 10 enterprise accounts reduced seat count by >50% this month.
   ● Playbook: “Assign customer success manager outreach to reinforce Feature Y adoption (top retention driver).”
   C. Expanding High-Value Accounts
   ● Signal: Mid-tier accounts using Feature Z weekly have a 3x higher LTV.
   ● Playbook: “Offer targeted upgrade campaign to Pro plan for these accounts.”
   D. Churn Rescue
   ● Signal: 15 accounts dropped below Health Score 40.
   ● Playbook: “Send personalized retention emails and flag for CSM check-in.”
4. How It Works (Logic + Math)
5. Detection Layer
   ○ Scans adoption, engagement, churn signals, and revenue leakage daily.
   ○ Flags anomalies or high-risk trends.
6. Recommendation Layer
   ○ Maps detected issue → relevant playbook.
   ○ Example Rule: IF Health Score < 50 AND Feature Adoption < 30% → Recommend Adoption Playbook
7. AI Layer (optional)
   ○ Finds hidden correlations in data (e.g., “Accounts using Feature Y weekly are 70% less likely to churn”).
   ○ Suggests playbooks not tied to pre-built rules.

8. Delivery of Playbooks
   ● Dashboard Widget: Shows the top 3 recommended actions daily/weekly.
   ● Exports: Push playbook-triggered accounts into CRM (HubSpot, Salesforce).
   ● Alerts: Send alerts to Slack/email with “next step” links.
9. Why It Matters for Churn Reduction
   ● Action over analysis: Founders don’t waste time interpreting data — they act.
   ● Customer Success Prioritization: Focus only on accounts where intervention will save the most revenue.
   ● Revenue Growth: Turns usage insights into upsell/expansion opportunities.
   ● Scalability: A small team can manage churn like a larger CS department by relying on automated playbooks.
10. Technical Build Needed
    ● Rules Engine: If/then conditions mapped to metrics.
    ● AI Insights Engine: Optional machine learning correlations.
    ● Playbook Library: Standard churn-reduction strategies (adoption nudges, downgrade rescues, upgrade prompts).
    ● UI Integration: Dashboard cards, exports, and notification triggers.

Revenue Leakage
Feature 7: Revenue Leakage Detector (Paying Users Only)
This feature tracks where paying customers are slipping away and quantifies the revenue lost from churned or downgraded accounts.

Instead of generic churn %, Mentiq makes the financial impact visible:
“You lost $8,200 MRR last month from cancellations — $5,000 from enterprise, $3,200 from SMB.”

1. What It Tracks
   ● Cancellations (Voluntary Churn)
   ○ Paying users who end their subscription.
   ○ Most direct form of revenue leakage.
   ● Downgrades (Involuntary Revenue Churn)
   ○ Paying users who reduce plan tier or seat count.
   ○ Example: Enterprise → Pro, 20 seats → 5 seats.
   ● Payment Failures (Involuntary Churn)
   ○ Failed credit card charges / billing errors.
   ○ Leads to automatic cancellations if unresolved.
   ● Inactive Paying Accounts (Silent Churn Risk)
   ○ Users are still paying but inactive (engagement near zero).
   ○ Not lost revenue yet, but flagged as likely to churn → projected leakage.
2. Data Required
   ● Billing Data (Stripe, Recurly, Paddle, etc.):
   ○ Active subscriptions, cancellations, downgrades, failed payments.
   ● Product Usage Data:
   ○ Activity drop-offs (to project future churn leakage).
   ● Account Metadata:
   ○ Plan tiers, seat counts, MRR/ARR per account.
3. How It’s Calculated (Math)
   A. Gross Revenue Churn
   Gross Revenue Churn Rate = (MRR lost from cancellations + downgrades ÷ MRR at start of period) × 100
   B. Net Revenue Churn
   Net Revenue Churn Rate = (MRR lost – Expansion MRR ÷ MRR at start of period) × 10000
   (Expansion MRR comes from upgrades/add-ons, but since focus = churn, we highlight it only to adjust leakage totals.)

C. Involuntary Churn (Payment Failures)
Involuntary Churn Rate = (MRR lost from failed payments ÷ MRR at start of period) × 100
D. Silent Churn Projection
● Identify paying accounts with Health Score <40 + no login in 30 days.
● Projected Leakage = Number of at-risk paying accounts × ARPU 4. How It’s Visualized in the Dashboard
● Revenue Leakage Breakdown
○ Pie/stacked chart: % of lost revenue from cancellations vs downgrades vs failed payments.
○ Example: “Last month: $12,000 MRR lost → 60% cancellations, 25% downgrades, 15% billing failures.”
● Cohort Leakage
○ Compare revenue churn across segments (e.g., enterprise vs SMB, channel acquired from, plan tier).
● Silent Churn Tracker
○ Shows future risk: “$7,500 MRR at risk from inactive accounts.”

5. Why It Matters
   ● Dollar-first view: Puts churn in financial terms for leadership/investors.
   ● Prioritization: Teams can focus on the biggest $$ leaks first.
   ● Early Warning: Detects silent churn before it shows up in billing.
   ● Alignment: Easier to rally product, CS, and finance around reducing revenue loss.

6. Example Use Cases
   ● Cancellations: 8 enterprise accounts cancelled in Q2 → $22,000 MRR lost.
   ● Downgrades: 12 Pro accounts downgraded to Basic → $6,400 MRR lost.
   ● Payment Failures: 30 accounts lost from failed renewals → $1,800 MRR lost.
   ● Silent Churn Risk: $5,500 MRR flagged from inactive but still-paying accounts.
7. Technical Build Needed
   ● Attribution Engine: Ties churn events to $$ lost.
   ● Billing Integrations: Pull cancellations, downgrades, payment failures.
   ● Projection Logic: Flags at-risk accounts before churn hits billing.
   ● Dashboard Module: Visual breakdown of revenue leakage by type + cohort.

Churn by Channel
Feature 8: Churn by Channel
This feature breaks down churn based on where customers came from — ads, organic search, referrals, partnerships, etc. It helps founders understand not just how many customers each channel brought in, but how many stayed vs. churned.

1. What It Tracks
   ● Acquisition Source
   ○ UTM parameters (Google Ads, Meta Ads, LinkedIn, etc.).
   ○ Referral codes or partner IDs.
   ○ Organic signups (search, direct traffic).
   ● Churn Outcomes by Source
   ○ of paying customers acquired from each channel.
   ○ and % of those customers who churned (cancellations, downgrades).
   ○ MRR/ARR lost per channel.
2. How It’s Calculated (Math)
   A. Channel Churn Rate
   Churn Rate (per channel) = (Paying users from channel who churned ÷ Total paying users acquired from channel) × 100
   B. Revenue Leakage by Channel
   Revenue Lost (per channel) = Sum of MRR lost from churned accounts in that channel

C. Lifetime Value (LTV) by Channel
LTV = Total revenue generated by accounts from channel ÷ Number of accounts acquired from channel

Comparing LTV vs. Churn Rate across channels shows which acquisition sources produce profitable, long-lasting customers.

3. How It’s Visualized in the Dashboard
   ● Channel Comparison Table
   Channel
   Users Acquired
   Churned (%)
   MRR Lost
   LTV
   Google Ads
   154
   56%
   $7,200
   $140
   Meta Ads
   120
   12%
   $900
   $310

● Bar Chart or Heatmap
○ Shows churn % and MRR lost by acquisition channel.
● Trend View
○ How channel churn rates shift over time (e.g., “Meta ads improved retention last 3 months”). 4. Why It Matters
● Optimize Spend: Founders can double down on sticky channels and cut spend on churn-heavy ones.
● Marketing Alignment: Growth teams see ROI beyond CAC → retention-adjusted CAC.
● Revenue Forecasting: Knowing which channels produce high-LTV customers makes revenue projections more accurate. 5. Example Use Cases
● Google Ads brings in high volume but poor retention (churn-heavy).
● Meta Ads brings fewer customers but very sticky ones.
● Organic search customers churn 3x less than paid channels → content marketing ROI proven.
● A new partnership channel shows a higher LTV → scale budget.

6. Technical Build Needed
   ● Acquisition Tracking: Capture UTM/referral data at signup.
   ● Data Linking: Connect acquisition source to churn/cancellation events.
   ● Revenue Attribution: Tie lost MRR back to the channel that acquired the user.
   ● Dashboard Module: Tables, charts, and filters by time period.
