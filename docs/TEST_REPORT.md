# SafeHouse — Test Report

| | |
|---|---|
| **Project** | SafeHouse — E2EE Temporary Room Sharing Platform |
| **Document Type** | Test Report (execution results) |
| **Version** | 1.0 |
| **Status** | PASS |
| **Companion Document** | `docs/TEST_PLAN.md` |




## 2. Test Case Results

Record one row per executed test case from `docs/TEST_PLAN.md`.

### 2.1 Functional Test Cases

#### 5.1 Room Lifecycle

| Test case ID |  |  |  | Expected result |  | Status |  |
|---|---|---|---|---|---|---|---|
| TC-ROOM-001 | | | | Room is created successfully | | PASS | |
| TC-ROOM-002 | | | | Room identifiers remain unique | | PASS | |
| TC-ROOM-003 | | | | Request is rejected with a suitable error | | PASS | |
| TC-ROOM-004 | | | | Expiration matches the configured 24-hour policy | | PASS | |
| TC-ROOM-005 | | | | Protected operations are rejected | | PASS | |
| TC-ROOM-006 | | | | A suitable not-found response is returned | | PASS | |

#### 5.2 Room Access and Authentication

| Test case ID |  |  |  | Expected result |  | Status |  |
|---|---|---|---|---|---|---|---|
| TC-AUTH-001 | | | | Authorized participant joins | | PASS | |
| TC-AUTH-002 | | | | Access is denied | | PASS | |
| TC-AUTH-003 | | | | Request is rejected | | PASS | |
| TC-AUTH-004 | | | | Access is denied without valid authorization | | PASS | |


#### 5.3 JSON Room-Information File

| Test case ID |  |  |  | Expected result |  | Status |  |
|---|---|---|---|---|---|---|---|
| TC-JSON-001 | | | | A valid JSON file is generated | | PASS | |
| TC-JSON-002 | | | | Room information is parsed correctly | | PASS | |
| TC-JSON-003 | | | | Import is rejected safely | | PASS | |
| TC-JSON-004 | | | | Validation rejects the file | | PASS | |
| TC-JSON-005 | | | | Configured size limits are enforced | | PASS | |
| TC-JSON-006 | | | | Plaintext secrets and sensitive keys are not exposed | | PASS | |

#### 5.4 Environment-Variable Sharing and Encryption

| Test case ID |  |  |  | Expected result |  | Status |  |
|---|---|---|---|---|---|---|---|
| TC-ENC-001 | | | | Original data is recovered correctly | | PASS | |
| TC-ENC-002 | | | | Sensitive values are not stored in plaintext | | PASS | |
| TC-ENC-003 | | | | Sensitive plaintext and keys are not leaked | | PASS | |
| TC-ENC-007 | | | | Authorized participants can decrypt; unauthorized parties cannot | | PASS | |

#### 5.5 Real-Time Collaboration

| Test case ID |  |  |  | Expected result |  | Status | |
|---|---|---|---|---|---|---|---|
| TC-SOCK-001 | | | | Both join the correct room | | PASS | |
| TC-SOCK-002 | | | | Authorized room members receive the message | | PASS | |
| TC-SOCK-003 | | | | Messages remain isolated between rooms | | PASS | |
| TC-SOCK-004 | | | | Reconnection follows the intended authentication flow | | PASS | |

#### 5.6 Expiration and Data Cleanup

| Test case ID |  |  |  | Expected result |  | Status | Defect ref |
|---|---|---|---|---|---|---|---|
| TC-EXP-001 | | | | Expiration is detected as expected | | PASS | |
| TC-EXP-002 | | | | Clients receive the room-expired event | | PASS | |
| TC-EXP-003 | | | | Backend authorization rejects access | | PASS | |
| TC-EXP-004 | | | | Intended room and related records are removed | | PASS | |
| TC-EXP-005 | | | | Relevant temporary keys are deleted or invalidated | | PASS | |
| TC-EXP-006 | | | | Expired rooms remain inaccessible and cleanup resumes | | PASS | |
| TC-EXP-007 | | | | Failure is logged and recovery or retry behavior works | | PASS | |

### 2.2 Security Test Cases

| Test case ID |  |  |  | Expected result |  | Status | Defect ref |
|---|---|---|---|---|---|---|---|
| TC-SEC-001 | | | | Input is rejected within configured limits | | PASS | |
| TC-SEC-002 | | | | Input cannot bypass query or authorization logic | | PASS | |
| TC-SEC-003 | | | | No unauthorized data is returned or modified | | PASS | |
| TC-SEC-004 | | | | Tokens, access codes, secrets, and encryption keys are not exposed | | PASS | |
| TC-SEC-005 | | | | CORS and browser security policy behave as configured | | PASS | |
| TC-SEC-006 | | | | Appropriate HttpOnly, Secure, and SameSite settings are used | | PASS | |
| TC-SEC-007 | | | | No route bypasses access controls | | PASS | |

### 2.3 Reliability and Recovery Test Cases

| Test case ID |  |  |  | Expected result |  | Status | Defect ref |
|---|---|---|---|---|---|---|---|
| TC-REL-001 | | | | Application fails safely and recovers when the database returns | | PASS | |
| TC-REL-002 | | | | Application follows its documented failure policy | | PASS | |
| TC-REL-003 | | | | Service starts cleanly and protected data remains protected | | PASS | |
| TC-REL-004 | | | | The result remains consistent or the failure is handled safely | | PASS | |
| TC-REL-005 | | | | No unsafe duplicate processing or data corruption occurs | | PASS | |
| TC-REL-006 | | | | Workers, sockets, and database connections shut down cleanly | | PASS | |
| TC-REL-007 | | | | Memory and resource usage remain within defined limits | | PASS | |

---







## 3. Performance and Load Test Results

Record measured values per stage (Smoke, Baseline, Moderate, Increased, Stress) against the acceptance targets in `docs/TEST_PLAN.md` §7.

| Stage | Concurrent users | API p50 | API p95 | API p99 | Error rate | Throughput | Notes |
|---|---|---|---|---|---|---|---|
| Smoke | 1 | | | | | | |
| Baseline | 10 | | | | | | |
| Moderate load | 25 | | | | | | |
| Increased load | 50 | | | | | | |
| Stress test | (gradual increase) | | | | | | |

### Additional load metrics

| Metric | Result | Notes |
|---|---|---|
| Node.js CPU / memory / event-loop delay | | |
| MongoDB query latency / connection-pool utilization | | |
| Redis latency / memory / connection count | | |
| Cleanup execution duration and backlog | | |

### Acceptance target assessment

| Target | Met? (Yes/No) | Evidence |
|---|---|---|
| API p95 latency below 500 ms under agreed normal load | | |
| HTTP error rate below 1% under agreed normal load | | |
| No cross-room data leakage during concurrent operations | | |
| No unhandled application crash during sustained-load test | | |
| Service recovers after load reduction / dependency outage ends | | |

---






## SafeHouse — k6 Health Endpoint Test Report
Test Configuration









## 5. Sign-off

| Role | Name |  | |
|---|---|---|---|
| Project owner | Laxman Gaidhankar| | |

---

