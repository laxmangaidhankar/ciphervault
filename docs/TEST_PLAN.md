# SafeHouse — Software Test Plan

| | |
|---|---|
| **Project** | SafeHouse — E2EE Temporary Room Sharing Platform |
| **Document Type** | Software Test Plan |
| **Version** | 1.0 |
| **Status** | Done |
| **Technology Stack** | React, Node.js, Express.js, MongoDB, Redis, Socket.io, JWT, Web Crypto API |

---

## 1. Purpose

This document defines the testing strategy for SafeHouse, a temporary collaboration platform for securely sharing environment variables and private messages without requiring traditional user accounts.

The objective is to verify functional correctness, security, data confidentiality, authorization, automatic room expiration, reliability, and performance before production deployment.

> This document describes planned tests. Test results will be documented separately after execution.

## 2. Scope of Testing

### In Scope

- Room creation and unique room identification
- Room access-code generation and verification
- JSON room-information file export and import
- Room joining and participant management
- Environment-variable sharing and encryption
- Real-time messaging using Socket.io
- JWT authentication and room-level authorization
- Automatic room expiration after 24 hours
- MongoDB and Redis data lifecycle management
- API validation and error handling
- Performance, concurrency, and recovery testing
- Production configuration and deployment readiness

### Out of Scope

- Formal third-party security certification
- Independent cryptographic implementation audits
- Testing infrastructure that is not controlled by the project
- Claims of production capacity before load testing
- Compliance certification unless separately undertaken

## 3. Test Environment

Testing will initially be performed in a local development environment, followed by a dedicated staging environment configured similarly to production.

| Component | Test configuration |
|---|---|
| Frontend | React application using a production build for deployment checks |
| Backend | Node.js and Express.js |
| Database | Dedicated MongoDB test database |
| Cache / temporary state | Dedicated Redis test instance |
| Real-time communication | Socket.io client and server |
| Authentication | JWT and configured cookie/session mechanism |
| Encryption | Web Crypto API in supported browsers |
| API testing | Supertest |
| Browser testing | Playwright |
| Load testing | Grafana k6 |
| Version control | GitHub |
| Continuous integration | GitHub Actions, when configured |

> 

## 4. Test Approach

Testing will be conducted at the following levels.

1. **Unit testing:** Validate individual functions, including input validation, encryption helpers, key management, and expiry calculations.
2. **Integration testing:** Verify interaction between API routes, authentication, MongoDB, Redis, and Socket.io.
3. **End-to-end testing:** Validate complete user workflows through the browser.
4. **Security testing:** Attempt unauthorized access, invalid authentication, input abuse, and secret leakage.
5. **Performance testing:** Measure latency, error rates, throughput, and resource consumption under increasing load.
6. **Reliability testing:** Verify recovery from service restarts, connection failures, and interrupted requests.
7. **Regression testing:** Re-run existing tests after changes to ensure previously working features remain functional.

## 5. Functional Test Cases

### 5.1 Room Lifecycle

| ID | Test scenario | Expected result |
|---|---|---|
| TC-ROOM-001 | Create a room with valid inputs | Room is created successfully |
| TC-ROOM-002 | Create multiple rooms concurrently | Room identifiers remain unique |
| TC-ROOM-003 | Submit invalid room details | Request is rejected with a suitable error |
| TC-ROOM-004 | Verify room expiration timestamp | Expiration matches the configured 24-hour policy |
| TC-ROOM-005 | Access a room after expiration | Protected operations are rejected |
| TC-ROOM-006 | Attempt to reactivate an expired room | Unauthorized reactivation is rejected |
| TC-ROOM-007 | Retrieve a nonexistent room | A suitable not-found response is returned |

### 5.2 Room Access and Authentication

| ID | Test scenario | Expected result |
|---|---|---|
| TC-AUTH-001 | Join with valid room credentials | Authorized participant joins |
| TC-AUTH-002 | Join using an incorrect access code | Access is denied |
| TC-AUTH-003 | Join with missing credentials | Request is rejected |
| TC-AUTH-004 | Submit an expired JWT | Protected access is denied |
| TC-AUTH-005 | Submit a malformed or tampered JWT | Authentication fails safely |
| TC-AUTH-006 | Access another room by modifying its ID | Access is denied without valid authorization |
| TC-AUTH-007 | Re-enter after clearing browser storage | The documented re-entry flow works securely |
| TC-AUTH-008 | Attempt repeated access-code guesses | Configured rate limits or other brute-force controls apply |

### 5.3 JSON Room-Information File

| ID | Test scenario | Expected result |
|---|---|---|
| TC-JSON-001 | Export valid room information | A valid JSON file is generated |
| TC-JSON-002 | Import a valid JSON file | Room information is parsed correctly |
| TC-JSON-003 | Import malformed JSON | Import is rejected safely |
| TC-JSON-004 | Import a file with missing required fields | Validation rejects the file |
| TC-JSON-005 | Import an oversized file | Configured size limits are enforced |
| TC-JSON-006 | Inspect exported file contents | Plaintext secrets and sensitive keys are not exposed |
| TC-JSON-007 | Attempt to use a leaked room file alone | The file does not grant unintended access |

### 5.4 Environment-Variable Sharing and Encryption

| ID | Test scenario | Expected result |
|---|---|---|
| TC-ENC-001 | Encrypt and decrypt test environment data | Original data is recovered correctly |
| TC-ENC-002 | Decrypt using an incorrect key | Decryption fails safely |
| TC-ENC-003 | Modify encrypted data before decryption | Integrity verification fails |
| TC-ENC-004 | Store encrypted environment data | Sensitive values are not stored in plaintext |
| TC-ENC-005 | Inspect API responses and logs | Sensitive plaintext and keys are not leaked |
| TC-ENC-006 | Test empty, malformed, and large environment files | Input is handled according to documented limits |
| TC-ENC-007 | Test the intended key-sharing workflow | Authorized participants can decrypt; unauthorized parties cannot |

>

### 5.5 Real-Time Collaboration

| ID | Test scenario | Expected result |
|---|---|---|
| TC-SOCK-001 | Connect two authorized participants | Both join the correct room |
| TC-SOCK-002 | Send a chat message | Authorized room members receive the message |
| TC-SOCK-003 | Connect users to different rooms | Messages remain isolated between rooms |
| TC-SOCK-004 | Disconnect and reconnect a participant | Reconnection follows the intended authentication flow |
| TC-SOCK-005 | Attempt unauthorized socket room joining | The operation is rejected |
| TC-SOCK-006 | Send events after room expiration | Protected operations are rejected |
| TC-SOCK-007 | Disconnect or remove a participant | Membership state is updated correctly |

### 5.6 Expiration and Data Cleanup

| ID | Test scenario | Expected result |
|---|---|---|
| TC-EXP-001 | Create a room with a short test expiration | Expiration is detected as expected |
| TC-EXP-002 | Observe connected clients at expiration | Clients receive the room-expired event |
| TC-EXP-003 | Access an expired room before cleanup executes | Backend authorization rejects access |
| TC-EXP-004 | Inspect MongoDB after cleanup | Intended room and related records are removed |
| TC-EXP-005 | Inspect Redis after cleanup | Relevant temporary keys are deleted or invalidated |
| TC-EXP-006 | Restart the backend with expired rooms present | Expired rooms remain inaccessible and cleanup resumes |
| TC-EXP-007 | Simulate a cleanup failure | Failure is logged and recovery or retry behavior works |
| TC-EXP-008 | Execute cleanup more than once | Repeated execution does not corrupt data |



## 6. Security Test Cases

The following security checks will be performed in an isolated environment.

| ID | Security scenario | Expected result |
|---|---|---|
| TC-SEC-001 | Submit unexpected or oversized API input | Input is rejected within configured limits |
| TC-SEC-002 | Attempt NoSQL injection through request fields | Input cannot bypass query or authorization logic |
| TC-SEC-003 | Attempt cross-room data access | No unauthorized data is returned or modified |
| TC-SEC-004 | Inspect logs, errors, and responses | Tokens, access codes, secrets, and encryption keys are not exposed |
| TC-SEC-005 | Test missing or invalid origin where applicable | CORS and browser security policy behave as configured |
| TC-SEC-006 | Verify cookie settings | Appropriate HttpOnly, Secure, and SameSite settings are used |
| TC-SEC-007 | Test authentication and authorization on every protected endpoint | No route bypasses access controls |
| TC-SEC-008 | Test expired and revoked credentials where supported | Invalid credentials cannot continue protected access |
| TC-SEC-009 | Test replayed or modified encrypted payloads | Integrity and authorization checks prevent acceptance where required |
| TC-SEC-010 | Review dependencies and configuration | Known vulnerable dependencies and unsafe production defaults are investigated |



## 7. Performance and Load Testing

Performance tests will be executed against a dedicated staging environment.

### Planned test stages

| Stage | Example concurrent users | Purpose |
|---|---|---|
| Smoke | 1 | Confirm basic functionality |
| Baseline | 10 | Establish normal latency and resource use |
| Moderate load | 25 | Observe concurrent room activity |
| Increased load | 50 | Identify emerging bottlenecks |
| Stress test | Gradually increase beyond normal load | Find failure limits and recovery behavior |



### Metrics to measure

- HTTP response latency at p50, p95, and p99
- HTTP error rate and throughput
- WebSocket connection success and message-delivery latency
- Unexpected socket disconnections
- Node.js CPU, memory, and event-loop delay
- MongoDB query latency and connection-pool utilization
- Redis latency, memory usage, and connection count
- Cleanup execution duration and backlog

### Initial acceptance targets

The following are provisional targets to validate or revise for the intended deployment.

- API p95 latency below 500 ms under the agreed normal test load.
- HTTP error rate below 1% under the agreed normal test load.
- No cross-room data leakage during concurrent operations.
- No unhandled application crash during the agreed sustained-load test.
- Service recovers after test load is reduced or a recoverable dependency outage ends.



## 8. Reliability and Recovery Testing

| ID | Test scenario | Expected result |
|---|---|---|
| TC-REL-001 | Temporarily stop MongoDB in staging | Application fails safely and recovers when the database returns |
| TC-REL-002 | Temporarily stop Redis in staging | Application follows its documented failure policy |
| TC-REL-003 | Restart the backend | Service starts cleanly and protected data remains protected |
| TC-REL-004 | Interrupt a client connection during a request | The result remains consistent or the failure is handled safely |
| TC-REL-005 | Run overlapping cleanup executions | No unsafe duplicate processing or data corruption occurs |
| TC-REL-006 | Execute graceful server shutdown | Workers, sockets, and database connections shut down cleanly |
| TC-REL-007 | Run a sustained test | Memory and resource usage remain within defined limits |

## 9. Test Data and Safety

- Use synthetic room contents and disposable credentials.
- Use separate MongoDB and Redis resources for automated tests.
- Keep secrets out of source control, test reports, screenshots, and logs.
- Reset test data between runs when required.
- Use short expiration intervals only in test configuration.
- Never execute destructive cleanup tests against production data.
- Record dependency versions, environment configuration, test date, and relevant workload details.

## 10. Defect Classification

| Severity | Definition |
|---|---|
| **Critical** | Confirmed severe confidentiality breach, unauthorized cross-room secret access, or equivalent critical security failure |
| **High** | Major security, authentication, data deletion, or core workflow failure |
| **Medium** | Significant feature malfunction with a workaround |
| **Low** | Minor UI, usability, or noncritical validation issue |


## 11. Entry and Exit Criteria

### Entry criteria

- Application builds successfully.
- Required test dependencies and environment variables are configured.
- Dedicated test databases and Redis resources are available.
- Synthetic test data is prepared.
- The features under test are implemented sufficiently to evaluate.

### Exit criteria

- All critical functional and security scenarios have been executed.
- No unresolved critical or high-severity defects remain before release.
- Required automated tests pass.
- Expired-room access denial and intended data cleanup have been verified.
- Load-test results are recorded against agreed acceptance criteria.
- Known limitations and residual risks are documented.


## 12. Test Reporting

Execution results will be recorded in `docs/TEST_REPORT.md`.

Each executed test should include:

- Test case ID
- Execution date
- Environment and application version
- Preconditions and test data
- Expected result
- Actual result
- Status: **PASS**, **FAIL**, **BLOCKED**, or **NOT RUN**
- Defect or issue reference, where applicable

## 13. References

- OWASP Web Security Testing Guide: [https://owasp.org/www-project-web-security-testing-guide/](https://owasp.org/www-project-web-security-testing-guide/)
- Vitest: [https://vitest.dev/](https://vitest.dev/)
- Supertest: [https://github.com/ladjs/supertest](https://github.com/ladjs/supertest)
- Playwright: [https://playwright.dev/](https://playwright.dev/)
- Grafana k6: [https://grafana.com/docs/k6/latest/](https://grafana.com/docs/k6/latest/)
- GitHub Actions: [https://docs.github.com/en/actions](https://docs.github.com/en/actions)

---

**Document status:** This is the planned test scope. Individual tests must be executed and their outcomes documented before the project can claim that the corresponding requirements have been verified.
