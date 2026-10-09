# SafeHouse — k6 Health Endpoint Test Report

| | |
|---|---|
| **Project** | SafeHouse — E2EE Temporary Room Sharing Platform |
| **Document Type** | Load Test Report (k6 — health endpoint) |
| **Related Documents** | `docs/TEST_PLAN.md` §7 · `docs/TEST_REPORT.md` §3 |

---

## Test Configuration

| Field | Value |
|---|---|
| **Tool** | Grafana k6 v2.2.0 |
| **Test date** | 9 October 2026 |
| **Environment** | Local Windows development environment |
| **Virtual users** | 1 |
| **Duration** | 30 seconds |
| **Test script** | `test/load-tests/api-load.js` |
| **Endpoint** | Health endpoint — verify the exact URL used before publishing |

---

## Results

| Metric | Result |
|---|---|
| Total HTTP requests | 64,666 |
| Checks succeeded | 64,666 (100%) |
| Checks failed | 0 |
| HTTP request failure rate | 0.00% |
| Average response time | 0.359 ms |
| Median response time | 0.508 ms |
| p90 response time | 0.742 ms |
| p95 response time | 0.845 ms |
| Maximum response time | 11.67 ms |
| Average request rate | 2,155.51 requests/second |

---

## Thresholds

| Threshold | Result |
|---|---|
| HTTP request failure rate below 1% | ✅ PASS (0.00%) |
| p95 response time below 500 ms | ✅ PASS (0.845 ms) |
| Expected HTTP status check passed | ✅ PASS (100% of checks) |

---

## Conclusion

The health endpoint test completed successfully with one virtual user over 30 seconds. All recorded HTTP checks succeeded, and both configured thresholds passed.

