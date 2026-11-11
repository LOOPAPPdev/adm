# Memory retrieval policy

The plugin ships local, read-only retrieval-augmented context. memory-search.mjs ranks sections of Markdown under this directory using normalized word overlap. This is **lexical RAG**, not embeddings, a remote vector database, continuous memory synchronization or ChatGPT's private account memory.

The curated memory is a public-repository-safe summary from prior user directions. It may become stale. Each returned record includes source_path and start_line/end_line for verification. Project repository files and approved decisions have higher authority than the memory summary. No secrets, private customer details, health data or personally identifying information should enter this folder.

Use the MCP server tool memory_search or the local CLI; query a specific requirement before design. Update through reviewed pull requests with provenance and date. Add approved source-document paths rather than copying sensitive contents. Re-run verification after changing memory.
