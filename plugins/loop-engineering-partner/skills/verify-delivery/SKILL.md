---
name: verify-delivery
description: This skill should be used when asked "verify", "audit", "review PR", "prepare deploy", "check before merge", or "report implementation state".
---
# Verification and handoff
Run deterministic validation before narrative judgment. Check branch and clean/dirty state. Confirm exact tests rather than relying on plans. Ask verification-reviewer for independent findings when available. Verify generated .open-next/worker.js only after a real OpenNext build. Include accessibility and cross-device state tests for business features. Classify every check as PASS, FAIL, BLOCKED or NOT RUN, include the command and observed output. Use Given-When-Then scenarios. No merge or deploy absent explicit authorization. Update docs/deployment/DEPLOY_MEMORY.md only with observed deployment data; never invent a deployed URL or timestamp.
