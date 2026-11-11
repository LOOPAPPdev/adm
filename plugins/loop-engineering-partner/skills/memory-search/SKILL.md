---
name: memory-search
description: This skill should be used when the user asks to "recall", "use our project memory", "search previous decisions", "resume work" or when an architecture decision depends on established LOOP context.
---
# Read-only project RAG
Use the loop-project-memory MCP tool memory_search with a specific query when available. Fallback: node ${CLAUDE_PLUGIN_ROOT}/scripts/memory-search.mjs search "query" --limit 5.
Returned snippets include source file and line range. Cite this provenance. Memory entries describe previously expressed decisions and assumptions, not current repository truth: verify with source files, Git and approved ADRs. Missing hits do not imply that the project has no such information.
No remote index, embeddings, telemetry or external calls. Do not index secrets, clients' private data or personal health information. Ask for approved redacted source documents before adding new material. Record provenance and status in memory/PROJECT_MEMORY.md. Do not silently make memory facts override newer verified code.
