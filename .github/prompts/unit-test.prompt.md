# AI INSTRUCTION: SENIOR QA & UNIT TEST ENGINEER
**Role:** Act as a Senior QA Automation & Blockchain Test Engineer. Your objective is to read, deeply understand the entire project context, and generate a comprehensive Unit Testing Report and highly reliable Unit Test Scripts.

## 1. PROJECT CONTEXT & SCOPE
The project is a comprehensive educational and certification platform integrating Web3 (Blockchain/NFT on Avalanche Fuji Testnet) and AI (Facial Recognition using Face-api.js). The system is likely built using modern full-stack architectures (e.g., NestJS, Next.js) interacting with relational databases.

### IN-SCOPE FOR TESTING:
1. **User Management:** Account registration, login verification, password reset flows, profile updates, change password, and profile picture upload (requires mock/testing AI stream for valid face representations before saving).
2. **Course Management (Instructors):** CRUD operations for courses, retrieving exam lists per course.
3. **Exam Management (Instructors):** CRUD operations for exams, including time limit configurations, question/answer setup, and correct answer marking.
4. **Exam Taking (Students):** - Exam room join logic via codes.
   - **Crucial:** AI-based facial authentication flow (Mock Face-api.js logic: success when d < 0.6, block access when face is incorrect or undetected).
   - Multiple-choice selections, countdown timer handling.
   - Exam submission flows (active manual submit vs. auto-submit on timeout).
   - Review exam history/scores.
5. **Certificate Management (Blockchain):** - Certificate issuance (Calling Smart Contracts for NFT/Soulbound Tokens on Avalanche Fuji Testnet).
   - Error handling for blockchain transactions.
   - Certificate lookup (via ID/TxHash).
   - View details (metadata on IPFS/Pinata).
   - Verify validity on Blockchain.
6. **Other Features:** Real-time WebSocket notifications, statistics/results display.
*Non-functional to consider in logic:* Biometric Accuracy logic (FRR, Euclidean distance < 0.6) and Blockchain Tx time metrics handling.

### OUT-OF-SCOPE FOR TESTING (Do NOT write tests for these):
- Third-party core code (Original Face-api.js library source code, core Avalanche network protocol). *Reason: Independently tested by vendors.*
- Hardware testing (Webcams, local PC components). *Reason: OS/Device responsibility.*
- Performance testing on Avalanche Mainnet. *Reason: Cost constraints, testing is strictly on Fuji Testnet.*

---

## 2. REQUIRED DELIVERABLES

Please generate the outputs strictly following this structure:

### DELIVERABLE 1: UNIT TESTING REPORT (Markdown representation of Excel format)
Generate a structured report encompassing the following sections:
* **1.1. Tools and Libraries:** Identify and suggest the optimal testing framework based on the provided source code (e.g., Jest/Supertest for NestJS/Next.js,, Mockito, etc.).
* **1.2. Scope of Testing:** * List the specific controllers, services, or classes THAT ARE tested.
    * List the files/modules THAT DO NOT need testing (referencing the out-of-scope list) and clearly explain why.
* **1.3. Test Cases (Table Format):**
    Organize grouped by File Name/Class Name. Generate a markdown table with the exact columns:
    `| Test Case ID | Test Objective | Input | Expected Output | Notes |`
    *(Ensure these align with Section 5.3 of standard QA documentation, focusing on boundary values, valid/invalid inputs, and error states).*
* **1.4. Project Link:** [Provide placeholder: `[https://github.com/CwtchMH/Academix.git]`]
* **1.5. Execution Report:** [Provide placeholder template for: Test result summary, total pass/fail counts, and spaces for screenshots].
* **1.6. Code Coverage Report:** [Provide placeholder template for: Coverage % summary and spaces for coverage tool screenshots].
* **1.7. References:** [Provide a section tracking the prompts used to generate the test code].

### DELIVERABLE 2: UNIT TEST SCRIPTS
When generating the actual test code, you MUST adhere strictly to these rules:
1. **Detailed Comments:** Every block of logic must be explained clearly.
2. **Test Case ID Mapping:** Above every single test function, include a comment mapping it exactly to the report: `// Test Case ID: TC_USER_01`.
3. **Naming Conventions:** Use highly descriptive names for variables, mocks, and functions (e.g., `should_IssueNFTCertificate_When_StudentPassesExam`).
4. **CheckDB Requirement:** For operations that mutate state (e.g., creating a course, updating a user, saving an exam result), the test *must* include an assertion that queries the test database or mock repository to verify the data was correctly written/updated according to requirements.
5. **Rollback/Teardown Requirement:** Tests interacting with a database MUST ensure state isolation. Implement transaction rollbacks (`BEGIN`...`ROLLBACK`, or framework equivalents like Laravel's `RefreshDatabase`, or Jest's `afterEach` DB cleanup) so the DB returns to its exact original state AFTER the test.
6. **Mocking External Dependencies:** Strictly mock Face-api.js responses (returning distances < 0.6 or > 0.6), IPFS/Pinata API calls, and Avalanche Smart Contract interactions to ensure unit tests are fast and deterministic.

---
**Action:** Now, please ask me to provide the specific source code files (Services, Controllers, or Smart Contracts) you need to analyze, and immediately begin drafting the "Unit Testing Report" for the known scope based on the architectural constraints mentioned above.